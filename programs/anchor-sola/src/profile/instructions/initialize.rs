use crate::SolaProfileGlobal;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeeProfileGlobal<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + SolaProfileGlobal::INIT_SPACE,
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
    )]
    pub sola_profile_global: Account<'info, SolaProfileGlobal>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK:
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_initializee_profile_global(
    ctx: Context<InitializeeProfileGlobal>,
    chainid: u64,
    uri: String,
) -> Result<()> {
    let profile_global = &mut ctx.accounts.sola_profile_global;

    **profile_global = SolaProfileGlobal {
        counter: 1,
        class_counter: 1,
        owner: ctx.accounts.owner.key(),
        chainid,
        base_uri: uri,
    };
    Ok(())
}
