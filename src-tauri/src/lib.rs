use commands::payday2_commands::fetch_payday2_mods;
use games::{game_manager::GameManager, payday2_game::Payday2Game};
use mods::Mod;
use tauri::{Runtime, State};

mod commands;
mod errors;
mod games;
mod mods;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

#[tauri::command]
fn get_supported_games<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
) -> Vec<String> {
    vec!["Payday2".to_string()]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut game_manager = GameManager::new();

    // Example payday 2 game instance, this should be automated in the future.

    game_manager.load_game(Box::new(Payday2Game::new(
        "/some/path".to_string(), // This is unused right now
        "PAYDAY 2".to_string(),
    )));

    tauri::Builder::default()
        .manage(game_manager)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_supported_games,
            fetch_payday2_mods
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
