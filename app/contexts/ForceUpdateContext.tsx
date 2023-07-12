import React from "react";

export const ForceUpdateContext = React.createContext<
  [number, () => void] | null
>(null);

export function ForceUpdateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(0);

  function updateValue() {
    setValue((value) => value + 1);
  }

  return (
    <ForceUpdateContext.Provider value={[value, updateValue]}>
      {children}
    </ForceUpdateContext.Provider>
  );
}
