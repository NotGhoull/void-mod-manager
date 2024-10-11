import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ModCard from "../ModCard";

interface Mod {
  id: number;
  name: string;
  version: number;
  download_url: string;
  installed: boolean;
}

function ModsPage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [pageState, setPageState] = useState<"errored" | "ready" | "loading">(
    "errored"
  );

  useEffect(() => {
    setPageState("loading");
    const get_data = async () => {
      let data = await invoke<Mod[]>("fetch_payday2_mods");

      // We have to just assume this is going to be the right value, since we don't know yet.
      setMods(data);
      setTimeout(() => {}, 4000);
      setPageState("ready");
    };

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
            <div className="flex flex-col gap-1">Good things are coming...</div>
          </div>
        </main>
      );

    case "loading":
      return <h1>Loading...</h1>;
  }

  return (
    <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Mods for PAYDAY 2</h1>
      </div>

      <div className="flex flex-1 p-8 pt-4 pb-4 border border-dashed rounded-lg shadow-sm">
        <div className="flex flex-col w-full gap-4">
          {/* Mod Card */}
          {mods.map((mod) => (
            <ModCard
              title={mod.name}
              description="This was created from rust server side!"
              thumbnailLink="placehold.co/100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default ModsPage;
