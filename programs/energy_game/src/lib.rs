pub use crate::errors::GameErrorCode;
pub use anchor_lang::prelude::*;
pub use session_keys::{session_auth_or, Session, SessionError};
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
use instructions::*;

#[cfg(not(feature = "no-entrypoint"))]
use solana_security_txt::security_txt;

declare_id!("7Nbobyn51AfuMFvzuc4mrRJWVzqWyyqoNnRhoB12xAW5");

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    // Required fields
    name: "Solana Game Preset",
    project_url: "https://github.com/solana-developers/solana-game-preset",
    contacts: "email:Dev Rel <devrel@solana.org>, twitter:https://x.com/solana_devs",
    policy: "There bug bounties in this repository, but PRs are welcome. :)",

    // Optional Fields
    preferred_languages: "en,de",
    source_code: "https://github.com/solana-developers/solana-game-preset",
    source_revision: "HGqkoQDEk8PwiaWEeHfPu8JrHd7HjG1cSUuwmZNNG4Co",
    source_release: "",
    encryption: "",
    auditors: "Verifier pubkey: HGqkoQDEk8PwiaWEeHfPu8JrHd7HjG1cSUuwmZNNG4Co",
    acknowledgements: "Thanks to all the contributors!"
}

#[program]
pub mod energy_game {
    use super::*;

    pub fn init_player(ctx: Context<InitPlayer>, _level_seed: String) -> Result<()> {
        init_player::init_player(ctx)
    }

    // 允许玩家砍伐一棵树并获得 1 块木材(wood). session_auth_or 宏允许玩家使用他们的会话令牌或他们的主钱包. 
    // (计数器的存在只是为了让玩家可以在同一个区块中执行多个交易。如果没有它，同一个区块中的多个交易将导致相同的签名，因此会失败)
    #[session_auth_or(
        ctx.accounts.player.authority.key() == ctx.accounts.signer.key(),
        GameErrorCode::WrongAuthority
    )]
    pub fn chop_tree(ctx: Context<ChopTree>, _level_seed: String, counter: u16) -> Result<()> {
        chop_tree::chop_tree(ctx, counter, 1)
    }
}

