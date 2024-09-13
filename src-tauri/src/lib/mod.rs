use std::{fs::{create_dir_all, File}, io, path::{Path, PathBuf}};

use futures::future::BoxFuture;
use log::{debug, info};
use tokio::fs;
use zip::ZipArchive;

use crate::settings::load_settings;

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
/// Make this more generic, e.g. being able to 
pub async fn unzip_mod(fname: PathBuf, mod_id: u32) {
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
pub async fn copy_all_cross_device(source: &Path, destination: &Path) -> io::Result<()> {
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
pub fn box_copy_all_cross_device(
    source: PathBuf,
    destination: PathBuf,
) -> BoxFuture<'static, io::Result<()>> {
    Box::pin(async move { copy_all_cross_device(&source, &destination).await })
}
