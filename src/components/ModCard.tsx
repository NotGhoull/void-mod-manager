import { DownloadCloudIcon, HeartIcon, UploadCloudIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface ModCardProps {
  thumbnailLink: string;
  title: string;
  description: string;

  //   Meta
  downloads?: number;
  likes?: number;
  update?: string;
}

function ModCard(props: ModCardProps) {
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
          <p>Buttons don't work, since this isn't done yet</p>
        </div>
        <Separator className="bg-foreground" />
        <Button disabled>Download mod</Button>
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
