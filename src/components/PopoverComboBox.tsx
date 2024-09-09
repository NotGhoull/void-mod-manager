import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export interface PopverComboxProps {
  hint?: string;
  placeholder: string;
  noResults?: string;

  ignoreHint?: boolean;

  onStateChange: (newState: string) => void;

  options: Status[];
}

function PopoverComboBox(props: PopverComboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  React.useEffect(() => {
    if (!selectedStatus) {
      return;
    }
    props.onStateChange(selectedStatus?.value);
  }, [selectedStatus]);

  return (
    <div className="flex items-center space-x-4">
      {props.ignoreHint ? null : (
        <p className="text-sm text-muted-foreground">{props.hint}</p>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start">
            {selectedStatus ? (
              <>
                <selectedStatus.icon className="mr-2 w-4 h-4 shrink-0" />
                {selectedStatus.label}
              </>
            ) : (
              <>{props.placeholder}</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder={props.placeholder} />
            <CommandList>
              <CommandEmpty>
                {props.noResults ? props.noResults : "No results found :("}
              </CommandEmpty>
              <CommandGroup>
                {props.options.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      console.log("Something clicked...");
                      console.info(value);
                      setSelectedStatus(
                        props.options.find(
                          (priority) => priority.value === value
                        ) || null
                      );
                      setOpen(false);
                    }}
                  >
                    <status.icon
                      className={cn(
                        "mr-2 h-4 w-4",
                        status.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40"
                      )}
                    />
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default PopoverComboBox;
