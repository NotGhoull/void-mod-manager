use payday2::Mod;

pub mod payday2; // Module for PAYDAY 2

// Trait for a generic game mod API
// TODO: Make these values more Universal
pub trait GameModAPI {
    async fn fetch_mods(&self) -> Vec<Mod>;
    async fn get_mod_download_information(&self, id: u32) -> Result<Option<String>, String>;
    async fn impl_download_mod_from_id(&self, id: u32, window: tauri::Window)
        -> Result<(), String>;
}
