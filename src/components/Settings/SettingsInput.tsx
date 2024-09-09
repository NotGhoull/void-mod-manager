import { Input } from "../ui/input";
import { useEffect, useState } from "react";

export interface SettingsInput {
  title: string;
  description: string;
  placeholder: string;
  experimental?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

function SettingsInput(props: SettingsInput) {
  const [internalValue, setInternalValue] = useState("");

  useEffect(() => {
    if (!props.value) {
      return;
    }
    setInternalValue(props.value);
  }, [props.value]);

  useEffect(() => {
    if (!props.onChange) {
      return;
    }
    console.log("Value updated: " + internalValue);
    props.onChange(internalValue);
  }, [internalValue]);

  return (
    <div>
      <div className="items-start p-4 space-x-3 space-y-0 rounded-md border">
        <p className="pb-3 pl-7 font-bold">{props.title}</p>
        <div className="pl-3">
          <Input
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
            }}
          />
        </div>

        <p className="pl-4 text-muted-foreground">{props.description}</p>
      </div>
    </div>
  );
}

export default SettingsInput;
