use std::{
    fs::{create_dir_all, File},
    io::{self, copy, Cursor},
    path::{Path, PathBuf},
    str::FromStr,
};

use futures::future::BoxFuture;
use tokio::fs;

use log::{debug, error, info, trace, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use zip::ZipArchive;

use crate::{lib::unzip_mod, settings::load_settings};

use super::GameModAPI;
pub struct Payday2API;

// TODO: Remove redundant traits
#[derive(Deserialize, Serialize, Debug)]
struct Thumbnail {
    id: u32,
    user_id: u32,
    mod_id: u32,
    has_thumb: bool,
    file: String,
    r#type: String,
    size: u32,
    created_at: String,
    updated_at: String,
    display_order: u32,
    visible: bool,
}

#[derive(Deserialize, Serialize, Debug)]
struct UserData {
    name: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Mod {
    id: u32,
    name: String,
    desc: String,
    downloads: u32,
    user: UserData,
    has_download: bool,
    download_type: Option<String>,
    thumbnail: Option<Thumbnail>,
}

#[derive(Deserialize, Serialize, Debug)]
struct APIResponse {
    data: Vec<Mod>,
}

#[derive(Deserialize, Serialize, Debug)]
struct ModDownloadAPIResponse {
    name: String,
    download: Option<ModDownloadData>,
}

#[derive(Deserialize, Serialize, Debug)]
struct ModDownloadData {
    #[serde(rename = "download_url")]
    download_url: Option<String>,
}

impl GameModAPI for Payday2API {
    async fn fetch_mods(&self) -> Vec<Mod> {
        info!("Attempting to fetch mods from ModworkshopAPI");
        let response = match reqwest::get("https://api.modworkshop.net/games/payday-2/mods").await {
            Ok(resp) => resp,
            Err(e) => {
                error!("Failed to get modworkshop API: {e}");
                return Vec::new();
            }
        };

        // Extract the text
        info!("Reading text from body");
        let text = match response.text().await {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to read response text: {e}");
                return Vec::new();
            }
        };

        // Attempt to parse the text to JSON
        let parsed_response: Result<APIResponse, serde_json::Error> = serde_json::from_str(&text);
        match parsed_response {
            Ok(parsed) => parsed.data,
            Err(e) => {
                error!("Failed to parse JSON: {e}");
                return Vec::new();
            }
        }
    }

    // TODO: Write docstrings
    async fn get_mod_download_information(&self, id: u32) -> Result<Option<String>, String> {
        info!("Getting mod information...");
        let response = match reqwest::get(format!("https://api.modworkshop.net/mods/{}", id)).await
        {
            Ok(resp) => resp,
            Err(e) => {
                error!("Request failed: {e}");
                return Ok(None);
            }
        };

        // Get the text (Body) from the response
        let text = match response.text().await {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to read response text: {e}");
                return Ok(None);
            }
        };

        let parsed_response: Result<ModDownloadAPIResponse, serde_json::Error> =
            serde_json::from_str(&text);
        match parsed_response {
            Ok(parsed) => {
                println!("Parsed");

                if let Some(download_data) = parsed.download {
                    if let Some(url) = download_data.download_url {
                        info!("parsed.download_url is OK");
                        return Ok(Some(url));
                    } else {
                        error!("No URL.");
                        trace!("Debug parsed data: {:#?}", &download_data);
                        return Ok(None);
                    }
                } else {
                    error!("No download_data found");
                    trace!("Debug parsed data: {:#?}", &parsed);
                    return Ok(None);
                }
            }
            Err(e) => {
                error!("Failed to parse JSON: {:#?}", e);
                return Ok(None);
            }
        }
    }

    async fn impl_download_mod_from_id(
        &self,
        id: u32,
        window: tauri::Window,
    ) -> Result<(), String> {
        debug!("Called!");

        // Get the download link
        let download_location = match self.get_mod_download_information(id).await {
            Ok(Some(url)) => url,
            Ok(None) => {
                error!("No download URL found on id: {id}");
                return Ok(());
            }
            Err(e) => {
                error!("An error occurred while trying to download: {e}");
                return Ok(());
            }
        };

        debug!("Download URL => {download_location}");

        // Update the front end
        debug!("Emitting `mod_download_started` for {id}");
        let _ = window.emit("mod_download_started", id);

        let ext = Path::new(&download_location)
            .extension()
            .and_then(|ex| ex.to_str())
            .unwrap_or("?");

        debug!("Got extension {ext}");

        // Create a client and start downloading
        let client = Client::new();
        let response = client
            .get(&download_location)
            .send()
            .await
            .map_err(|e| format!("Failed to download file: {}", e))?;
        // TODO: Emit an error event above ^ (and swap to proper errors, we do this for now to fix an error)

        debug!("Got a response, now reading...");

        let content = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read response: {e}"))?;

        debug!("Reading done; Writing file...");
        debug!("Emitting `mod_writing` for {id}");
        let _ = window.emit("mod_wiring", id);

        let file_path = format!("/tmp/.void/pd2/{}.{}", id, ext);

        let _ = fs::create_dir_all("/tmp/.void/pd2")
            .await
            .map_err(|_e| window.emit("mod_error", "MOD.DIR"));
        // TODO: The same as all the others

        // Create the file
        let mut file =
            File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;

        // Write the data
        let _ = copy(&mut Cursor::new(content), &mut file)
            .map_err(|e| error!("Failed to write file {e}"));

        info!("Successfully wrote file");
        debug!("Emitting `mod_finishing_up` for {id}");
        let _ = window.emit("mod_finishing_up", id);

        if ext == "zip" {
            debug!("Trying to unzip file...");
            let _path = match PathBuf::from_str(&file_path.to_string()) {
                Ok(p) => p,
                Err(e) => {
                    panic!("Failed to create mod path: {e}");
                }
            };
            unzip_mod(_path, id).await;
            debug!("Unzipping didn't seem to error.");
        } else {
            debug!("Emitting `mod_error` for MOD.UNZIP (.{ext})");
            let _ = window.emit("mod_error", "MOD.UNZIP");
            warn!("Unable to unzip file, filetype not supported.")
        }

        debug!("Emitting `mod_done` for {id}");
        let _ = window.emit("mod_done", id);

        info!("Mod downloaded successfully!");

        return Ok(());
    }
}
