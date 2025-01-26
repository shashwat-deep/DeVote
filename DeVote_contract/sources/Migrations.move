module lnmhacks::Migrations {
    use std::signer;
    use std::error;

    struct Migrations has key {
        owner: address,
        last_completed_migration: u64,
    }

    public fun initialize(owner: &signer) {
        let owner_address = signer::address_of(owner);
        move_to(owner, Migrations {
            owner: owner_address,
            last_completed_migration: 0,
        });
    }

    public fun set_completed(owner: &signer, completed: u64) acquires Migrations {
        let migrations = borrow_global_mut<Migrations>(signer::address_of(owner));
        assert!(signer::address_of(owner) == migrations.owner, error::permission_denied(1));
        migrations.last_completed_migration = completed;
    }
}