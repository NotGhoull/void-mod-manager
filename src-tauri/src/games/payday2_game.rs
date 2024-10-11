use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::async_runtime;

use crate::{errors::error::ModManagerError, mods::Mod};

use super::Game;

// PAYDAY 2 Game struct implementating the Game trait
pub struct Payday2Game {
    game_dir: String,
    name: String,
}

#[derive(Deserialize)]
struct Thumbnail {
    file: String,
}

#[derive(Deserialize)]
struct Payday2Mod {
    id: u32,
    name: String,
    desc: String,
    thumbnail: Option<Thumbnail>,
}

#[derive(Deserialize)]
struct APIResponse {
    data: Vec<Payday2Mod>,
}

impl Payday2Game {
    pub fn new(game_dir: String, name: String) -> Self {
        Self { game_dir, name }
    }

    // Helper function for downloading mod content
    async fn download_mod_content() {}

    // NOTE: This function could, eventually, be moved into it's own file for "ModWorkShop" mods.
    async fn fetch_mods_from_api(&self) -> Result<Vec<Payday2Mod>, ModManagerError> {
        let client = Client::new();

        // TODO: let these be args
        let body = json!({
            "limit": 10,
            "query": ""
        });

        // Request the mods from the API
        let response = client
            .get("https://api.modworkshop.net/games/payday-2/mods")
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .body(body.to_string())
            .send()
            .await
            .map_err(|err| ModManagerError::NetworkError(err.to_string()))?;

        // Parse the text
        let text = response
            .text()
            .await
            .map_err(|err| ModManagerError::NetworkError(err.to_string()))?;

        let api_response: APIResponse = serde_json::from_str(&text)
            .map_err(|err| ModManagerError::ParseError(err.to_string()))?;

        Ok(api_response.data)
    }
}

impl Game for Payday2Game {
    fn get_mods(&self) -> Result<Vec<Mod>, Box<(dyn std::error::Error + 'static)>> {
        // Get mods
        let mods = async_runtime::block_on(async { self.fetch_mods_from_api().await })?;

        // Convert Payday2Mod to our Abstract mod class
        let mods: Vec<Mod> = mods
            .into_iter()
            .map(|payday2_mod| Mod {
                id: payday2_mod.id,
                name: payday2_mod.name,
                description: payday2_mod.desc,
                version: 0,
                download_url: "None".to_string(),
                installed: false,
                thumbnail: payday2_mod.thumbnail.map(|t| t.file),
            })
            .collect();

        println!("{:#?}", mods);
        Ok(mods)
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
