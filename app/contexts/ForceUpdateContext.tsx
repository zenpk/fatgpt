"use client";
import React from "react";

export const ForceUpdateContext = React.createContext<() => void>(() => {
  console.log("ForceUpdateContext not ready");
});

export function ForceUpdateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setValue] = React.useState(0);

  function updateValue() {
    setValue((value) => value + 1);
  }

  return (
    <ForceUpdateContext.Provider value={updateValue}>
      {children}
    </ForceUpdateContext.Provider>
  );
}
