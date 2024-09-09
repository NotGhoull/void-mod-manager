use std::error::Error;

use log::{debug, info};
use serde::{Deserialize, Serialize};
use steamlocate::SteamDir;

#[derive(Serialize, Deserialize, Debug)]
pub struct InstalledGame {
    app_id: u32,
    name: Option<String>,
    install_dir: String,
}

pub async fn detect_installed_games() -> Result<Vec<InstalledGame>, Box<dyn Error>> {
    // Locate the Steam directory
    let steam_dir = SteamDir::locate().ok_or(format!("ERROR!"));
    debug!(
        "Steam lib data: {:#?}",
        &steam_dir.clone().unwrap().libraryfolders()
    );

    // Iterate over all libraries and apps
    let mut installed_games = Vec::new();
    // let apps: &HashMap<u32, Option<SteamApp>> = ;

    for app in steam_dir.unwrap().apps() {
        // info!("Found app {:#?} ({})", app.1.clone().unwrap().name, app.0);
        let found_app = InstalledGame {
            app_id: app.clone().0.to_owned(),
            name: app.1.clone().unwrap().name,
            install_dir: app.1.clone().unwrap().path.to_string_lossy().to_string(),
        };

        installed_games.push(found_app);
    }

    debug!("Found games: {:#?}", installed_games);
    info!("Games OK");
    Ok(installed_games)
}
