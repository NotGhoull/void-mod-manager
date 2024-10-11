use std::{error::Error, fmt::Debug};

use crate::mods::Mod;

pub mod game_manager;
mod steam_game;

// Re-export games
pub mod payday2_game;

pub trait Game: Send + Sync {
    fn get_mods(&self) -> Result<Vec<Mod>, Box<dyn Error>>;
    fn download_mod(&self, mod_id: String) -> Result<(), String>;
    fn install_mod(&self, mod_path: String) -> Result<(), String>;
    fn uninstall_mod(&self, mod_id: String) -> Result<(), String>;
    fn get_game_dir(&self) -> Option<String>;
    fn get_name(&self) -> String;
}
