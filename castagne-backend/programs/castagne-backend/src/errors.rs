use anchor_lang::error_code;

#[error_code]
pub enum PlayerErrorCode {
    #[msg("Not enough xp")]
    NotEnoughXP,

    #[msg("Only owner!")]
    OnlyOwner,
}
