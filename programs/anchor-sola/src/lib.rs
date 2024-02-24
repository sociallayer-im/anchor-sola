mod instructions;
mod profile;
mod state;
use anchor_lang::prelude::*;
use instructions::*;
use profile::*;
use state::CreateSolaParams;

declare_id!("13QsVLZkzf9gRiFbFrUK9xhLa6QukFEdLxJUfbuta33L");

#[program]
pub mod anchor_sola {

    use super::*;

    pub fn initializee(
        ctx: Context<InitializeeProfileGlobal>,
        chainid: u64,
        uri: String,
    ) -> Result<()> {
        profile::handle_initializee_profile_global(ctx, chainid, uri)?;
        Ok(())
    }

    pub fn mint_profile(
        ctx: Context<MintProfile>,
        profile_id: Option<u64>,
        params: MintProfileParams,
    ) -> Result<u64> {
        let profile_id = profile::mint_profile_handler(ctx, profile_id, params)?;
        Ok(profile_id)
    }

    pub fn set_profile_creator(ctx: Context<SetProfileCreator>, status: bool) -> Result<()> {
        profile::handle_set_profile_creator(ctx, status)?;
        Ok(())
    }

    pub fn update_profile_global(
        ctx: Context<UpdateProfileGlobal>,
        chainid: u64,
        uri: String,
    ) -> Result<()> {
        profile::handle_update_profile_global(ctx, chainid, uri)?;
        Ok(())
    }

    pub fn create(
        ctx: Context<CreateSola>,
        name: String,
        _decimals: u8,
        amount: u64,
        params: CreateSolaParams,
    ) -> Result<()> {
        instructions::create_sola_handler(ctx, name, _decimals, amount, params)?;
        Ok(())
    }

    pub fn burn(ctx: Context<BurnSola>, amount: u64) -> Result<()> {
        instructions::burn_sola_handler(ctx, amount)?;
        Ok(())
    }

    pub fn delete(ctx: Context<DeleteSola>) -> Result<()> {
        instructions::delete_sola_handler(ctx)?;
        Ok(())
    }

    pub fn mint(ctx: Context<MintSola>, _name: String, amount: u64) -> Result<()> {
        instructions::mint_sola_handler(ctx, _name, amount)?;
        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        instructions::transfer_handler(ctx, amount)?;
        Ok(())
    }
}
