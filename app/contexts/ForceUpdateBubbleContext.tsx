"use client";
import React from "react";

export const ForceUpdateBubbleContext = React.createContext<() => void>(() => {
  console.log("ForceUpdateBubbleContext not ready");
});

export function ForceUpdateBubbleContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setValue] = React.useState(0);

  function updateValue() {
    setValue((value) => value + 1);
  }

  return (
    <ForceUpdateBubbleContext.Provider value={updateValue}>
      {children}
    </ForceUpdateBubbleContext.Provider>
  );
}
