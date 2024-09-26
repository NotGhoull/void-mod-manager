import { ModInfo } from "@/lib/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface ModManagerSearchProps {
  mods: ModInfo[];
}

function ModManagerSearch(_: ModManagerSearchProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mods, setMods] = useState<ModInfo[]>();

  useEffect(() => {
    const handleOpenCommand = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    const handleEnterSearch = async (e: KeyboardEvent) => {
      console.log(e.key);
      if (e.key === "Enter") {
        e.preventDefault();
        console.log("Searching with: " + searchQuery);
        setMods(await invoke("get_mods", { query: searchQuery }));
        console.log(mods);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleOpenCommand);
    document.addEventListener("keydown", handleEnterSearch);
    return () => {
      document.removeEventListener("keydown", handleOpenCommand);
      document.removeEventListener("keydown", handleEnterSearch);
    };
  }, [searchQuery]);

  return (
    <>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={searchQuery}
          onValueChange={(e) => {
            setSearchQuery(e.toString());
            console.log(`Debug - SearchQuery: ${searchQuery}`);
          }}
        />

        <CommandList>
          <CommandEmpty>Press enter to search</CommandEmpty>
          <CommandGroup heading="info">
            <CommandItem disabled>
              Note: Sometimes the ModworkshopAPI doesn't accept query the first
              couple times, please retry if it doesn't show up correctly.
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Mods">
            {mods ? (
              mods.map((mod: ModInfo, _) => (
                <CommandItem className="p-3">
                  <div className="flex flex-row">
                    <img
                      src={`https://storage.modworkshop.net/mods/images/thumbnail_${mod.mod_data.thumbnail_url}`}
                      width={150}
                      className="p-2"
                    />
                    <div className="flex flex-col">
                      <span>{mod.mod_data.name}</span>
                      <span>{mod.mod_data.author}</span>
                    </div>
                  </div>
                </CommandItem>
              ))
            ) : (
              <h1>No mods found.</h1>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default ModManagerSearch;
