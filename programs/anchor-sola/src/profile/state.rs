use anchor_lang::{account, prelude::*, solana_program::pubkey::Pubkey};
use mpl_token_metadata::MAX_URI_LENGTH;

use super::utils::{is_dispatcher, RefAccount};

#[derive(InitSpace)]
#[account]
pub struct SolaProfileGlobal {
    pub counter: u64,
    pub class_counter: u64,
    pub owner: Pubkey,
    pub chainid: u64,
    #[max_len(MAX_URI_LENGTH)]
    pub base_uri: String,
    // pub defaultBadgeTable: Pubkey,
    // pub defaultPointTable: Pubkey
}

#[derive(InitSpace)]
#[account]
pub struct IsProfileCreator {
    pub is_profile_creator: bool,
}

#[derive(InitSpace)]
#[account]
pub struct DefaultProfileId {
    pub profile_id: u64,
}

/// 和spl的Mint关联
///
/// seeds: "sola_profile" + master_mint
#[derive(InitSpace)]
#[account]
pub struct SolaProfile {
    /// 初始计数器，后续作为token id来使用
    pub profile_id: [u8; 8],
    /// 初始化的mint地址
    pub master_mint: Pubkey,
    /// 初始化的metadata地址
    pub master_metadata: Pubkey,
    pub master_edition: Pubkey,
    pub address_default_profiles: Option<Pubkey>,
    pub owner: Pubkey,
    pub profile_bump: [u8; 1],
    pub mint_bump: [u8; 1],
}

impl SolaProfile {
    pub fn as_seeds(&self) -> [&[u8]; 3] {
        [
            "sola_profile".as_bytes(),
            self.master_mint.as_ref(),
            &self.profile_bump[..],
        ]
    }

    pub fn mint_seeds<'s>(&'s self) -> [&[u8]; 3] {
        [
            "mint_profile".as_bytes(),
            &self.profile_id[..],
            &self.mint_bump[..],
        ]
    }
}

#[derive(InitSpace)]
#[account]
pub struct TokenClassRecord {
    // metadata里可以直接查询到，从sdk里提供该字段即可
    pub fungible: bool,
    // spl_extension里可以查询到，同样在sdk里提供即可
    pub transferable: bool,
    pub revocable: bool,
}

pub const TOKEN_SCHEMA_MAX_LEN: usize = 50;

/// seeds: "token_class" + class_id
#[derive(InitSpace)]
#[account]
pub struct TokenClass {
    pub record: TokenClassRecord,
    pub address: Pubkey,
    #[max_len(TOKEN_SCHEMA_MAX_LEN)]
    pub schema: String,
    /// profile id
    pub controller: u64,
}

// pub const TOKEN_SCHEMA_MAX_LEN: usize = 50;

// /// 关联到每个profile上
// ///
// /// seeds: "group_controller" + profile_id(即controller_id)
// ///
// /// mapping(uint256 => mapping(address => bool)) private groupManagers;
// ///
// /// mapping(uint256 => mapping(address => bool)) private groupIssuers;
// ///
// /// mapping(uint256 => mapping(address => bool)) private groupMembers;
///  seeds: "group_controller" + controller_id
#[derive(InitSpace)]
#[account]
pub struct GroupController {
    pub is_manager: bool,
    pub is_issuer: bool,
    pub is_member: bool,
}

/// seeds: "token_class_state" + class_id
#[derive(InitSpace)]
#[account]
pub struct TokenClassState {
    pub is_issuer: bool,
    pub is_consumer: bool,
}

#[derive(InitSpace)]
#[account]
pub struct Dispatcher {
    pub dispatcher: Pubkey,
}

/// seeds: "class_generic" + class_id
#[derive(InitSpace)]
#[account]
pub struct ClassGeneric {
    pub is_generic_badge_class: bool,
    pub is_lineage_badge_class: bool,
}

/**
```rust
#[derive(Accounts)]
#[instruction(class_id: u64)]
pub struct IRegistry<'info> {
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
        seeds = [
            "mint".as_bytes(),
            &token_class.controller.to_be_bytes(),
        ],
        bump,
    )]
    pub master_mint: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "sola_profile".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub sola_profile: Account<'info, SolaProfile>,
    /// CHECK:
    #[account(
        seeds = [
            "dispatcher".as_bytes(),
            &token_class.controller.to_be_bytes()
        ],
        bump,
    )]
    pub dispatcher: UncheckedAccount<'info>,
    #[account(
        seeds = [
            "default_dispatcher".as_bytes(),
        ],
        bump,
    )]
    pub default_dispatcher: Account<'info, Dispatcher>,
    /// CHECK:
    #[account(
        seeds = [
            "class_generic".as_bytes(),
            &class_id.to_be_bytes(),
        ],
        bump,
    )]
    pub class_generic: UncheckedAccount<'info>,
}
```
*/
pub struct IRegistryRef<'info: 'ref_info, 'ref_info> {
    /// seeds: "token_class" + &class_id.to_be_bytes()
    pub token_class: &'ref_info Account<'info, TokenClass>,
    /// CHECK:
    /// seeds: "mint" + &token_class.controller.to_be_bytes()
    pub master_mint: &'ref_info UncheckedAccount<'info>,
    /// seeds: "sola_profile" +  master_mint.key().as_ref()
    pub sola_profile: &'ref_info Account<'info, SolaProfile>,
    /// CHECK:
    /// seeds: "dispatcher" + &token_class.controller.to_be_bytes()
    pub dispatcher: &'ref_info UncheckedAccount<'info>,
    /// seeds: "default_dispatcher"
    pub default_dispatcher: &'ref_info Account<'info, Dispatcher>,
    /// CHECK:
    /// seeds: "class_generic" + class_id
    pub class_generic: &'ref_info UncheckedAccount<'info>,
}

impl<'info: 'ref_info, 'ref_info> IRegistryRef<'info, 'ref_info> {
    pub fn is_token_class_owner(&self, addr: Pubkey) -> bool {
        self.sola_profile.owner == addr
            || is_dispatcher(&self.dispatcher, &self.default_dispatcher, addr)
    }

    pub fn get_token_class_transferable(&self) -> bool {
        self.token_class.record.transferable
    }

    pub fn get_token_class_revocable(&self) -> bool {
        self.token_class.record.revocable
    }

    pub fn get_class_schema(&self) -> String {
        self.token_class.schema.clone()
    }

    pub fn is_generic_badge_class(&self) -> bool {
        let class_generic = RefAccount::<ClassGeneric>::new(&self.class_generic);
        class_generic
            .map(|inner| inner.is_generic_badge_class)
            .unwrap_or(false)
    }

    pub fn is_lineage_badge_class(&self) -> bool {
        let class_generic = RefAccount::<ClassGeneric>::new(&self.class_generic);
        class_generic
            .map(|inner| inner.is_lineage_badge_class)
            .unwrap_or(false)
    }
}
