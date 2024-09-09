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

use crate::settings::load_settings;

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

/// Asynchronously unzips a mod file and extracts its contents to specific directories.
///
/// # Arguments
///
/// * `fname` - The path to the zip file to be unzipped.
/// * `mod_id` - The ID of the mod being unzipped.
///
/// # Panics
///
/// This function will panic if it fails to open the zip file or read the zip archive.
///
/// # Errors
///
/// This function will return an error if it fails to create directories or copy files.
///
/// # Safety
///
/// This function involves file operations and directory creations, so care must be taken to handle errors appropriately.
///
/// # Examples
///
/// ```
/// // Example usage of the `unzip_mod` function
/// unzip_mod(PathBuf::from("mod.zip"), 123).await;
/// ```
/// # TODO:
/// Move this into it's own file
async fn unzip_mod(fname: PathBuf, mod_id: u32) {
    info!("Trying to unzip file: {:#?}", fname);
    let file = File::open(&fname).expect("Failed to open the zip file");
    let mut archive = ZipArchive::new(file).expect("Failed to read the zip archive");

    let active_settings = load_settings().await.unwrap();

    let mod_dir = PathBuf::from(format!(
        "{}/pd2/{mod_id}",
        active_settings
            .download_path
            .expect("Expected download path")
            .display()
    ));

    let mut steam_dir = steamlocate::SteamDir::locate().unwrap();
    let app = &steam_dir.app(&218620).unwrap();

    let target_directory = PathBuf::from(format!("{}/mods", &app.path.display()));
    let xml_target_dir = PathBuf::from(format!("{}/assets/mod_overrides", &app.path.display()));

    // Ensure the mod directory exists
    if !mod_dir.exists() {
        fs::create_dir_all(&mod_dir)
            .await
            .expect("Failed to create mod directory");
    }

    let mut main_xml_path: Option<PathBuf> = None;
    let mut mod_txt_path: Option<PathBuf> = None;

    for i in 0..archive.len() {
        let mut inner_file = archive
            .by_index(i)
            .expect("Failed to access file in archive");
        let outpath = match inner_file.enclosed_name() {
            Some(path) => mod_dir.join(path),
            None => continue,
        };

        if inner_file.is_dir() {
            info!("File {i} extracted to \"{}\"", outpath.display());
            create_dir_all(&outpath).expect("Failed to create directory");
        } else {
            info!(
                "File {i} extracted to \"{}\" ({} bytes)",
                outpath.display(),
                inner_file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    create_dir_all(p).expect("Failed to create parent directory");
                }
            }

            let mut outfile = File::create(&outpath).expect("Failed to create file");
            io::copy(&mut inner_file, &mut outfile).expect("Failed to copy file content");

            // Check if the current file is `main.xml`
            if outpath.file_name() == Some("main.xml".as_ref()) {
                main_xml_path = Some(outpath.parent().unwrap().to_path_buf());
                debug!("Found xml {:#?}", main_xml_path);
            } else if outpath.file_name() == Some("mod.txt".as_ref()) {
                mod_txt_path = Some(outpath.parent().unwrap().to_path_buf());
                debug!("Found mod file");
            }
        }
    }

    // If we found main.xml, move its parent directory to the target directory
    if let Some(mod_root_dir) = main_xml_path {
        let target_path = xml_target_dir.join(mod_root_dir.file_name().unwrap());

        info!("Target path: {}", target_path.display());

        if mod_root_dir.exists() {
            info!("Cross-device move detected, copying mod_overrides directory...");
            copy_all_cross_device(&mod_root_dir, &target_path)
                .await
                .expect("Failed to copy mods cross-device");

            fs::remove_dir_all(&mod_root_dir)
                .await
                .expect("Failed to clean up.");

            info!(
                "Moved mod directory from \"{}\" to \"{}\"",
                mod_root_dir.display(),
                target_path.display()
            );
        }
    } else if let Some(mod_root_dir) = mod_txt_path {
        let target_path = target_directory.join(mod_root_dir.file_name().unwrap());

        if mod_root_dir.exists() {
            info!("Cross-device move detected, copying mod directory...");
            copy_all_cross_device(&mod_root_dir, &target_path)
                .await
                .expect("Failed to copy mods cross-device");

            fs::remove_dir_all(&mod_root_dir)
                .await
                .expect("Failed to clean up.");

            info!(
                "Moved mod directory from \"{}\" to \"{}\"",
                mod_root_dir.display(),
                target_path.display()
            );
        }
    } else {
        info!("main.xml not found in the extracted files.");
    }

    info!("Unzipping done!");
}

/// Asynchronously copies all files and directories from the source path to the destination path.
/// If the destination path does not exist, it will be created.
///
/// # Arguments
/// * `source` - The source path to copy files and directories from.
/// * `destination` - The destination path to copy files and directories to.
///
/// # Returns
/// An `io::Result` indicating the result of the copy operation.
async fn copy_all_cross_device(source: &Path, destination: &Path) -> io::Result<()> {
    if !destination.exists() {
        tokio::fs::create_dir_all(destination).await?;
    }

    let mut entries = tokio::fs::read_dir(source).await?;
    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        let dest_path = destination.join(entry.file_name());

        if path.is_dir() {
            box_copy_all_cross_device(path, dest_path).await?;
        } else {
            fs::copy(&path, &dest_path).await?;
        }
    }

    Ok(())
}

/// Asynchronously copies all files and directories from the source path to the destination path.
///
/// If the destination path does not exist, it will be created.
///
/// # Arguments
/// * `source` - The source path from which to copy files and directories.
/// * `destination` - The destination path to which files and directories will be copied.
///
/// # Returns
/// An `io::Result` indicating the result of the copy operation.
fn box_copy_all_cross_device(
    source: PathBuf,
    destination: PathBuf,
) -> BoxFuture<'static, io::Result<()>> {
    Box::pin(async move { copy_all_cross_device(&source, &destination).await })
}
