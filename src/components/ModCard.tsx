import {
  DownloadCloudIcon,
  HeartIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  UploadCloudIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ModCardProps {
  modId: number;
  thumbnailLink: string;
  title: string;
  description: string;

  //   Meta
  downloads?: number;
  likes?: number;
  update?: string;
}

function ModCard(props: ModCardProps) {
  const [isModDownloading, setIsModDownloading] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-row w-full gap-4 p-4 text-white bg-gray-800 rounded-md shadow-lg cursor-pointer">
          {/* Image Section */}
          <div>
            <img
              src={
                props.thumbnailLink
                  ? `https://storage.modworkshop.net/mods/images/thumbnail_${props.thumbnailLink}`
                  : "https://via.placeplachholder.com/100"
              }
              width={"100px"}
              height={"100px"}
              alt="mod icon"
              className="object-cover rounded-lg aspect-square"
            />
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl font-bold">
              {props.title ?? "No title provided."}
            </h1>
            <p className="text-sm text-gray-400 line-clamp-2">
              {props.description ?? "No description provided."}
            </p>
          </div>

          {/* Update Section */}
          <div className="flex flex-col items-end justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <DownloadCloudIcon />
              {props.downloads ?? "?"} Downloads
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <HeartIcon />
              {props.likes ?? "?"} Likes
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <UploadCloudIcon />
              Updated {props.update ?? "?"} days ago
            </span>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-2 w-96">
        <div className="flex flex-col gap-0">
          <h1 className="text-xl font-bold text-foreground">Mod options</h1>
          {/* <p>Buttons don't work, since this isn't done yet</p> */}
          <div className="flex flex-row items-center gap-1">
            <TriangleAlertIcon className="w-5 h-5 text-orange-500" />
            <p>PAYDAY2 install location is not valid.</p>
          </div>
        </div>
        <Separator className="bg-foreground" />
        <Button
          onClick={async () => {
            setIsModDownloading(true);
            console.debug(`Would start downloading mod ${props.modId}`);
            await invoke("download_payday2_mod", {
              modId: props.modId,
            });
          }}
          className="transition-all duration-300 ease-in-out"
          disabled={isModDownloading}
        >
          {isModDownloading ? (
            <LoaderCircleIcon className="w-4 h-4 animate-spin" />
          ) : null}
          <span className="pl-2">
            Download{isModDownloading ? "ing" : ""} mod
          </span>
        </Button>
        <Button disabled variant={"outline"}>
          Update mod
        </Button>
        <Button disabled variant={"destructive"}>
          Delete mod
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default ModCard;
