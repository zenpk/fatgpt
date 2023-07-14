import "@/app/styles/globals.css";
import "@/app/styles/vars.css";
import "@/app/styles/animations.css";
import "@/app/styles/highlightjs.css";
import React from "react";
import { MessageContextProvider } from "@/app/contexts/MessageContext";
import { ForceUpdateContextProvider } from "@/app/contexts/ForceUpdateContext";
import { InputRowsContextProvider } from "@/app/contexts/InputRowsContext";

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
        <ForceUpdateContextProvider>
          <InputRowsContextProvider>
            <body>{children}</body>
          </InputRowsContextProvider>
        </ForceUpdateContextProvider>
      </MessageContextProvider>
    </html>
  );
}
