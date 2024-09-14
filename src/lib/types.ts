export interface AppSettings {
    theme: "Dark" | "Light",
    download_path: string,
    show_debug_options: boolean
}

export interface GameInformation {
    app_id: number,
    name: string,
    install_dir: string
}

export interface ModDataInfo {
  id: number;
  description: string;
  name: string;
  author: string;
  user: string;
  downloads?: number;
  has_download: boolean;
  download_type?: "link" | "file";
  thumbnail_url: string;
}

export interface ModMetaInfo {

}

// Define types for mod information and thumbnail  
export interface ModInfo {
  mod_data: ModDataInfo
  mod_meta: ModMetaInfo
};
  