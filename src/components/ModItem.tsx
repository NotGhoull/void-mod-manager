import { ModInfo } from "../lib/types";
import { BanIcon, BookOpenIcon, DownloadIcon, User } from "lucide-react";
import { Button } from "./ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { toast } from "sonner";
import ModItemSheet from "./ModItemSheet";

interface ModItemProps {
  mod: ModInfo;
  status: Map<number, string>;
}

function ModItem({ mod, status }: ModItemProps) {
  console.log(mod);

  return (
    <div className="flex flex-col w-full overflow-hidden transition-shadow duration-300 border shadow-md rounded-xl sm:flex-row hover:shadow-lg">
      <img
        className="object-cover h-[156px] w-[300px] aspect-[300/156]"
        src={`https://storage.modworkshop.net/mods/images/thumbnail_${mod.mod_data.thumbnail_url}`}
        alt={`${mod.mod_data.name} Thumbnail`}
      />
      <div className="flex flex-col justify-between w-full p-4">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-left">{mod.mod_data.name}</h1>
          <div className="flex flex-row gap-2 mb-2 text-muted-foreground">
            <User />
            <p>{mod.mod_data.author ? mod.mod_data.author : "Unknown"}</p>
            <p className="font-black">|</p>
            <DownloadIcon />
            <p>
              {mod.mod_data.downloads
                ? mod.mod_data.downloads
                : "??? Downloads"}
            </p>
          </div>
        </div>

        {/* Button to trigger mod download */}
        <div className="flex flex-row gap-2">
          <Button
            key={`mod-button-${mod.mod_data.id}`}
            disabled={
              mod.mod_data.has_download && mod.mod_data.download_type !== "file"
            }
            onClick={async () => {
              console.log("Button: Clicked!");
              try {
                await invoke("download_mod_from_id", {
                  id: mod.mod_data.id,
                  window: appWindow,
                });
              } catch (e) {
                toast.error("An error occurred", {
                  description: `Details: ${e}`,
                });
              }
            }}
            className="self-start px-4 py-2 mt-2"
          >
            {status.get(mod.mod_data.id) ||
              (mod.mod_data.download_type !== "link" &&
              mod.mod_data.has_download &&
              mod.mod_data.download_type ? (
                <DownloadIcon className="w-5 h-5 mr-2" />
              ) : (
                <BanIcon className="w-5 h-5 mr-2" />
              ))}
            {status.get(mod.mod_data.id) ||
              (mod.mod_data.download_type !== "link" &&
              mod.mod_data.has_download &&
              mod.mod_data.download_type
                ? `Download`
                : "Cannot download (Unsupported)")}
          </Button>
          <ModItemSheet
            mod={mod}
            trigger={
              <Button className="self-start px-4 py-2 mt-2" variant={"outline"}>
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Details
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default ModItem;
