use anchor_lang::{account, prelude::*, solana_program::pubkey::Pubkey};
use mpl_token_metadata::MAX_URI_LENGTH;

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
    // TODO: chainid目前没看到有相关的使用，暂且注释
    // chainid: u64,
    /// 初始化的mint地址
    pub master_mint: Pubkey,
    /// 初始化的metadata地址
    pub master_metadata: Pubkey,
    pub master_edition: Pubkey,
    // TODO: 初始化的class计数器，默认为0
    // pub class_counter: u64,
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
        ["mint".as_bytes(), &self.profile_id[..], &self.mint_bump[..]]
    }
}

// TODO:
// // seeds: "token_class_record" + token_address
// #[account]
// pub struct TokenClassRecord {
//     // metadata里可以直接查询到，从sdk里提供该字段即可
//     // pub fungible: bool,
//     // spl_extension里可以查询到，同样在sdk里提供即可
//     // pub transferable: bool,
//     pub revocable: bool,
// }

// /// mapping(uint256 => mapping(address => bool)) private tokenIssuers;
// ///
// /// mapping(uint256 => mapping(address => bool)) private tokenConsumers;
// ///
// /// seeds: profile_id + "token_class" + class_counter
// #[account]
// pub struct TokenClass {
//     pub record: TokenClassRecord,
//     pub address: Pubkey,
//     pub schema: String,
//     // 每个类有一个controller，是其profile的account地址
//     pub controller: Pubkey,
//     pub is_issuer: bool,
//     pub is_consumer: bool,
// }

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
// #[account]
// pub struct GroupController {
//     pub is_manager: bool,
//     pub is_issuer: bool,
//     pub is_member: bool,
// }
