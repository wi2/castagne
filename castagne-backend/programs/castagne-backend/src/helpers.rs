use anchor_lang::{prelude::*, solana_program};
use solana_program::hash::hash;
use solana_program::sysvar::clock::Clock;

pub fn generate_random_number<'info>(authority_key: &Pubkey, max: u32) -> u32 {
    let clock = Clock::get().unwrap();
    // Combine the slot and authority key to create entropy
    let mut seed = vec![];
    seed.extend_from_slice(&clock.slot.to_le_bytes());
    seed.extend_from_slice(&authority_key.to_bytes());

    // Hash the seed to create a pseudo-random number
    let hash = hash(&seed);
    let random_number = u32::from_le_bytes(hash.to_bytes()[..8].try_into().unwrap());

    // Limit the random number to the range [0, 100]
    random_number % (max + 1)
}
