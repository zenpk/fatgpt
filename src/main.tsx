import React from "react";
import ReactDOM from "react-dom/client";
import { ForceUpdateBubbleContextProvider } from "./contexts/ForceUpdateBubbleContext.tsx";
import { MessageContextProvider } from "./contexts/MessageContext.tsx";
import { InputRowsContextProvider } from "./contexts/InputRowsContext.tsx";
import { ForceUpdatePageContextProvider } from "./contexts/ForceUpdatePageContext.tsx";
import { Root } from "./root.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ForceUpdatePageContextProvider>
      <ForceUpdateBubbleContextProvider>
        <MessageContextProvider>
          <InputRowsContextProvider>
            <Root />
          </InputRowsContextProvider>
        </MessageContextProvider>
      </ForceUpdateBubbleContextProvider>
    </ForceUpdatePageContextProvider>
  </React.StrictMode>
);
