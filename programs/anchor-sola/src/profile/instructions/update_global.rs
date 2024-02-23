use crate::SolaProfileGlobal;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateProfileGlobal<'info> {
    #[account(
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
        has_one = owner,
    )]
    pub sola_profile_global: Account<'info, SolaProfileGlobal>,
    pub owner: Signer<'info>,
    /// CHECK:
    pub new_owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_update_profile_global(
    ctx: Context<UpdateProfileGlobal>,
    chainid: u64,
    uri: String,
) -> Result<()> {
    let profile_global = &mut ctx.accounts.sola_profile_global;

    **profile_global = SolaProfileGlobal {
        owner: ctx.accounts.new_owner.key(),
        chainid,
        base_uri: uri,
        ..**profile_global
    };
    Ok(())
}
