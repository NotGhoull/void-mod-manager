use std::{
    fs::File,
    io::{self, Cursor},
    path::Path
};

use reqwest::Client;
use serde::Deserialize;
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

#[derive(Deserialize)]
struct ModDownloadAPIResponse {
    download: Option<ModDownloadData>,
}

#[derive(Deserialize)]
struct ModDownloadData {
    download_url: Option<String>,
}

impl Payday2Game {
    pub fn new(game_dir: String, name: String) -> Self {
        Self { game_dir, name }
    }

    // Helper function for downloading mod content
    async fn download_mod_content(
        &self,
        download_url: &str,
        mod_id: u32,
    ) -> Result<(), ModManagerError> {
        // Create a client and fetch the mod
        let client = Client::new();
        let response = client
            .get(download_url)
            .send()
            .await
            .map_err(|e| ModManagerError::NetworkError(e.to_string()))?;

        let content = response
            .bytes()
            .await
            .map_err(|e| ModManagerError::NetworkError(e.to_string()))?;

        // Get the archive type
        let ext = Path::new(&download_url)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("UNKNOWN");

        println!("[Debug] Got ext: {}", ext);

        let file_path = format!("/tmp/.void/pd2/{}.{}", mod_id, ext);

        // Write mod content to a temporary file
        let mut file = File::create(&file_path)
            .map_err(|e| ModManagerError::FileSystemError(e.to_string()))?;

        io::copy(&mut Cursor::new(content), &mut file)
            .map_err(|e| ModManagerError::FileSystemError(e.to_string()))?;

        // Unzip mod if it's in a supported format
        if file_path.ends_with(".zip") {
            self.unzip_mod(&file_path, mod_id).await?;
        }

        Ok(())
    }

    // This code was basically ripped from the legacy implementation, it should be
    // updated in the future to be better
    async fn get_mod_download_information(
        &self,
        mod_id: u32,
    ) -> Result<Option<String>, ModManagerError> {
        let url = format!("https://api.modworkshop.net/mods/{}", mod_id);
        let client = Client::new();

        let response = client
            .get(&url)
            .send()
            .await
            .map_err(|e| ModManagerError::NetworkError(e.to_string()))?;

        let text = response
            .text()
            .await
            .map_err(|e| ModManagerError::NetworkError(e.to_string()))?;

        let parsed_response: ModDownloadAPIResponse =
            serde_json::from_str(&text).map_err(|e| ModManagerError::ParseError(e.to_string()))?;

        if let Some(download_data) = parsed_response.download {
            if let Some(url) = download_data.download_url {
                return Ok(Some(url));
            }
        }

        Ok(None)
    }

    // TODO: something
    async fn unzip_mod(&self, file_path: &str, mod_id: u32) -> Result<(), ModManagerError> {
        todo!("Payday2Game::unzip_mod")
    }

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

    fn download_mod(&self, mod_id: u32) -> Result<(), String> {
        let game_dir = self.game_dir.clone();
        // Re-make payday2_game here to avoid an error with self escaping [E0521]
        // Theres probably a better way to do this, but I don't know what it is
        let payday_game = Payday2Game {
            game_dir,
            name: "PAYDAY 2".to_string(),
        };

        async_runtime::spawn(async move {
            if let Ok(Some(download_url)) = payday_game.get_mod_download_information(mod_id).await {
                if let Err(err) = payday_game
                    .download_mod_content(&download_url, mod_id)
                    .await
                {
                    eprintln!("Failed to download mod: {}", err)
                }
            } else {
                eprintln!("No download URL found");
            }
        });

        Ok(())
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
        self.name.clone()
    }
}
