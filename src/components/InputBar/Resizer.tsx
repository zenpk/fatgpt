import React, { RefObject, useEffect } from "react";
import styles from "./InputBar.module.css";

export function Resizer({
  minHeight,
  maxHeight,
  target,
}: {
  minHeight?: number;
  maxHeight?: number;
  target: RefObject<HTMLDivElement>;
}) {
  const [startY, setStartY] = React.useState(0);
  const [minH, setMinH] = React.useState(minHeight);
  const [maxH, setMaxH] = React.useState(maxHeight);

  useEffect(() => {
    if (!maxH) {
      setMaxH(window.innerHeight / 2);
    }
    if (!minH) {
      setMinH(target.current?.getBoundingClientRect().height || 0);
    }
  }, [maxH, minH, target]);

  useEffect(() => {
    if (target && target.current) {
      setStartY(target.current.getBoundingClientRect().bottom);
    }
  }, [target]);

  function mouseDown(e: React.MouseEvent) {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    e.preventDefault();
    e.stopPropagation();
  }

  function mouseMove(e: MouseEvent) {
    if (target && target.current) {
      let newHeight = -(e.clientY - startY);
      if (minH && newHeight < minH) {
        newHeight = minH;
      }
      if (maxH && newHeight > maxH) {
        newHeight = maxH;
      }
      target.current.style.height = `${newHeight}px`;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function mouseUp() {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }

  return <div className={styles.resizer} onMouseDown={mouseDown}></div>;
}
