import { useState, useEffect } from "react";
import { AppSettings, GameInformation } from "../lib/types";
import { invoke } from "@tauri-apps/api/tauri";
import {
  CheckCircle2Icon,
  GamepadIcon,
  EyeIcon,
  EyeOffIcon,
  BugIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Toggle } from "./ui/toggle";

interface GameSelectorProps {
  onGameSelect: (game: GameInformation) => void;
}

function GameSelector({ onGameSelect }: GameSelectorProps) {
  const [installedGames, setInstalledGames] = useState<GameInformation[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameInformation | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [showUnsupported, setShowUnsupported] = useState(false);
  const [settings, setSettings] = useState<AppSettings>();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    async function getGameInfo() {
      const games: GameInformation[] = await invoke("get_steam_games");
      setInstalledGames(games);
    }

    async function loadSettings() {
      setSettings(await invoke("load_settings"));
    }

    loadSettings();
    getGameInfo();
  }, []);

  const handleGameSelect = (game: GameInformation) => {
    setSelectedGame(game);
    onGameSelect(game);
    setIsOpen(false);
    toast.success(`Selected ${game.name}`);
  };

  const filteredGames = showUnsupported
    ? installedGames
    : installedGames.filter((game) => game.app_id === 218620);

  const supportedGamesExist = installedGames.some(
    (game) => game.app_id === 218620
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="fixed z-50 bottom-4 left-4">
          <GamepadIcon className="w-4 h-4 mr-2" />
          {selectedGame ? selectedGame.name : "Select Game"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 transition-all duration-300 w-80"
        side="top"
        align="start"
      >
        <div className="p-4 pb-5">
          <h2 className="text-lg font-semibold">Select Active Game</h2>
          <p className="text-sm text-muted-foreground">
            Choose the game you want to manage mods for:
          </p>
          {supportedGamesExist ? (
            <Toggle
              className="mt-3"
              pressed={showUnsupported}
              onPressedChange={setShowUnsupported}
            >
              {showUnsupported ? (
                <EyeOffIcon className="w-4 h-4 mr-2" />
              ) : (
                <EyeIcon className="w-4 h-4 mr-2" />
              )}
              {showUnsupported ? "Hide Unsupported" : "Show All"}
            </Toggle>
          ) : (
            <div className="mt-3">
              <p className="mb-2 text-sm text-muted-foreground">
                No supported games found.
              </p>
              <p>
                Did you know, you can force show them by turning on debug mode?
              </p>
              {settings?.show_debug_options ? (
                <Toggle pressed={showDebug} onPressedChange={setShowDebug}>
                  <BugIcon className="w-4 h-4 mr-2" />
                  Show All Games (Debug)
                </Toggle>
              ) : null}
            </div>
          )}
        </div>
        <div className="overflow-scroll max-h-[300px]">
          <div className="grid gap-4 p-4">
            {(showDebug ? installedGames : filteredGames).map((game) => (
              <Button
                key={game.app_id}
                className={`justify-start w-full p-4 ${
                  selectedGame?.app_id === game.app_id
                    ? "bg-primary-foreground"
                    : ""
                }`}
                variant={"outline"}
                onClick={() => handleGameSelect(game)}
              >
                <img
                  src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/hero_capsule.jpg`}
                  className="w-8 h-auto p-1 mr-2 rounded"
                  onError={(e) => {
                    e.currentTarget.src = "path/to/fallback/image.jpg"; // Add a fallback image
                  }}
                />
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <span className="font-semibold">{game.name}</span>
                    {game.app_id === 218620 && (
                      <CheckCircle2Icon className="w-4 h-4 ml-2" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {game.app_id}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default GameSelector;
