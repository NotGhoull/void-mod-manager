use serde::{Deserialize, Serialize};

pub mod payday2; // Module for PAYDAY 2

// This is the universal mod structure, all mods should be able to be represented by this
// Future: Possibly add the option for mods to add additional data, without being explicity defined in the struct
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Mod {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub downloads: u32,
    pub author: String,
    pub has_download: bool,
    pub download_type: Option<String>,
    pub thumbnail_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModPageMetaData {
    pub current_page: u32,
    pub from: Option<u32>,
    pub last_page: u32,
    pub per_page: u32,
    pub to: Option<u32>,
    pub total: u32,
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModWithMeta {
    mod_data: Mod,
    mod_meta: ModPageMetaData,
}

// Trait for a generic game mod API
// TODO: Make these values more Universal
pub trait GameModAPI {
    async fn fetch_mods(&self, query: Option<String>) -> Vec<ModWithMeta>;
    async fn get_mod_download_information(&self, id: u32) -> Result<Option<String>, String>;
    async fn impl_download_mod_from_id(&self, id: u32, window: tauri::Window)
        -> Result<(), String>;
}
