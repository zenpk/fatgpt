import "@/app/styles/globals.css";
import "@/app/styles/vars.css";
import "@/app/styles/animations.css";
import React from "react";
import { MessageContextProvider } from "@/app/contexts/MessageContext";
import { ForceUpdateContextProvider } from "@/app/contexts/ForceUpdateContext";

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
          <body>{children}</body>
        </ForceUpdateContextProvider>
      </MessageContextProvider>
    </html>
  );
}
