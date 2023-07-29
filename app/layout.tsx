import "@/app/styles/globals.css";
import "@/app/styles/vars.css";
import "@/app/styles/animations.css";
import "@/app/styles/highlightjs.css";
import React from "react";
import { MessageContextProvider } from "@/app/contexts/MessageContext";
import { ForceUpdateBubbleContextProvider } from "@/app/contexts/ForceUpdateBubbleContext";
import { InputRowsContextProvider } from "@/app/contexts/InputRowsContext";
import { ForceUpdatePageContextProvider } from "@/app/contexts/ForceUpdatePageContext";

export const metadata = {
  title: "FatGPT",
  description: "FatGPT is a frontend wrapper of ChatGPT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <MessageContextProvider>
        <ForceUpdatePageContextProvider>
          <ForceUpdateBubbleContextProvider>
            <InputRowsContextProvider>
              <body>{children}</body>
            </InputRowsContextProvider>
          </ForceUpdateBubbleContextProvider>
        </ForceUpdatePageContextProvider>
      </MessageContextProvider>
    </html>
  );
}
