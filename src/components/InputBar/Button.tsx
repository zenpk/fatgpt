import React, { useEffect } from "react";
import { useDark } from "@/hooks/useDark.ts";

export function Button({
  basicClassName,
  downClassName,
  disabledClassName = basicClassName,
  onClick,
  children,
  disabled = false,
  myRef,
}: {
  basicClassName: string;
  downClassName: string;
  disabledClassName?: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  myRef?: React.RefObject<HTMLButtonElement>;
}) {
  const [className, setClassName] = React.useState(basicClassName);

  useEffect(() => {
    if (disabled) {
      setClassName(`${disabledClassName} ${downClassName}`);
    } else {
      setClassName(`${basicClassName} ${downClassName}`);
    }
  }, [basicClassName, disabled, disabledClassName]);

  return (
    <button
      className={useDark(className, "dark")}
      onClick={onClick}
      disabled={disabled}
      ref={myRef}
    >
      {children}
    </button>
  );
}
