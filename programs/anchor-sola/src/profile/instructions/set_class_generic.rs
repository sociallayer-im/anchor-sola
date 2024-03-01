use crate::{
    profile::utils::{is_dispatcher, is_group_manager, is_owner},
    state::SolaError,
    ClassGeneric, Dispatcher, TokenClass,
};
use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;

#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct SetClassGeneric<'info> {
    #[account(
        seeds = [
            "token_class".as_bytes(),
            &class_id.to_be_bytes(),
        ],
        bump,
    )]
    pub token_class: Account<'info, TokenClass>,
    /// CHECK:
    #[account(
        mut,
        seeds = [
            "mint_profile".as_bytes(),
            &token_class.controller.to_be_bytes()[..],
        ],
        bump
    )]
    pub master_mint: UncheckedAccount<'info>,
    /// CHECK:
    pub master_token: UncheckedAccount<'info>,
    /// CHECK:
    #[account(
        seeds = [
            "dispatcher".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub dispatcher: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "default_dispatcher".as_bytes()
        ],
        bump,
    )]
    pub default_dispatcher: Account<'info, Dispatcher>,

    /// CHECK:
    #[account(
        seeds = [
            "group_controller".as_bytes(),
            master_mint.key().as_ref(),
            authority.key().as_ref()
        ],
        bump,
    )]
    group_controller: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + ClassGeneric::INIT_SPACE,
        seeds = [
            "class_generic".as_bytes(),
            token_class.key().as_ref(),
        ],
        bump,
    )]
    pub class_generic: Account<'info, ClassGeneric>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct SetClassGenericParams {
    pub is_generic_badge_class: bool,
    pub is_lineage_badge_class: bool,
}

pub fn handle_set_class_generic(
    ctx: Context<SetClassGeneric>,
    _class_id: u64,
    params: SetClassGenericParams,
) -> Result<()> {
    require!(
        is_owner(
            &ctx.accounts.master_token,
            &ctx.accounts.authority,
            ctx.accounts.master_mint.as_ref(),
            &ctx.accounts.token_program
        ) || is_dispatcher(
            &ctx.accounts.dispatcher,
            &ctx.accounts.default_dispatcher,
            &ctx.accounts.authority
        ) || is_group_manager(&ctx.accounts.group_controller),
        SolaError::NoPermission
    );

    *ctx.accounts.class_generic = ClassGeneric {
        is_generic_badge_class: params.is_generic_badge_class,
        is_lineage_badge_class: params.is_lineage_badge_class,
    };

    Ok(())
}
