import { ReactNode } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export interface NavbarLinkProps {
  // Appears on all types
  text: String;
  children: ReactNode;
  onClick?: () => void;
  collapsed?: boolean;

  // Active specific
  active?: boolean;

  // Notification specific
  hasNotifications?: boolean;
  notificationAmount?: String;
}

// Note Children in this context assumes an icon
function NavbarLink(props: NavbarLinkProps) {
  return (
    <Button
      variant={"ghost"}
      onClick={props.onClick}
      //   className="flex justify-start gap-3"
      className={`flex justify-start gap-3 rounded-lg ${
        props.active ? "bg-muted text-primary" : "text-muted-foreground"
      } px-3 py-2 transition-all hover:text-primary`}
    >
      {/* < className="h-4 w-4" /> */}
      {props.children}

      {(!props.collapsed && props.text) ?? "Missing text"}
      {!props.collapsed &&
      props.hasNotifications &&
      props.notificationAmount ? (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
          {props.notificationAmount ?? "?"}
        </Badge>
      ) : null}
    </Button>
  );
}

export default NavbarLink;
