/// DeVote — on-chain ballot for decentralized voting on Aptos.
///
/// A `Ballot` resource lives under the *ballot official's* account. The official
/// registers eligible voters and choices while the ballot is in the `CREATED`
/// state, starts voting (`VOTING`), and ends it (`ENDED`). Registered voters cast
/// exactly one vote each while voting is open. Tallies are read via `#[view]`
/// functions so the frontend never needs to scan raw transactions.
module devote::voting {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::event;

    // ───────────────────────── States ─────────────────────────
    const STATE_CREATED: u8 = 0;
    const STATE_VOTING: u8 = 1;
    const STATE_ENDED: u8 = 2;

    // ──────────────────────── Error codes ────────────────────────
    /// A ballot already exists under this account.
    const E_BALLOT_EXISTS: u64 = 1;
    /// No ballot exists under the given account.
    const E_NO_BALLOT: u64 = 2;
    /// The operation is not allowed in the ballot's current state.
    const E_WRONG_STATE: u64 = 3;
    /// The caller is not a registered voter for this ballot.
    const E_NOT_REGISTERED: u64 = 4;
    /// The voter has already cast a vote.
    const E_ALREADY_VOTED: u64 = 5;
    /// The provided choice does not exist on this ballot.
    const E_INVALID_CHOICE: u64 = 6;
    /// The choice/voter being added already exists.
    const E_DUPLICATE: u64 = 7;
    /// A required text field was empty, or voting was started with no choices/voters.
    const E_EMPTY: u64 = 8;

    // ───────────────────────── Data model ─────────────────────────
    struct Voter has store, drop, copy {
        name: String,
        voted: bool,
    }

    struct Ballot has key {
        official: address,
        official_name: String,
        proposal: String,
        state: u8,
        choices: vector<String>,
        /// choice -> running vote count
        tally: SimpleMap<String, u64>,
        /// voter address -> registration record
        voters: SimpleMap<address, Voter>,
        total_voter: u64,
        total_vote: u64,
    }

    // ─────────────────────────── Events ───────────────────────────
    #[event]
    struct BallotCreated has drop, store {
        official: address,
        official_name: String,
        proposal: String,
    }

    #[event]
    struct ChoiceAdded has drop, store {
        official: address,
        choice: String,
    }

    #[event]
    struct VoterRegistered has drop, store {
        official: address,
        voter: address,
    }

    #[event]
    struct VotingStarted has drop, store {
        official: address,
    }

    #[event]
    struct VoteCast has drop, store {
        official: address,
        voter: address,
        choice: String,
    }

    #[event]
    struct VotingEnded has drop, store {
        official: address,
        total_vote: u64,
    }

    // ──────────────────────── Entry functions ────────────────────────

    /// Create a new ballot under the signer's account.
    public entry fun create_ballot(official: &signer, official_name: String, proposal: String) {
        let addr = signer::address_of(official);
        assert!(!exists<Ballot>(addr), error::already_exists(E_BALLOT_EXISTS));
        assert!(!string::is_empty(&official_name), error::invalid_argument(E_EMPTY));
        assert!(!string::is_empty(&proposal), error::invalid_argument(E_EMPTY));

        move_to(
            official,
            Ballot {
                official: addr,
                official_name,
                proposal,
                state: STATE_CREATED,
                choices: vector::empty<String>(),
                tally: simple_map::new<String, u64>(),
                voters: simple_map::new<address, Voter>(),
                total_voter: 0,
                total_vote: 0,
            },
        );

        event::emit(BallotCreated { official: addr, official_name, proposal });
    }

    /// Add a selectable choice. Only valid while the ballot is in CREATED state.
    public entry fun add_choice(official: &signer, choice: String) acquires Ballot {
        let addr = signer::address_of(official);
        let ballot = borrow_ballot_mut(addr);
        assert!(ballot.state == STATE_CREATED, error::invalid_state(E_WRONG_STATE));
        assert!(!string::is_empty(&choice), error::invalid_argument(E_EMPTY));
        assert!(!simple_map::contains_key(&ballot.tally, &choice), error::already_exists(E_DUPLICATE));

        simple_map::add(&mut ballot.tally, copy choice, 0);
        vector::push_back(&mut ballot.choices, copy choice);
        event::emit(ChoiceAdded { official: addr, choice });
    }

    /// Register an eligible voter. Only valid while the ballot is in CREATED state.
    public entry fun add_voter(official: &signer, voter: address, voter_name: String) acquires Ballot {
        let addr = signer::address_of(official);
        let ballot = borrow_ballot_mut(addr);
        assert!(ballot.state == STATE_CREATED, error::invalid_state(E_WRONG_STATE));
        assert!(!string::is_empty(&voter_name), error::invalid_argument(E_EMPTY));
        assert!(!simple_map::contains_key(&ballot.voters, &voter), error::already_exists(E_DUPLICATE));

        simple_map::add(&mut ballot.voters, voter, Voter { name: voter_name, voted: false });
        ballot.total_voter = ballot.total_voter + 1;
        event::emit(VoterRegistered { official: addr, voter });
    }

    /// Open voting. Requires at least one choice and one registered voter.
    public entry fun start_voting(official: &signer) acquires Ballot {
        let addr = signer::address_of(official);
        let ballot = borrow_ballot_mut(addr);
        assert!(ballot.state == STATE_CREATED, error::invalid_state(E_WRONG_STATE));
        assert!(!vector::is_empty(&ballot.choices), error::invalid_state(E_EMPTY));
        assert!(ballot.total_voter > 0, error::invalid_state(E_EMPTY));

        ballot.state = STATE_VOTING;
        event::emit(VotingStarted { official: addr });
    }

    /// Cast a vote for `choice` on the ballot owned by `official`.
    /// Callable by any registered voter exactly once while voting is open.
    public entry fun cast_vote(voter: &signer, official: address, choice: String) acquires Ballot {
        let ballot = borrow_ballot_mut(official);
        assert!(ballot.state == STATE_VOTING, error::invalid_state(E_WRONG_STATE));

        let voter_addr = signer::address_of(voter);
        assert!(
            simple_map::contains_key(&ballot.voters, &voter_addr),
            error::permission_denied(E_NOT_REGISTERED),
        );
        assert!(
            simple_map::contains_key(&ballot.tally, &choice),
            error::invalid_argument(E_INVALID_CHOICE),
        );

        let record = simple_map::borrow_mut(&mut ballot.voters, &voter_addr);
        assert!(!record.voted, error::invalid_state(E_ALREADY_VOTED));
        record.voted = true;

        let count = simple_map::borrow_mut(&mut ballot.tally, &choice);
        *count = *count + 1;
        ballot.total_vote = ballot.total_vote + 1;

        event::emit(VoteCast { official, voter: voter_addr, choice });
    }

    /// Close voting. Only valid while the ballot is in VOTING state.
    public entry fun end_voting(official: &signer) acquires Ballot {
        let addr = signer::address_of(official);
        let ballot = borrow_ballot_mut(addr);
        assert!(ballot.state == STATE_VOTING, error::invalid_state(E_WRONG_STATE));

        ballot.state = STATE_ENDED;
        event::emit(VotingEnded { official: addr, total_vote: ballot.total_vote });
    }

    // ─────────────────────────── Views ───────────────────────────

    #[view]
    public fun ballot_exists(official: address): bool {
        exists<Ballot>(official)
    }

    #[view]
    public fun get_state(official: address): u8 acquires Ballot {
        borrow_ballot(official).state
    }

    #[view]
    /// Returns (official_name, proposal, state, total_voter, total_vote).
    public fun get_info(official: address): (String, String, u8, u64, u64) acquires Ballot {
        let ballot = borrow_ballot(official);
        (
            ballot.official_name,
            ballot.proposal,
            ballot.state,
            ballot.total_voter,
            ballot.total_vote,
        )
    }

    #[view]
    public fun get_choices(official: address): vector<String> acquires Ballot {
        borrow_ballot(official).choices
    }

    #[view]
    /// Returns parallel vectors of (choices, counts) in choice-insertion order.
    public fun get_results(official: address): (vector<String>, vector<u64>) acquires Ballot {
        let ballot = borrow_ballot(official);
        let choices = ballot.choices;
        let counts = vector::empty<u64>();
        let i = 0;
        let n = vector::length(&choices);
        while (i < n) {
            let choice = vector::borrow(&choices, i);
            vector::push_back(&mut counts, *simple_map::borrow(&ballot.tally, choice));
            i = i + 1;
        };
        (choices, counts)
    }

    #[view]
    public fun get_vote_count(official: address, choice: String): u64 acquires Ballot {
        let ballot = borrow_ballot(official);
        assert!(
            simple_map::contains_key(&ballot.tally, &choice),
            error::invalid_argument(E_INVALID_CHOICE),
        );
        *simple_map::borrow(&ballot.tally, &choice)
    }

    #[view]
    public fun is_registered(official: address, voter: address): bool acquires Ballot {
        simple_map::contains_key(&borrow_ballot(official).voters, &voter)
    }

    #[view]
    public fun has_voted(official: address, voter: address): bool acquires Ballot {
        let ballot = borrow_ballot(official);
        simple_map::contains_key(&ballot.voters, &voter)
            && simple_map::borrow(&ballot.voters, &voter).voted
    }

    // ─────────────────────── Internal helpers ───────────────────────

    inline fun borrow_ballot(official: address): &Ballot {
        assert!(exists<Ballot>(official), error::not_found(E_NO_BALLOT));
        borrow_global<Ballot>(official)
    }

    inline fun borrow_ballot_mut(official: address): &mut Ballot {
        assert!(exists<Ballot>(official), error::not_found(E_NO_BALLOT));
        borrow_global_mut<Ballot>(official)
    }
}
