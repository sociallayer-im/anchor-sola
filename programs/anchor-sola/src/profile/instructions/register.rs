use crate::{SolaProfileGlobal, TokenClass, TOKEN_SCHEMA_MAX_LEN};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct Register<'info> {
    #[account(
        mut,
        seeds = [
            "sola_profile_global".as_bytes()
        ],
        bump,
        constraint = sola_profile_global.class_counter == class_id
    )]
    pub sola_profile_global: Account<'info, SolaProfileGlobal>,
    #[account(
        init,
        payer = payer,
        space = 8 + TokenClass::INIT_SPACE,
        seeds = [
            "token_class".as_bytes(),
            &class_id.to_be_bytes(),
        ],
        bump,
    )]
    pub token_class: Account<'info, TokenClass>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct RegisterParams {
    pub fungible: bool,
    pub transferable: bool,
    pub revocable: bool,
    pub address: Pubkey,
    pub schema: String,
    pub controller: u64,
}

pub fn handle_register(
    ctx: Context<Register>,
    _class_id: u64,
    profile_id: u64,
    params: RegisterParams,
) -> Result<()> {
    require_gt!(TOKEN_SCHEMA_MAX_LEN, params.schema.len());

    *ctx.accounts.token_class = TokenClass {
        record: crate::TokenClassRecord {
            fungible: params.fungible,
            transferable: params.transferable,
            revocable: params.revocable,
        },
        address: params.address,
        schema: params.schema,
        controller: profile_id,
    };

    ctx.accounts.sola_profile_global.counter += 1;

    Ok(())
}
