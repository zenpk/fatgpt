import React, { useEffect } from "react";

export function Button({
  basicClassName,
  downClassName,
  disabledClassName = basicClassName,
  onClick,
  children,
  disabled = false,
}: {
  basicClassName: string;
  downClassName: string;
  disabledClassName?: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [className, setClassName] = React.useState(basicClassName);

  function handleDown() {
    setClassName(downClassName);
  }

  function handleUp() {
    setClassName(basicClassName);
    onClick();
  }

  function handleLeave() {
    setClassName(basicClassName);
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
    >
      {children}
    </button>
  );
}
