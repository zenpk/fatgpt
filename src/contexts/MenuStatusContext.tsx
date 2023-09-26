import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

export const MenuStatusContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | null
>(null);

export function MenuCloseContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue = useState(false);

  return (
    <MenuStatusContext.Provider value={defaultValue}>
      {children}
    </MenuStatusContext.Provider>
  );
}
