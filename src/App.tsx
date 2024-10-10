import { useState } from "react";
import ModsPage from "./components/Pages/ModsPage";
import Navbar from "./components/navbar";
import UpdaterPage from "./components/Pages/UpdaterPage";
import ModLoaderPage from "./components/Pages/ModLoaderPage";
import ConfigTweakerPage from "./components/Pages/ConfigTweakerPage";
import ProfilesPage from "./components/Pages/ProfilesPage";

function App() {
  const [activeState, setActiveState] = useState<
    | "mods"
    | "updates"
    | "mod_loader"
    | "config_tweaker"
    | "profiles"
    | "settings"
  >("mods");

  return (
    <div>
      {/* Render the navbar */}
      {/* Because of how this works, we pass the child element into the navbar. */}
      <Navbar onStateChanged={setActiveState}>
        {activeState == "mods" ? <ModsPage /> : null}
        {activeState == "updates" ? <UpdaterPage /> : null}
        {activeState == "mod_loader" ? <ModLoaderPage /> : null}
        {activeState == "config_tweaker" ? <ConfigTweakerPage /> : null}
        {activeState == "profiles" ? <ProfilesPage /> : null}
        {activeState == "settings" ? <UpdaterPage /> : null}
      </Navbar>
    </div>
  );
}

export default App;
