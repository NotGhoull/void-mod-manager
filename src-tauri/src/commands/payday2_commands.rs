use std::error::Error;

use tauri::State;

use crate::{games::game_manager::GameManager, mods::Mod};

#[tauri::command]
pub fn fetch_payday2_mods(manager: State<'_, GameManager>) -> Result<Vec<Mod>, String> {
    // Assuming we know the game is called "PAYDAY 2" in the GameManager
    if let Some(game) = manager.get_game_by_name("PAYDAY 2") {
        game.get_mods().map_err(|e| e.to_string())
    } else {
        Err("PAYDAY 2 game not found".to_string())
    }
}

#[tauri::command]
pub async fn download_payday2_mod(
    manager: State<'_, GameManager>,
    mod_id: u32,
) -> Result<(), String> {
    if let Some(game) = manager.get_game_by_name("PAYDAY 2") {
        println!("commands::payday2_commands::download_payday2_mod -> Starting...!");
        game.download_mod(mod_id);
        println!("commands::payday2_commands::download_payday2_mod -> Downloaded!");
        Ok(())
    } else {
        Err("PAYDAY 2 game not found".to_string())
    }
}
