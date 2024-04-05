use crate::profile::TOKEN_SCHEMA_MAX_LEN;
use anchor_lang::prelude::*;
use mpl_token_metadata::MAX_URI_LENGTH;

/// seeds: "badge_global"
#[account]
#[derive(InitSpace)]
pub struct BadgeGlobal {
    pub owner: Pubkey,
    #[max_len(MAX_URI_LENGTH)]
    pub base_uri: String,
}

/// seeds: "badge_state" + badge_mint
#[account]
#[derive(InitSpace)]
pub struct BadgeState {
    pub badge_id: [u8; 8],
    pub metatable: u64,
    pub weights: u64,
    #[max_len(TOKEN_SCHEMA_MAX_LEN)]
    pub token_schema: String,
    pub master_mint: Pubkey,
    pub master_metadata: Pubkey,
    pub master_edition: Pubkey,
    pub badge_bump: [u8; 1],
    pub mint_bump: [u8; 1],
}

impl BadgeState {
    pub fn as_seeds(&self) -> [&[u8]; 3] {
        [
            "badge_state".as_bytes(),
            self.master_mint.as_ref(),
            self.badge_bump.as_ref(),
        ]
    }

    pub fn mint_seeds<'s>(&'s self) -> [&[u8]; 3] {
        [
            "mint_badge".as_bytes(),
            self.badge_id.as_ref(),
            self.mint_bump.as_ref(),
        ]
    }
}

/// seeds: "lineage_origins" + badge_mint
#[account]
pub struct LineageOrigins {
    pub origins: Vec<u64>,
}

impl LineageOrigins {
    pub const fn init_space(n: usize) -> usize {
        4 + 8 * n
    }

    pub fn is_origins(&self, controller_id: u64) -> bool {
        self.origins
            .iter()
            .find(|id| controller_id.eq(*id))
            .is_some()
    }
}
/// seeds: "generic_origins" + badge_mint
#[account]
#[derive(InitSpace)]
pub struct GenericOrigins {
    pub origin: u64,
}

// /// seeds: "proxy_owner" + owner
// #[account]
// #[derive(InitSpace)]
// pub struct ProxyOwner {
//     pub owner: Pubkey,
// }
