mod errors;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::game::Tile;

declare_id!("CHZxZuE6fdPQAywgCRVp1wSJZbrqBczvo7VjFMCkkL4y");

#[program]
pub mod game {
    use crate::*;

    pub fn setup_game(ctx: Context<SetupGame>, player_two: Pubkey) -> Result<()> {
        instructions::setup_game::setup_game(ctx, player_two)
    }

    pub fn play(ctx: Context<Play>, tile: Tile) -> Result<()> {
        instructions::play::play(ctx, tile)
    }
}
