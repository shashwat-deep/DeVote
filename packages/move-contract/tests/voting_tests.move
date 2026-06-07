#[test_only]
module devote::voting_tests {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use devote::voting;

    fun str(bytes: vector<u8>): String {
        string::utf8(bytes)
    }

    #[test(official = @0xA11CE, alice = @0xA, bob = @0xB)]
    fun test_full_voting_flow(official: &signer, alice: &signer, bob: &signer) {
        let off = signer::address_of(official);
        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);

        voting::create_ballot(official, str(b"Election Board"), str(b"Best pet?"));
        assert!(voting::ballot_exists(off), 0);
        assert!(voting::get_state(off) == 0, 1);

        voting::add_choice(official, str(b"Cat"));
        voting::add_choice(official, str(b"Dog"));
        voting::add_voter(official, alice_addr, str(b"Alice"));
        voting::add_voter(official, bob_addr, str(b"Bob"));

        assert!(vector::length(&voting::get_choices(off)) == 2, 2);
        assert!(voting::is_registered(off, alice_addr), 3);
        assert!(!voting::has_voted(off, alice_addr), 4);

        voting::start_voting(official);
        assert!(voting::get_state(off) == 1, 5);

        voting::cast_vote(alice, off, str(b"Cat"));
        voting::cast_vote(bob, off, str(b"Cat"));
        assert!(voting::has_voted(off, alice_addr), 6);
        assert!(voting::get_vote_count(off, str(b"Cat")) == 2, 7);
        assert!(voting::get_vote_count(off, str(b"Dog")) == 0, 8);

        voting::end_voting(official);
        assert!(voting::get_state(off) == 2, 9);

        let (choices, counts) = voting::get_results(off);
        assert!(vector::length(&choices) == 2, 10);
        assert!(*vector::borrow(&counts, 0) == 2, 11);
        assert!(*vector::borrow(&counts, 1) == 0, 12);

        let (_name, _proposal, state, total_voter, total_vote) = voting::get_info(off);
        assert!(state == 2, 13);
        assert!(total_voter == 2, 14);
        assert!(total_vote == 2, 15);
    }

    #[test(official = @0xA11CE, alice = @0xA)]
    #[expected_failure(abort_code = 0x30005, location = devote::voting)]
    fun test_double_vote_aborts(official: &signer, alice: &signer) {
        let off = signer::address_of(official);
        voting::create_ballot(official, str(b"Board"), str(b"P?"));
        voting::add_choice(official, str(b"Cat"));
        voting::add_voter(official, signer::address_of(alice), str(b"Alice"));
        voting::start_voting(official);
        voting::cast_vote(alice, off, str(b"Cat"));
        voting::cast_vote(alice, off, str(b"Cat")); // aborts: E_ALREADY_VOTED
    }

    #[test(official = @0xA11CE, alice = @0xA, mallory = @0xBAD)]
    #[expected_failure(abort_code = 0x50004, location = devote::voting)]
    fun test_unregistered_voter_aborts(official: &signer, alice: &signer, mallory: &signer) {
        let off = signer::address_of(official);
        voting::create_ballot(official, str(b"Board"), str(b"P?"));
        voting::add_choice(official, str(b"Cat"));
        voting::add_voter(official, signer::address_of(alice), str(b"Alice"));
        voting::start_voting(official);
        voting::cast_vote(mallory, off, str(b"Cat")); // aborts: E_NOT_REGISTERED
    }

    #[test(official = @0xA11CE, alice = @0xA)]
    #[expected_failure(abort_code = 0x30003, location = devote::voting)]
    fun test_vote_before_start_aborts(official: &signer, alice: &signer) {
        let off = signer::address_of(official);
        voting::create_ballot(official, str(b"Board"), str(b"P?"));
        voting::add_choice(official, str(b"Cat"));
        voting::add_voter(official, signer::address_of(alice), str(b"Alice"));
        voting::cast_vote(alice, off, str(b"Cat")); // aborts: E_WRONG_STATE (still CREATED)
    }

    #[test(official = @0xA11CE)]
    #[expected_failure(abort_code = 0x80007, location = devote::voting)]
    fun test_duplicate_choice_aborts(official: &signer) {
        voting::create_ballot(official, str(b"Board"), str(b"P?"));
        voting::add_choice(official, str(b"Cat"));
        voting::add_choice(official, str(b"Cat")); // aborts: E_DUPLICATE
    }

    #[test(official = @0xA11CE)]
    #[expected_failure(abort_code = 0x30008, location = devote::voting)]
    fun test_start_without_choices_aborts(official: &signer) {
        voting::create_ballot(official, str(b"Board"), str(b"P?"));
        voting::start_voting(official); // aborts: E_EMPTY (no choices)
    }
}
