// use game_api::{download_mod_from_id, get_mods};
use games::{
    payday2::{Mod, Payday2API},
    GameModAPI,
};
use log::{debug, error, info, trace, warn};
use settings::{load_settings, save_settings};
use tauri::Window;

mod games;
mod lib;
mod mod_manager;
mod settings;
mod test;

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn get_mods() -> Vec<Mod> {
    info!("Getting data...");
    return Payday2API.fetch_mods().await;
}

#[tauri::command]
async fn download_mod_from_id(id: u32, window: Window) -> Result<(), String> {
    return Payday2API.impl_download_mod_from_id(id, window).await;
}

#[tauri::command]
async fn get_steam_games() -> Result<Vec<mod_manager::InstalledGame>, String> {
    mod_manager::detect_installed_games()
        .await
        .map_err(|e| e.to_string())
}

fn main() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("trace"));
    trace!("Where's the coccaine?");
    debug!("Bugs are horrible");
    info!("Hey there ");
    warn!("Whos there!?");
    error!("Oh, shit");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Settings
            save_settings,
            load_settings,
            // Game API
            get_mods,
            download_mod_from_id,
            // Core
            get_steam_games,
        ]) // Settings commands
        // .invoke_handler(tauri::generate_handler![download_mod_from_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
