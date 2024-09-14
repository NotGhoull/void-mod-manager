import { ModInfo } from "../lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface ModItemSheetProps {
  mod: ModInfo;
  trigger: React.ReactNode;
}

function ModItemSheet(props: ModItemSheetProps) {
  console.log("ModItemSheet render:", props.mod);
  return (
    <Sheet>
      <SheetTrigger asChild>{props.trigger}</SheetTrigger>
      <SheetContent side={"bottom"} className="justify-start w-full h-1/2">
        <SheetHeader>
          <div className="flex flex-row gap-5">
            <img
              className="object-cover w-[100px] h-[100px] rounded-xl"
              src={`https://storage.modworkshop.net/mods/images/thumbnail_${
                props.mod.mod_data.thumbnail_url ?? "default"
              }`}
              alt={`${props.mod.mod_data.name} Thumbnail`}
            />
            <div className="flex flex-col w-full align-middle">
              <SheetTitle>{props.mod.mod_data.name}</SheetTitle>
              <SheetDescription>
                By {props.mod.mod_data.author}
              </SheetDescription>
              <p className="text-sm text-muted-foreground">
                {props.mod.mod_data.downloads} Downloads
              </p>
              <p className="text-sm text-muted-foreground">
                Debug information:
              </p>
              <p className="w-full text-sm text-muted-foreground">
                {props.mod.mod_data.id} |
                {props.mod.mod_data.download_type
                  ? props.mod.mod_data.download_type
                  : `Unknown download type [${props.mod.mod_data.download_type}]`}
              </p>
            </div>
          </div>
        </SheetHeader>
        <div className="flex overflow-scroll gap-4 py-4 h-[60%]">
          <p>{props.mod.mod_data.description}</p>
        </div>
        <div className="absolute bottom-0 w-full pt-5">
          <p className="absolute bottom-[15px] bg-opacity-100 p-4 z-50 rounded-xl text-center text-pretty text-muted-foreground">
            Markdown support will be added in the future
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ModItemSheet;
