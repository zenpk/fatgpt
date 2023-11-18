import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/InputBar/Button.tsx";
import styles from "./Menu.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import { MENU_ANIMATION_TIME, BACKGROUND_ID } from "@/utils/constants.ts";
import { createPortal } from "react-dom";

export function Menu({
  upside = true,
  setMenuOpen,
  top = 0,
  left = 0,
  right = 0,
  rightSide = false,
  children,
}: {
  upside: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  top: number;
  left?: number;
  right?: number;
  rightSide?: boolean;
  children: ReactNode;
}) {
  const [className, setClassName] = useState(styles.menu);
  useEffect(() => {
    setClassName(`${styles.menu} ${styles.menuAppear}`);
  }, []);

  function clickAreaHandler(evt: React.MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    setClassName(styles.menu);
    setTimeout(() => {
      setMenuOpen(false);
    }, MENU_ANIMATION_TIME);
  }

  const calcTop = upside ? `calc(${top}px - 11rem)` : `calc(${top}px + 2rem)`;
  const position = rightSide
    ? {
        top: calcTop,
        right: `calc(100% - ${right}px)`,
      }
    : {
        top: calcTop,
        left: left,
      };

  return createPortal(
    <>
      <div className={styles.clickArea} onClick={clickAreaHandler}></div>
      <div style={position} className={className}>
        {children}
      </div>
    </>,
    document.getElementById(BACKGROUND_ID)!
  );
}

export function MenuItem({
  children,
  onClick,
  setMenuOpen,
  basicClassName,
  downClassName,
}: {
  children: ReactNode;
  onClick: () => void;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  basicClassName?: string;
  downClassName?: string;
}) {
  return (
    <Button
      basicClassName={
        `${styles.buttonShadow} ${inputBarStyles.button} ${inputBarStyles.buttonText} ` +
        (basicClassName ?? "")
      }
      downClassName={
        `${styles.buttonShadow} ${inputBarStyles.button} ${inputBarStyles.buttonText} ` +
        (downClassName ?? inputBarStyles.sendDark)
      }
      onClick={() => {
        onClick();
        setMenuOpen(false);
      }}
    >
      {children}
    </Button>
  );
}
