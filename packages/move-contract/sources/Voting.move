module lnmhacks::Voting {
    use std::signer;
    use std::vector;
    use std::string;
    use std::error;

    struct Vote has copy, drop, store {
        voter_address: address,
        choice: string::String,
    }

    struct Voter has copy, drop, store {
        voter_name: string::String,
        voted: bool,
    }

    struct Voting has key {
        total_voter: u64,
        total_vote: u64,
        choice_count: u64,
        ballot_official_address: address,
        ballot_official_name: string::String,
        proposal: string::String,
        choices: vector<string::String>,
        votes: vector<Vote>,
    }

    public fun initialize(owner: &signer, ballot_official_name: string::String, proposal: string::String) {
        let owner_address = signer::address_of(owner);
        move_to(owner, Voting {
            total_voter: 0,
            total_vote: 0,
            choice_count: 0,
            ballot_official_address: owner_address,
            ballot_official_name,
            proposal,
            choices: vector::empty<string::String>(),
            votes: vector::empty<Vote>(),
        });
    }

    public fun add_choice(owner: &signer, choice: string::String) acquires Voting {
        let voting = borrow_global_mut<Voting>(signer::address_of(owner));
        assert!(signer::address_of(owner) == voting.ballot_official_address, error::permission_denied(1));
        vector::push_back(&mut voting.choices, choice);
        voting.choice_count = voting.choice_count + 1;
    }

    public fun vote(owner: &signer, choice: string::String) acquires Voting {
        let voting = borrow_global_mut<Voting>(signer::address_of(owner));
        let voter_address = signer::address_of(owner);
        let vote = Vote { voter_address, choice };
        vector::push_back(&mut voting.votes, vote);
        voting.total_vote = voting.total_vote + 1;
    }
}