use anchor_lang::prelude::*;

declare_id!("GNmXt5Lp6RXYyZKCpTBvcv5oPiEh2TzgSPiL9h43uBa3");


const PLAYER_XP_INIT: u32 = 1000;
const PLAYER_ATTRIBUTES_INIT: [u32; 3] = [0, 0, 0];

#[error_code]
pub enum ErrorCode {
    #[msg("Not enough xp")]
    NotEnoughXP,

    #[msg("Only owner!")]
    OnlyOwner,
}


#[program]
pub mod castagne_backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.owner = *ctx.accounts.owner.key;
        Ok(())
    }

    pub fn create_player(ctx: Context<CreatePlayer>, username: String) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.user = *ctx.accounts.user.key;
        player.username = username;
        player.attributes = PLAYER_ATTRIBUTES_INIT;
        player.xp = PLAYER_XP_INIT;

        msg!(
            "Player '{}' created with xp {} and attributes {:?}!",
            player.username,
            player.xp,
            player.attributes
        );
        Ok(())
    }

    pub fn update_player(ctx: Context<UpdatePlayer>, attributes: [u32; 3]) -> Result<()> {
        if ctx.accounts.user.is_signer {
            msg!("User {} is the signer", *ctx.accounts.user.key);
        }

        let player = &mut ctx.accounts.player;
        let attributes_total: u32 = attributes.iter().sum();
        let player_attributes: u32 = player.attributes.iter().sum();
        let player_xp_total: u32 = player.xp + player_attributes;

        if player_xp_total < attributes_total {
            return err!(ErrorCode::NotEnoughXP);
        }

        // Reset xp
        player.xp += player_attributes;

        // 0 Speed ​
        // 1 Strength
        // 2 Robustness
        player.attributes = attributes;

        // Update xp
        player.xp -= attributes_total;

        msg!(
            "Player '{}' updated with attributes {:?}!",
            player.username,
            player.attributes
        );
        Ok(())
    }

    pub fn update_player_xp(ctx: Context<UpdatePlayerXP>, xp: u32) -> Result<()> {
        let config = &ctx.accounts.config;
        let player = &mut ctx.accounts.player;

        if *ctx.accounts.owner.key != config.owner {
            return err!(ErrorCode::OnlyOwner);
        }

        player.xp = xp;

        msg!(
            "Player '{}' updated with xp {} !",
            player.username,
            player.xp,
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + 32,
        seeds = [b"config", owner.key().as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + std::mem::size_of::<Player>(),
        seeds = [b"player", user.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdatePlayer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", user.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, Player>,
}


#[derive(Accounts)]
pub struct UpdatePlayerXP<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub user: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"player", user.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, Player>,

    #[account(
        seeds = [b"config", owner.key().as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}



#[account]
// #[derive(Default)]
pub struct Player {
    pub user: Pubkey,
    pub username: String,
    pub attributes: [u32; 3],
    pub xp: u32,
}


#[account]
pub struct Config {
    pub owner: Pubkey,
}