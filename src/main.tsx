import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/highlightjs.css";
import "./styles/globals.css";
import "./styles/vars.css";
import "./styles/animations.css";
import { ForceUpdateBubbleContextProvider } from "./contexts/ForceUpdateBubbleContext.tsx";
import { MessageContextProvider } from "./contexts/MessageContext.tsx";
import { ForceUpdatePageContextProvider } from "./contexts/ForceUpdatePageContext.tsx";
import { Root } from "./root.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ForceUpdatePageContextProvider>
      <ForceUpdateBubbleContextProvider>
        <MessageContextProvider>
          <Root />
        </MessageContextProvider>
      </ForceUpdateBubbleContextProvider>
    </ForceUpdatePageContextProvider>
  </React.StrictMode>
);
