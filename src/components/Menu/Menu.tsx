import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/InputBar/Button.tsx";
import styles from "./Menu.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import { MenuStatusContext } from "@/contexts/MenuStatusContext.tsx";

export function Menu({
  upside,
  children,
}: {
  upside: boolean;
  children: ReactNode;
}) {
  const [className, setClassName] = useState(styles.menu);
  const [menuStatus, setMenuStatus] = useContext(MenuStatusContext)!;

  useEffect(() => {
    setMenuStatus(true);
  }, [setMenuStatus]);

  useEffect(() => {
    if (!menuStatus) {
      setClassName(styles.menu);
    } else {
      setClassName(`${styles.menu} ${styles.menuAppear}`);
    }
  }, [menuStatus]);

  return (
    <div className={upside ? className : `${className} ${styles.downside}`}>
      {children}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  setMenuOpen,
}: {
  children: ReactNode;
  onClick: () => void;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      basicClassName={`${inputBarStyles.send} ${inputBarStyles.textButton}`}
      downClassName={`${inputBarStyles.send} ${inputBarStyles.textButton} ${inputBarStyles.sendDark}`}
      onClick={() => {
        onClick();
        setMenuOpen(false);
      }}
    >
      {children}
    </Button>
  );
}
