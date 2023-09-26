import React from "react";

export function getBound(ref: React.RefObject<HTMLElement>) {
  if (!ref || !ref.current) {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }
  const rect = ref.current.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
}
