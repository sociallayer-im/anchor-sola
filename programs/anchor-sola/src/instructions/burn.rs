use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{
        burn, freeze_account, thaw_account, Burn, FreezeAccount, Mint, ThawAccount, TokenAccount,
        TokenInterface,
    },
};

use crate::state::{SolaError, SolaProperty};

#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct BurnSola<'info> {
    #[account(
        mut,
        has_one = master_metadata,
        has_one = master_mint,
    )]
    pub sola: Account<'info, SolaProperty>,

    #[account(
        mut,
        // constraint = master_metadata.update_authority == *authority.key @ SolaError::UpdateAuthorityMismatch,
        constraint = master_metadata.is_mutable @ SolaError::MetadataIsImmutable,
    )]
    pub master_metadata: Account<'info, MetadataAccount>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = authority,
        constraint = master_token.amount >= amount,
    )]
    pub master_token: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: validated through the `has_one` constraint of the xNFT
    ///        account and the token account mint check.
    #[account(mut)]
    pub master_mint: InterfaceAccount<'info, Mint>,

    pub authority: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> BurnSola<'info> {
    pub fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Burn {
            authority: self.authority.to_account_info(),
            from: self.master_token.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn freeze_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
            account: self.master_token.to_account_info(),
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn thaw_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, ThawAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = ThawAccount {
            account: self.master_token.to_account_info(),
            authority: self.sola.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn burn_sola_handler(ctx: Context<BurnSola>, amount: u64) -> Result<()> {
    let sola = &ctx.accounts.sola;

    require!(sola.is_burnable, SolaError::UnBurnable);

    thaw_account(
        ctx.accounts
            .thaw_account_ctx()
            .with_signer(&[&sola.as_seeds()]),
    )?;
    // Burn the SPL token in the master token account.
    burn(
        ctx.accounts.burn_ctx().with_signer(&[&sola.as_seeds()]),
        amount,
    )?;

    freeze_account(
        ctx.accounts
            .freeze_account_ctx()
            .with_signer(&[&sola.as_seeds()]),
    )?;

    Ok(())
}
