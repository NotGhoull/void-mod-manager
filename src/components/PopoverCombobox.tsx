import { CommandIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

function PopoverCombobox() {
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <Button
            variant={"outline"}
            role="combobox"
            className="justify-between"
          >
            Select filter..
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search filters" />
            <CommandList>
              <CommandEmpty>No filters found :(</CommandEmpty>
              <CommandGroup className="p-2">
                <CommandItem value="hud">
                  This doesn't actually do anything yet
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default PopoverCombobox;
