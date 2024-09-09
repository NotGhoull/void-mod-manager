import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

export interface SettingsProps {
  title: string;
  description?: string;
  experimental?: boolean;
  checked?: boolean;
  onChecked?: (checked: CheckedState) => void;
}

function SettingsCheckbox(props: SettingsProps) {
  return (
    <div>
      <div className="flex flex-row items-center p-4 space-x-3 space-y-0 h-full rounded-md border">
        <div className="flex-col flex-shrink-0">
          <Checkbox
            id="test"
            checked={props.checked}
            onCheckedChange={props.onChecked}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
            <label htmlFor="test" className="font-bold">
              {props.title}
            </label>
            {props.experimental ? (
              <Badge variant={"outline"}>EXPERIMENTAL</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">{props.description}</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsCheckbox;
