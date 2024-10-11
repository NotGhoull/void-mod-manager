use crate::mods::Mod;

use super::Game;

// PAYDAY 2 Game struct implementating the Game trait
pub struct Payday2Game {
    game_dir: String,
    name: String,
}

impl Payday2Game {
    pub fn new(game_dir: String, name: String) -> Self {
        Self { game_dir, name }
    }

    // Helper function for downloading mod content
    async fn download_mod_content() {}
}

impl Game for Payday2Game {
    fn get_mods(&self) -> Result<Vec<Mod>, Box<(dyn std::error::Error + 'static)>> {
        Ok(vec![Mod {
            id: 1,
            name: "test".to_string(),
            version: 0,
            download_url: "some".to_string(),
            installed: false,
        }])
    }

    fn download_mod(&self, mod_id: String) -> Result<(), String> {
        todo!("download_mod")
    }

    fn install_mod(&self, mod_path: String) -> Result<(), String> {
        todo!("install_mod")
    }

    fn uninstall_mod(&self, mod_id: String) -> Result<(), String> {
        todo!("uninstall_mod")
    }

    fn get_game_dir(&self) -> Option<String> {
        todo!("get_game_dir")
    }

    fn get_name(&self) -> String {
        "PAYDAY 2".to_string()
    }
}
