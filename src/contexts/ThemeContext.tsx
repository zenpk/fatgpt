import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { STORAGE_THEME } from "@/utils/constants.ts";

export const ThemeContext = createContext<
  [string | null, Dispatch<SetStateAction<string | null>>] | null
>(null);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const defaultValue = useState(window.localStorage.getItem(STORAGE_THEME));
  return (
    <ThemeContext.Provider value={defaultValue}>
      {children}
    </ThemeContext.Provider>
  );
}
