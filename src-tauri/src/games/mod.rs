use crate::mods::Mod;

mod game_manager;
mod steam_game;

pub trait Game {
    fn get_mods(&self) -> Vec<Mod>;
    fn download_mod(&self, mod_id: String) -> Result<(), String>;
    fn install_mod(&self, mod_path: String) -> Result<(), String>;
    fn uninstall_mod(&self, mod_id: String) -> Result<(), String>;
    fn get_game_dir(&self) -> Option<String>;
    fn get_name(&self) -> String;
}
