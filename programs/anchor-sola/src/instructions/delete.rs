use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{
        burn, close_account, thaw_account, Burn, CloseAccount, Mint, ThawAccount, TokenAccount,
        TokenInterface,
    },
};

use crate::state::{SolaError, SolaProperty};

#[derive(Accounts)]
pub struct DeleteSola<'info> {
    #[account(
        mut,
        close = receiver,
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
        constraint = master_token.amount >= 1,
    )]
    pub master_token: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: validated through the `has_one` constraint of the xNFT
    ///        account and the token account mint check.
    #[account(mut)]
    pub master_mint: InterfaceAccount<'info, Mint>,
    /// CHECK: the account receiving the rent doesn't need validation.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    pub authority: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> DeleteSola<'info> {
    pub fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Burn {
            authority: self.authority.to_account_info(),
            from: self.master_token.to_account_info(),
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

    pub fn close_ata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.master_token.to_account_info(),
            authority: self.authority.to_account_info(),
            destination: self.receiver.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn delete_sola_handler(ctx: Context<DeleteSola>) -> Result<()> {
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
        ctx.accounts.master_token.amount,
    )?;

    close_account(ctx.accounts.close_ata_ctx())?;

    Ok(())
}
