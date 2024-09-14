import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "../App.css";
import { Button } from "./ui/button";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";
import { AppSettings, GameInformation, ModInfo } from "../lib/types";
import ModItem from "./ModItem";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import GameSelector from "./GameSelector";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

function ModManager() {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [status, setStatus] = useState<Map<number, string>>(new Map());
  const [hasErrored, setHasErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Unknown");
  const [notifyEventHandled, setNotifyEventHandled] = useState(false);
  const [settings, setSettings] = useState<AppSettings>();
  const [selectedGame, setSelectedGame] = useState<GameInformation | null>(
    null
  );

  async function loadMods() {
    console.log("Loading mods...");
    try {
      const mods: ModInfo[] = await invoke("get_mods");
      setMods(mods);
      console.log(mods);
    } catch (error) {
      console.error("Failed to get mods:", error);
      setHasErrored(true);
      setErrorMessage("Failed to get mods: " + error);
    } finally {
      setIsLoading(false);
    }
  }
  // Effect hook to load mods and set up event listeners
  useEffect(() => {
    async function loadSettings() {
      setSettings(await invoke("load_settings"));
      console.log("Loaded settings!");
      console.log(settings);
    }

    async function setupListeners() {
      const modDownloadStartedListener = await listen(
        "mod_download_started",
        (event) => {
          const id = event.payload as number;
          setStatus((prevStatus) =>
            new Map(prevStatus).set(id, "Downloading...")
          );
        }
      );

      const modWritingListener = await listen("mod_writing", (event) => {
        const id = event.payload as number;
        setStatus((prevStatus) => new Map(prevStatus).set(id, "Saving..."));
      });

      const modFinishingUpListener = await listen(
        "mod_finishing_up",
        (event) => {
          const id = event.payload as number;
          setStatus((prevStatus) =>
            new Map(prevStatus).set(id, "Finishing up...")
          );
        }
      );

      const modDoneListener = await listen("mod_done", (event) => {
        const id = event.payload as number;
        setStatus((prevStatus) => new Map(prevStatus).set(id, "Downloaded"));
      });

      const modErrorListener = await listen("mod_error", (event) => {
        if (notifyEventHandled) return;
        setNotifyEventHandled(true);
        setStatus((prevStatus) =>
          new Map(prevStatus).set(-1, `Error: ${event.payload}`)
        );
      });

      // Clean up listeners when component unmounts
      return () => {
        listen("mod_download_started", modDownloadStartedListener);
        listen("mod_writing", modWritingListener);
        listen("mod_finishing_up", modFinishingUpListener);
        listen("mod_done", modDoneListener);
        listen("mod_error", modErrorListener);
      };
    }

    // Initialize listeners and load mods
    setupListeners();
    loadMods();
    loadSettings();

    // Cleanup listeners on component unmount
    return () => {
      // cleanupListeners();
      console.log("Done!");
    };
  }, []);

  // Effect to handle status updates and show toasts
  useEffect(() => {
    status.forEach((message, id) => {
      if (id === -1) {
        toast.error(message, {
          description: "An error occurred during mod processing.",
        });
      } else if (message === "Downloaded") {
        toast.success("Mod downloaded!");
      } else {
        toast.info(message);
      }
    });
  }, [status]); // Run when status changes

  return (
    <div className="">
      {/* Loader component displayed when loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-screen h-screen gap-5">
          <h1 className="text-2xl font-bold">The mods are on the way...</h1>
          <div
            className={`loader${settings?.theme == "Light" ? "-light" : ""}`}
          />
        </div>
      ) : null}

      {/* Error message displayed when an error occurs */}
      {hasErrored ? (
        <div className="flex flex-col items-center justify-center w-screen h-screen gap-5">
          <h1 className="text-3xl font-extrabold">(╯°□°）╯︵ ┻━┻</h1>
          <p className="text-lg">{errorMessage}</p>
          <Button
            onClick={() => window.location.reload()}
            variant={"secondary"}
          >
            Try Again
          </Button>
          {settings?.show_debug_options ? (
            <Button onClick={() => setHasErrored(false)}>
              [DEBUG] Force hide
            </Button>
          ) : null}
        </div>
      ) : null}

      {settings?.show_debug_options ? (
        <div>
          <p>Debug options</p>
          <Button onClick={() => setIsLoading(true)}>Set loading</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                onClick={() => {
                  // setErrorMessage(
                  //   "The error message would go here, but since you've clicked the button, I don't know what else to tell you"
                  // );
                  // setHasErrored(true);
                }}
              >
                Set errored
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">
                    Set error information
                  </h4>
                </div>
                <div className="grid gap-2">
                  <div className="grid items-center grid-cols-3 gap-4">
                    <Label htmlFor="width">Error title</Label>
                    <Input
                      id="width"
                      defaultValue="(╯°□°）╯︵ ┻━┻"
                      disabled={true}
                      className="h-8 col-span-2"
                    />
                  </div>
                  <div className="grid items-center grid-cols-3 gap-4">
                    <Label htmlFor="maxWidth">Error message</Label>
                    <Input
                      id="maxWidth"
                      defaultValue={
                        errorMessage ? errorMessage : "You clicked the button!"
                      }
                      className="h-8 col-span-2"
                      onChange={(event) => {
                        setErrorMessage(event.target.value);
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setHasErrored(true);
                    }}
                  >
                    Fire error
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : null}

      <GameSelector onGameSelect={setSelectedGame} />
      {selectedGame?.app_id == 218620 ? (
        <div className="grid gap-8 p-6">
          {mods.map((mod: ModInfo, _) => (
            <ModItem mod={mod} status={status} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-screen h-screen gap-5">
          {selectedGame ? (
            <>
              <h1 className="text-2xl font-bold">
                Sorry, {selectedGame?.name} is not supported yet!
              </h1>
              <p>
                We are working on adding support for more games. In the
                meantime, you can check out the mods that are currently
                supported. If you want to request support for your game, you can
                make a issue on github!
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold">
              Select a game to get started!
            </h1>
          )}
        </div>
      )}

      {/* Pagination (TODO) */}
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          {/* TODO programmatically add pages depending on response from mod.mod_meta */}
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              onClick={() => {
                toast("No");
              }}
            >
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>3</PaginationLink>
          </PaginationItem>
          <PaginationEllipsis />
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default ModManager;
