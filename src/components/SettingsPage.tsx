import { useEffect, useState } from "react";
import SettingsCheckbox from "./Settings/SettingsCheckbox";
import { Badge } from "./ui/badge";
import { AppSettings } from "@/lib/types";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "./ui/button";
import { toast } from "sonner";
import SettingsInput from "./Settings/SettingsInput";
import { SaveIcon } from "lucide-react";
// import { Checkbox } from "./ui/checkbox";

function SettingsPage() {
  async function loadSettings(): Promise<AppSettings> {
    return await invoke("load_settings");
  }

  const [settings, setSettings] = useState<AppSettings | null>(null);
  useEffect(() => {
    loadSettings().then(setSettings);
    if (!settings) {
      return;
    }
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-row gap-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Badge className="text-lg font-bold" variant={"outline"}>
          Experimental
        </Badge>
      </div>
      <p className="pb-4">Only settings from the config are displayed here.</p>
      <Button
        onClick={async () => {
          if (settings) {
            await invoke("save_settings", { settings });
            toast("Saved!");
            window.location.reload();
          }
        }}
        className="mb-5"
      >
        <SaveIcon className="mr-2 w-5 h-5" />
        Save and reload
      </Button>
      <div className="flex flex-col gap-3">
        <SettingsCheckbox
          title="Light mode"
          description="Enables Light mode"
          checked={settings?.theme != "Dark" ? true : false}
          onChecked={(checked) => {
            if (!settings?.theme) {
              return;
            }

            if (checked) {
              setSettings({ ...settings, theme: "Light" });
            } else {
              setSettings({ ...settings, theme: "Dark" });
            }
          }}
        />
        <SettingsCheckbox
          title="Debug mode"
          description="Shows debug options"
          checked={settings?.show_debug_options}
          onChecked={(checked) => {
            if (settings?.show_debug_options == null) {
              toast.error("Failed to find key.");
              return;
            }

            if (checked) {
              setSettings({ ...settings, show_debug_options: true });
            } else {
              setSettings({ ...settings, show_debug_options: false });
            }
          }}
        />

        <SettingsInput
          title="Mod download path"
          description="The path that mods are downloaded to"
          experimental
          placeholder="Something went wrong"
          onChange={(newText) => {
            if (settings) {
              setSettings({ ...settings, download_path: newText });
            }
          }}
          value={settings?.download_path}
        />
      </div>
    </div>
  );
}

export default SettingsPage;
