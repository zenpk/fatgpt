import React from "react";

export const ConnectWsGptContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null);

export function ConnectWsGptContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultVal = React.useState(false);
  return (
    <ConnectWsGptContext.Provider value={defaultVal}>
      {children}
    </ConnectWsGptContext.Provider>
  );
}
