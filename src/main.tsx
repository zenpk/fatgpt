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
import { PersonaContextProvider } from "@/contexts/PersonaContext.tsx";

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("./sw.js", { scope: "/" })
//     .then((registration) => {
//       console.log(`serviceWorker register succeeded`);
//       console.log(registration);
//     })
//     .catch((error) => {
//       console.error(`serviceWorker registration failed`);
//       console.log(error);
//     });
// }

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("authorizationCode")) {
  authorization();
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ForceUpdateBubbleContextProvider>
        <MessageContextProvider>
          <PersonaContextProvider>
            <Home />
          </PersonaContextProvider>
        </MessageContextProvider>
      </ForceUpdateBubbleContextProvider>
    </React.StrictMode>
  );
}
