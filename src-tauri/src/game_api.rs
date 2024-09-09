use std::{
    fs::File,
    io::{copy, Cursor},
};

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::Window;
use tokio::fs;

#[tauri::command]
pub async fn download_mod_from_id(id: u32, window: Window) -> Result<(), String> {
    println!("DEBUG: Called!");
    let download_location = match get_mod_download_information(id).await {
        Ok(Some(url)) => url,
        Ok(None) => return Err("No download URL found.".into()),
        Err(e) => return Err(e),
    };

    println!("DEBUG: Download url => {}", download_location);

    let _ = window.emit("mod_download_started", id);

    // Create a client and start
    let client = Client::new();
    let response = client
        .get(&download_location)
        .send()
        .await
        .map_err(|e| format!("ERROR: Failed to download file: {}", e))?;

    println!("DEBUG: Got response reading reading");

    let content = response
        .bytes()
        .await
        .map_err(|e| format!("ERROR: Failed to read response: {}", e))?;

    println!("DEBUG -> OK: Reading done. Writing file...");
    let _ = window.emit("mod_writing", id);

    let file_path = format!("/tmp/.void/pd2/{}", id);

    let _ = fs::create_dir_all("/tmp/.void/pd2")
        .await
        .map_err(|_e| window.emit("mod_error", "MOD.DIR"));

    let mut file =
        File::create(&file_path).map_err(|e| format!("ERROR: Failed to create file: {}", e))?;
    copy(&mut Cursor::new(content), &mut file)
        .map_err(|e| format!("ERROR: Failed to write file: {}", e))?;

    println!("DEBUG -> OK: File wrote successfully");
    let _ = window.emit("mod_finishing_up", id);

    if file_path.ends_with(".zip") {
        println!("WARN: Unable to unzip file, filetype not supported.");
    } else {
        println!("WARN: Unable to unzip file, filetype not supported.");
    }
    let _ = window.emit("mod_error", "MOD.UNZIP");
    let _ = window.emit("mod_done", id);

    println!("DEBUG -> OK: Mod downloaded successfully");
    Ok(())
}

#[tauri::command]
pub async fn get_mods() -> Result<Vec<Mod>, String> {
    print!("DEBUG: get_mods()");
    return fetch_mods().await;
}
