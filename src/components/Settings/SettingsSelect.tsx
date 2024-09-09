import { SelectItem } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface SettingsSelectProps {
  title: string;
  description: string;
  placeholder: string;
  experimental?: boolean;
  items?: { value: string; label: string }[];
}

function SettingsSelect(props: SettingsSelectProps) {
  return (
    <div>
      <div className="items-start p-4 space-x-3 space-y-0 rounded-md border">
        <p className="pb-3 pl-7 font-bold">{props.title}</p>
        <div className="">
          <Select>
            <SelectTrigger className="pr-3 ml-3 w-[97%]">
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>

            <SelectContent>
              {props.items
                ? props.items.map((item, index) => (
                    <SelectItem key={index} value={item.value}>
                      {item.label ? item.label : "Missing"}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        </div>

        <p className="pl-4 text-muted-foreground">{props.description}</p>
      </div>
    </div>
  );
}

export default SettingsSelect;
