use crate::badge::state::BadgeGlobal;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeeBadgeGlobal<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + BadgeGlobal::INIT_SPACE,
        seeds = [
            "badge_global".as_bytes()
        ],
        bump,
    )]
    pub badge_global: Account<'info, BadgeGlobal>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK:
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_initializee_badge_global(
    ctx: Context<InitializeeBadgeGlobal>,
    uri: String,
) -> Result<()> {
    let global = &mut ctx.accounts.badge_global;

    **global = BadgeGlobal {
        counter: 1,
        owner: ctx.accounts.owner.key(),
        base_uri: uri,
    };

    Ok(())
}
