mod badge;
mod profile;
mod state;

use anchor_lang::prelude::*;
use profile::*;

use badge::instructions::*;

pub use badge::instructions::MintBadgeParams;
pub use badge::state::*;
pub use profile::{
    MintProfileParams, RegisterParams, SetClassGenericParams, SetGroupControllerParams,
    SetTokenClassStateParams,
};
pub use state::*;

declare_id!("7UYNekL1ASR39gd2wtrk7Ne1RUhQYUCEBUMLfayTbtmm");

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

    #[inline(never)]
    pub fn mint_badge<'info>(
        ctx: Context<'_, '_, 'info, 'info, MintBadge<'info>>,
        badge_id: u64,
        class_id: u64,
        origins: Vec<u64>,
        params: MintBadgeParams,
    ) -> Result<()> {
        mint_badge_handler(ctx, badge_id, class_id, origins, params)?;
        Ok(())
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
        profile_id: u64,
        params: MintProfileParams,
    ) -> Result<()> {
        profile::mint_profile_handler(ctx, profile_id, params)?;
        Ok(())
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
}
