import { DARK_THEME_NAME } from "@/utils/constants.ts";
import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext.tsx";

export function useDark(className: string, darkClassName: string) {
  const [theme] = useContext(ThemeContext)!;
  if (theme === DARK_THEME_NAME) {
    return `${className} ${darkClassName}`;
  }
  return className;
}
