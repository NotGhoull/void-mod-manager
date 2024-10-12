use crate::games::Game;
use crate::mods::Mod;

pub struct SteamGame {
    game_dir: String,
    name: String,
}

// Example implimentation of a game
impl Game for SteamGame {
    fn get_mods(&self) -> Result<Vec<Mod>, Box<(dyn std::error::Error + 'static)>> {
        todo!()
    }

    fn download_mod(&self, mod_id: u32) -> Result<(), String> {
        todo!()
    }

    fn install_mod(&self, mod_path: String) -> Result<(), String> {
        todo!()
    }

    fn uninstall_mod(&self, mod_id: String) -> Result<(), String> {
        todo!()
    }

    fn get_game_dir(&self) -> Option<String> {
        todo!()
    }

    fn get_name(&self) -> String {
        todo!()
    }
}
