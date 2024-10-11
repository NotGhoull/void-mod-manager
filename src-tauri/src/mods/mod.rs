use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct Mod {
    pub id: u32,                   // Unique ID for the mod
    pub name: String,              // Name of the mod
    pub description: String,       // Description of the mod.
    pub version: i64,              // Version information
    pub download_url: String,      // URL for downloading the mod
    pub installed: bool,           // Whether the mod is installed or not.
    pub thumbnail: Option<String>, // The link to the thumbnail.
}
