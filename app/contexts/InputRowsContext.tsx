// unused
"use client";
import React, { Dispatch, SetStateAction } from "react";

export const InputRowsContext = React.createContext<
  [number, Dispatch<SetStateAction<number>>]
>([
  1,
  () => {
    console.log("InputRowsContext not ready");
  },
]);

export function InputRowsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InputRowsContext.Provider value={React.useState(1)}>
      {children}
    </InputRowsContext.Provider>
  );
}
