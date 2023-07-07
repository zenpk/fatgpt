"use client";
import { useEffect, useState } from "react";

export function useWidth() {
  const [width, setWidth] = useState(-1);
  useEffect(() => {
    setWidth(window.innerWidth);

    function onResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}
