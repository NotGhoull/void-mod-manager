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
  return (
    <div className="flex overflow-hidden flex-col w-full rounded-xl border shadow-md transition-shadow duration-300 sm:flex-row hover:shadow-lg">
      <img
        className="object-cover h-[156px] w-[300px] aspect-[300/156]"
        src={`https://storage.modworkshop.net/mods/images/thumbnail_${
          mod.thumbnail ? mod.thumbnail.file : "default-thumbnail.jpg"
        }`}
        alt={`${mod.name} Thumbnail`}
      />
      <div className="flex flex-col justify-between p-4 w-full">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-left">{mod.name}</h1>
          <div className="flex flex-row gap-2 mb-2 text-muted-foreground">
            <User />
            <p>{mod.user.name ? mod.user.name : "Unknown"}</p>
            <p className="font-black">|</p>
            <DownloadIcon />
            <p>{mod.downloads ? mod.downloads : "??? Downloads"}</p>
          </div>
        </div>

        {/* Button to trigger mod download */}
        <div className="flex flex-row gap-2">
          <Button
            key={`mod-button-${mod.id}`}
            disabled={mod.has_download && mod.download_type !== "file"}
            onClick={async () => {
              console.log("Button: Clicked!");
              try {
                await invoke("download_mod_from_id", {
                  id: mod.id,
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
            {status.get(mod.id) ||
              (mod.download_type !== "link" &&
              mod.has_download &&
              mod.download_type ? (
                <DownloadIcon className="mr-2 w-5 h-5" />
              ) : (
                <BanIcon className="mr-2 w-5 h-5" />
              ))}
            {status.get(mod.id) ||
              (mod.download_type !== "link" &&
              mod.has_download &&
              mod.download_type
                ? `Download`
                : "Cannot download (Unsupported)")}
          </Button>
          <ModItemSheet
            mod={mod}
            trigger={
              <Button className="self-start px-4 py-2 mt-2" variant={"outline"}>
                <BookOpenIcon className="mr-2 w-5 h-5" />
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
