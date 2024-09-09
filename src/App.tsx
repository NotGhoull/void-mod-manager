import { CheckCircle2Icon, CircleHelpIcon } from "lucide-react";
import ModManager from "./components/ModManager";
import SettingsPage from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { invoke } from "@tauri-apps/api/tauri";
import { useState, useEffect } from "react";
import { AppSettings, GameInformation } from "./lib/types";
import { toast } from "sonner";
import PopoverComboBox from "./components/PopoverComboBox";
import { Button } from "./components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import { Badge } from "./components/ui/badge";
function App() {
  const [settings, setSettings] = useState<AppSettings>();
  const [installedGames, setInstalledGames] = useState<GameInformation[]>([]);
  const [activeFilter, setActiveFilter] = useState("Unknown");
  const [isInstallingProton, setIsInstallingProton] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setSettings(await invoke("load_settings"));
      console.log("Loaded settings!");
      console.log(settings);
    }

    async function getGameInfo() {
      setInstalledGames(await invoke("get_steam_games"));
      console.info(installedGames);
    }

    getGameInfo();
    loadSettings();
    toast.success("Welcome back!", {
      description: "Mod manager loaded sucessfully! (v0.1.1)",
    });
  }, []);

  useEffect(() => {
    if (!settings) {
      return;
    }
    document.documentElement.classList.add(
      settings?.theme == "Dark" ? "dark" : "light"
    );
    if (settings.show_debug_options) {
      toast.info("Debug", {
        description: `Theme set to ${settings?.theme}`,
      });
    }
  }, [settings]);

  return (
    <>
      <Toaster
        theme={settings?.theme == "Dark" ? "dark" : "light"}
        closeButton={true}
        position={"top-center"}
        richColors
      />
      <div>
        <Tabs defaultValue="base" className="z-50 p-2 w-full">
          <TabsList className="grid sticky top-0 z-50 grid-cols-2 w-full shadow-2xl">
            <TabsTrigger value="Get-mods">Get Mods</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="base">
            <h1>
              Welcome to the mod manager! Click a button at the top to get
              started!
            </h1>
            <div className="flex flex-col gap-2 p-5">
              <div className="pb-3">
                <h2 className="text-xl font-bold">
                  We found these games already installed
                </h2>
                <p className="pb-5">Only one game is supported.</p>
                <PopoverComboBox
                  // hint="Set filter"
                  ignoreHint
                  placeholder="+ Select filter"
                  onStateChange={setActiveFilter}
                  options={[
                    {
                      value: "filter.all",
                      label: "All",
                      icon: CircleHelpIcon,
                    },
                    {
                      value: "filter.supported",
                      label: "Supported only",
                      icon: CheckCircle2Icon,
                    },
                  ]}
                />
              </div>
              {installedGames?.map((game: GameInformation, index: number) => {
                return (
                  <div key={index}>
                    {activeFilter == "filter.supported" &&
                    game.app_id == 218620 ? (
                      <div className="flex flex-row items-start p-5 space-x-3 space-y-0 rounded-md border">
                        <div>
                          <img
                            src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/hero_capsule.jpg`}
                            className="align w-[50px]"
                          />
                        </div>
                        <div>
                          <div className="flex flex-row gap-2">
                            <h2 className="font-bold">{game.name}</h2>
                            <h2 className="font-bold">•</h2>
                            <p className="font-semibold">{game.app_id}</p>
                            {game.app_id == 218620 ? (
                              <CheckCircle2Icon />
                            ) : null}
                          </div>
                          <p className="text-muted-foreground">
                            {game.install_dir}
                          </p>
                          {game.app_id == 218620 ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                  Download mod loader
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Install PAYDAY 2 mod loader?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will install the mod loader required to
                                    run payday 2 mods
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <button
                                  onClick={() => setIsInstallingProton(true)}
                                >
                                  <div
                                    className={`w-full rounded-md ${
                                      isInstallingProton
                                        ? "bg-primary-foreground"
                                        : "transition-all"
                                    } hover:bg-primary-foreground`}
                                  >
                                    <div className="flex flex-row items-center p-4 space-x-3 space-y-0 h-full rounded-md border">
                                      <div className="flex flex-col">
                                        <div className="flex flex-row gap-2 items-center">
                                          <h1 className="text-xl font-bold">
                                            Proton
                                          </h1>
                                          <Badge className="h-5">
                                            Recommended
                                          </Badge>
                                        </div>
                                        <p className="text-left text-muted-foreground">
                                          Install the mod loader using the
                                          Proton implimentation
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                <button
                                  onClick={() => setIsInstallingProton(false)}
                                >
                                  <div
                                    className={`w-full rounded-md ${
                                      isInstallingProton
                                        ? "transition-all"
                                        : "bg-primary-foreground"
                                    } hover:bg-primary-foreground animate-ease-in`}
                                  >
                                    <div className="flex flex-row items-center p-4 space-x-3 space-y-0 h-full rounded-md border">
                                      <div className="flex flex-col">
                                        <div className="flex flex-row gap-2">
                                          <h1 className="text-xl font-bold">
                                            Native
                                          </h1>
                                        </div>
                                        <p className="text-left text-muted-foreground">
                                          Install the mod loader using the
                                          native Linux implimentation
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                {/* <p>More content</p> */}
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      toast.info(
                                        "We would do something, but it's not implimented yet, so..."
                                      );
                                    }}
                                  >
                                    Start download
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    {activeFilter == "filter.all" ? (
                      <div className="flex flex-row items-start p-5 space-x-3 space-y-0 rounded-md border">
                        <div>
                          <img
                            src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/hero_capsule.jpg`}
                            className="align w-[50px]"
                            onError={() => {
                              toast.warning("Missing picture", {
                                description: `Failed to get icon for game: ${game.name} (${game.app_id})`,
                              });
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex flex-row gap-2">
                            <h2 className="font-bold">{game.name}</h2>
                            <h2 className="font-bold">•</h2>
                            <p className="">{game.app_id}</p>
                            {game.app_id == 218620 ? (
                              <CheckCircle2Icon />
                            ) : null}
                          </div>
                          <p className="text-muted-foreground">
                            {game.install_dir}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="Get-mods">
            <ModManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default App;
