// navbar.tsx

import {
  CloudUpload,
  Package,
  PanelLeftCloseIcon,
  PuzzleIcon,
  Search,
  SettingsIcon,
  Users,
  Wrench,
} from "lucide-react";

import { Input } from "./ui/input";
import { ReactNode, useState } from "react";
import NavbarLink from "./navbarLink";

export interface NavbarProps {
  onStateChanged: (
    newState:
      | "mods"
      | "updates"
      | "mod_loader"
      | "config_tweaker"
      | "profiles"
      | "settings"
  ) => void;

  children: ReactNode;
}

export default function Navbar(props: NavbarProps) {
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);

  const [activeState, setActiveState] = useState<
    | "mods"
    | "updates"
    | "mod_loader"
    | "config_tweaker"
    | "profiles"
    | "settings"
  >("mods");

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Sidebar (NavBar) */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out border-r bg-muted/40 ${
          navbarCollapsed ? "w-[70px]" : "w-[220px] lg:w-[280px]"
        }`}
      >
        <div className="flex flex-col h-full gap-4">
          {/* Title */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            {!navbarCollapsed && (
              <p className="flex flex-col gap-0 font-semibold">
                <span className="">Void mod manager</span>
                <span className="text-sm text-muted-foreground">
                  v0.2.1 - Dev branch
                </span>
              </p>
            )}
          </div>

          {/* Buttons & icons */}
          <div className="flex-1 overflow-hidden">
            <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
              <NavbarLink
                text={"Mods"}
                active={activeState == "mods"}
                onClick={() => {
                  setActiveState("mods");
                  props.onStateChanged("mods");
                }}
                collapsed={navbarCollapsed}
              >
                <PuzzleIcon className="w-4 h-4" />
              </NavbarLink>

              <NavbarLink
                text={"Mod Updater"}
                onClick={() => {
                  setActiveState("updates");
                  props.onStateChanged("updates");
                }}
                active={activeState == "updates"}
                hasNotifications
                notificationAmount={"6"}
                collapsed={navbarCollapsed}
              >
                <CloudUpload className="w-4 h-4" />
              </NavbarLink>

              <NavbarLink
                text={"Mod loader"}
                onClick={() => {
                  setActiveState("mod_loader");
                  props.onStateChanged("mod_loader");
                }}
                active={activeState == "mod_loader"}
                collapsed={navbarCollapsed}
              >
                <Package className="w-4 h-4" />
              </NavbarLink>

              <NavbarLink
                text={"Config tweaker"}
                onClick={() => {
                  setActiveState("config_tweaker");
                  props.onStateChanged("config_tweaker");
                }}
                active={activeState == "config_tweaker"}
                collapsed={navbarCollapsed}
              >
                <Wrench className="w-4 h-4" />
              </NavbarLink>

              <NavbarLink
                text={"Profiles"}
                onClick={() => {
                  setActiveState("profiles");
                  props.onStateChanged("profiles");
                }}
                active={activeState == "profiles"}
                collapsed={navbarCollapsed}
              >
                <Users className="w-4 h-4" />
              </NavbarLink>
            </nav>
          </div>
          <div className="w-full p-4 mt-auto">
            <NavbarLink
              text={"Close navbar"}
              onClick={() => setNavbarCollapsed(!navbarCollapsed)}
              collapsed={navbarCollapsed}
            >
              <PanelLeftCloseIcon className="w-4 h-4" />
            </NavbarLink>
            <NavbarLink text={"Settings"} collapsed={navbarCollapsed}>
              <SettingsIcon className="w-4 h-4" />
            </NavbarLink>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out flex flex-col w-full ${
          navbarCollapsed
            ? "ml-[70px] lg:ml-[70px]"
            : "ml-[220px] lg:ml-[280px]"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-muted/40 backdrop-blur-md px-4 lg:h-[60px] lg:px-6">
          <div className="flex-1 w-full">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search mods for Cyberpunk 2077..."
                  className="w-full pl-8 shadow-none appearance-none bg-background md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
        </header>

        {/* Scrollable Content */}
        {props.children}
      </div>
    </div>
  );
}
