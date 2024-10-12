import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ModCard from "../ModCard";
import { Alert, AlertTitle } from "../ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import PopoverCombobox from "../PopoverCombobox";

interface Mod {
  id: number;
  name: string;
  description: string;
  version: number;
  download_url: string;
  installed: boolean;
  thumbnail: string;
}

function ModsPage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [pageState, setPageState] = useState<"errored" | "ready" | "loading">(
    "loading"
  );

  useEffect(() => {
    setPageState("loading");
    const get_data = async () => {
      let data = await invoke<Mod[]>("fetch_payday2_mods");

      // We have to just assume this is going to be the right value, since we don't know yet.
      console.debug(data);
      setMods(data);
      // setTimeout(() => {}, 4000);
      setPageState("ready");
    };

    // setPageState("errored");

    get_data();
  }, []);

  switch (pageState) {
    case "errored":
      return (
        <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Mods for PAYDAY 2
            </h1>
          </div>
          <div className="flex flex-1 p-8 pt-4 pb-4 border border-dashed rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center w-full h-full gap-5">
              <h1 className="text-2xl font-bold">(ノಥ,_｣ಥ)ノ彡┻━┻</h1>
              <p>
                Something went wrong when loading mods, please check console for
                output
              </p>
            </div>
          </div>
        </main>
      );

    case "loading":
      return (
        <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Mods for GameName
            </h1>
          </div>
          <div className="flex flex-1 p-8 pt-4 pb-4 border border-dashed rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center w-full h-full gap-5">
              <h1 className="text-2xl font-bold">The mods are on the way...</h1>
              <div className={`loader`} />
            </div>
          </div>
        </main>
      );
  }

  return (
    <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
      <Alert>
        <TriangleAlertIcon className="z-0 w-4 h-4" />
        <AlertTitle>
          Mods on this page do not currently support the version paramter. Do
          not trust the updater.
        </AlertTitle>
      </Alert>
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold md:text-2xl">Mods for PAYDAY 2</h1>
        {/* <PopoverCombobox /> */}
      </div>

      <div className="flex flex-1 p-8 pt-4 pb-4 border border-dashed rounded-lg shadow-sm">
        <div className="flex flex-col w-full gap-4">
          {/* Mod Card */}
          {mods.map((mod) => (
            <ModCard
              modId={mod.id}
              title={mod.name}
              description={mod.description}
              thumbnailLink={mod.thumbnail}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default ModsPage;
