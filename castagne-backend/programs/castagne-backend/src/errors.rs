use anchor_lang::error_code;

#[error_code]
pub enum PlayerErrorCode {
    #[msg("Not enough xp")]
    NotEnoughXP,

    #[msg("Only owner!")]
    OnlyOwner,
}

#[error_code]
pub enum FightErrorCode {
    #[msg("Level too high!")]
    LevelTooHigh,

    #[msg("Players must be different!")]
    PlayersMustBeDifferent,
}