import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    {/* <head>
      <link href="./styles.css" rel="stylesheet" />
    </head> */}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </>
);
