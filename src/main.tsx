import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/highlightjs.css";
import "./styles/globals.css";
import "./styles/vars.css";
import "./styles/animations.css";
import { ForceUpdateBubbleContextProvider } from "./contexts/ForceUpdateBubbleContext.tsx";
import { MessageContextProvider } from "./contexts/MessageContext.tsx";
import { ForceUpdatePageContextProvider } from "./contexts/ForceUpdatePageContext.tsx";
import { Home } from "./Home.tsx";
import { authorization } from "@/services/myoauth.ts";

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("authorizationCode")) {
  authorization();
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ForceUpdatePageContextProvider>
        <ForceUpdateBubbleContextProvider>
          <MessageContextProvider>
            <Home />
          </MessageContextProvider>
        </ForceUpdateBubbleContextProvider>
      </ForceUpdatePageContextProvider>
    </React.StrictMode>
  );
}
