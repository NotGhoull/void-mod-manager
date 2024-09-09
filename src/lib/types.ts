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

// Define types for mod information and thumbnail
export interface UserInfo {
    name: string;
};  
export interface ModInfo {
  id: number;
  desc: string;
  name: string;
  author: string;
  user: UserInfo;
  downloads?: number;
  has_download: boolean;
  download_type?: "link" | "file";
  thumbnail: ThumbnailInfo;
};
  
export interface ThumbnailInfo {
  file: string;
};