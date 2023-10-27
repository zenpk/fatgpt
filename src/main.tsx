import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/highlightjs.css";
import "./styles/globals.css";
import "./styles/vars.css";
import "./styles/animations.css";
import { ForceUpdateBubbleContextProvider } from "./contexts/ForceUpdateBubbleContext.tsx";
import { MessageContextProvider } from "./contexts/MessageContext.tsx";
import { Home } from "./Home.tsx";
import { authorization } from "@/services/myoauth.ts";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js", { scope: "/" })
    .then((registration) => {
      console.log(`${JSON.stringify(registration)} register succeeded`);
    })
    .catch((error) => {
      console.error(
        `Service worker registration failed with ${JSON.stringify(error)}`
      );
    });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("authorizationCode")) {
  authorization();
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ForceUpdateBubbleContextProvider>
        <MessageContextProvider>
          <Home />
        </MessageContextProvider>
      </ForceUpdateBubbleContextProvider>
    </React.StrictMode>
  );
}
