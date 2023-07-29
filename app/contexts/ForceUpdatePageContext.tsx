"use client";
import React from "react";

export const ForceUpdatePageContext = React.createContext<() => void>(() => {
  console.log("ForceUpdatePageContext not ready");
});

export function ForceUpdatePageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setValue] = React.useState(0);

  function updateValue() {
    setValue((value) => value + 1);
  }

  return (
    <ForceUpdatePageContext.Provider value={updateValue}>
      {children}
    </ForceUpdatePageContext.Provider>
  );
}
