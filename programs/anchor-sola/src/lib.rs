mod badge;
mod instructions;
mod profile;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use profile::*;
use state::CreateSolaParams;

use badge::instructions::*;

declare_id!("13QsVLZkzf9gRiFbFrUK9xhLa6QukFEdLxJUfbuta33L");

#[program]
pub mod anchor_sola {

    use super::*;
    pub fn initializee_badge_global(
        ctx: Context<InitializeeBadgeGlobal>,
        uri: String,
    ) -> Result<()> {
        handle_initializee_badge_global(ctx, uri)?;
        Ok(())
    }

    pub fn mint_badge(
        ctx: Context<MintBadge>,
        class_id: u64,
        params: MintBadgeParams,
        origins: Vec<u64>,
    ) -> Result<u64> {
        let res = mint_badge_handler(ctx, class_id, params, origins)?;
        Ok(res)
    }

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

    pub fn burn_profile(ctx: Context<BurnProfile>, profile_id: u64) -> Result<()> {
        profile::burn_profile_handler(ctx, profile_id)?;
        Ok(())
    }

    pub fn set_profile_creator(ctx: Context<SetProfileCreator>, status: bool) -> Result<()> {
        profile::handle_set_profile_creator(ctx, status)?;
        Ok(())
    }

    pub fn register(
        ctx: Context<Register>,
        class_id: u64,
        profile_id: u64,
        params: RegisterParams,
    ) -> Result<()> {
        profile::handle_register(ctx, class_id, profile_id, params)?;
        Ok(())
    }

    pub fn set_dispatcher(ctx: Context<SetDispatcher>, controller_id: u64) -> Result<()> {
        profile::handle_set_dispatcher(ctx, controller_id)?;
        Ok(())
    }

    pub fn set_default_dispatcher(ctx: Context<SetDefaultDispatcher>) -> Result<()> {
        profile::handle_set_default_dispatcher(ctx)?;
        Ok(())
    }

    pub fn set_group_controller(
        ctx: Context<SetGroupController>,
        controller_id: u64,
        params: SetGroupControllerParams,
    ) -> Result<()> {
        profile::handle_set_group_controller(ctx, controller_id, params)?;
        Ok(())
    }

    pub fn set_class_generic(
        ctx: Context<SetClassGeneric>,
        class_id: u64,
        params: SetClassGenericParams,
    ) -> Result<()> {
        profile::handle_set_class_generic(ctx, class_id, params)?;
        Ok(())
    }
    pub fn set_token_class_state(
        ctx: Context<SetTokenClassState>,
        class_id: u64,
        params: SetTokenClassStateParams,
    ) -> Result<()> {
        profile::handle_set_token_class_state(ctx, class_id, params)?;
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
