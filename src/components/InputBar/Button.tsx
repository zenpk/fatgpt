import React, { useEffect } from "react";

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
  const [isDown, setIsDown] = React.useState(false);

  function handleDown() {
    setIsDown(true);
    setClassName(downClassName);
  }

  function handleUp() {
    if (isDown) {
      setClassName(basicClassName);
      onClick();
    }
    setIsDown(false);
  }

  function handleLeave() {
    if (isDown) {
      setClassName(basicClassName);
    }
    setIsDown(false);
  }

  useEffect(() => {
    if (disabled) {
      setClassName(disabledClassName);
    } else {
      setClassName(basicClassName);
    }
  }, [basicClassName, disabled, disabledClassName]);

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleLeave}
      disabled={disabled}
      ref={myRef}
    >
      {children}
    </button>
  );
}
