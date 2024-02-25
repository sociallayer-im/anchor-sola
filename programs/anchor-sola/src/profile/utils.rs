use anchor_lang::prelude::*;

use crate::{Dispatcher, GroupController, SolaProfile};

pub fn is_owner(sola_profile: &Account<'_, SolaProfile>, authority: Pubkey) -> bool {
    sola_profile.owner == authority
}

pub fn is_dispatcher(
    dispatcher: &UncheckedAccount<'_>,
    default_dispatcher: &Account<'_, Dispatcher>,
    authority: Pubkey,
) -> bool {
    (dispatcher.data_is_empty() && default_dispatcher.dispatcher == authority)
        || (dispatcher
            .try_borrow_data()
            .ok()
            .as_ref()
            .and_then(|data| Dispatcher::try_deserialize(&mut &data[..]).ok())
            .filter(|dispatcher| authority == dispatcher.dispatcher)
            .is_some())
}

pub fn is_group_manager(group_controller: &Account<'_, GroupController>) -> bool {
    group_controller.is_manager
}
