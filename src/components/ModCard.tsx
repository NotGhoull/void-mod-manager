import { DownloadCloudIcon, HeartIcon, UploadCloudIcon } from "lucide-react";

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
    <div className="flex flex-row w-full gap-4 p-4 text-white bg-gray-800 rounded-md shadow-lg">
      {/* Image Section */}
      <div>
        <img
          src={props.thumbnailLink ?? "https://via.placeplachholder.com/100"}
          width={"100px"}
          height={"100px"}
          alt="mod icon"
          className="rounded-lg"
        />
      </div>

      {/* Text Section */}
      <div className="flex flex-col justify-center flex-1">
        <h1 className="text-xl font-bold">
          {props.title ?? "No title provided."}
        </h1>
        <p className="text-sm text-gray-400">
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
  );
}

export default ModCard;
