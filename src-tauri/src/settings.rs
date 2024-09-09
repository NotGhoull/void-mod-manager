use std::{fs, path::PathBuf};

use log::info;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct AppSettings {
    theme: Option<String>,
    pub download_path: Option<PathBuf>,
    show_debug_options: Option<bool>,
}

impl AppSettings {
    fn default() -> Self {
        AppSettings {
            theme: Some("Dark".to_string()),
            download_path: Some(PathBuf::from("/tmp/.void/pd2".to_string())),
            show_debug_options: Some(false),
        }
    }

    fn fill_defaults(&mut self) {
        let defaults = AppSettings::default();

        if self.theme.is_none() {
            self.theme = defaults.theme;
            info!("Set missing field 'theme' to default: {:?}", self.theme);
            let _ = self.save();
        }

        if self.download_path.is_none() {
            self.download_path = defaults.download_path;
            info!(
                "Set missing field 'download_path' to default: {:?}",
                self.download_path
            );
            let _ = self.save();
        }

        if self.show_debug_options.is_none() {
            self.show_debug_options = defaults.show_debug_options;
            info!(
                "Set missing field 'show_debug_options' to default: {:?}",
                self.show_debug_options
            );
            let _ = self.save();
        }
    }

    fn load() -> Result<Self, String> {
        info!("Trying to load settings...");
        let settings_path = Self::settings_file_path();
        if settings_path.exists() {
            let data = fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
            let mut settings: AppSettings =
                serde_json::from_str(&data).map_err(|e| e.to_string())?;

            settings.fill_defaults(); // Just in case any are missing

            // TODO: Validation (Real)
            info!("Settings OK.");
            Ok(settings)
        } else {
            info!("Failed to find settings, creating default...");
            Ok(Self::default())
        }
    }

    fn save(&self) -> Result<(), String> {
        info!("Saving settings...");
        let settings_path = Self::settings_file_path();
        let data = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        info!("OK: Settings saved. (Probably)");
        fs::write(settings_path, data).map_err(|e| e.to_string())
    }

    fn settings_file_path() -> PathBuf {
        let mut path = dirs::config_dir().unwrap();
        path.push("void_mod_manager");
        fs::create_dir_all(&path).expect("ERROR: Failed to create settings directory");
        path.push("settings.json");
        path
    }
}

#[tauri::command]
pub async fn load_settings() -> Result<AppSettings, String> {
    AppSettings::load()
}

#[tauri::command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    settings.save()
}
