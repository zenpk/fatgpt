import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { KeyNames } from "@/utils/constants.ts";
import styles from "./TextArea.module.css";

export function TextArea({
  inputRef,
  className,
  handleEnter,
  handleEscape,
  rows,
  setRows,
  disabled,
  placeholder,
  placeholderForMobile,
  maxRows,
  defaultValue,
}: {
  inputRef: RefObject<HTMLTextAreaElement> | null;
  className?: string;
  handleEnter: () => void;
  handleEscape?: () => void;
  rows: number;
  setRows: Dispatch<SetStateAction<number>>;
  disabled?: boolean;
  placeholder?: string;
  placeholderForMobile?: string;
  maxRows?: number;
  defaultValue?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [placeholderFinal, setPlaceholderFinal] = useState("");

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
    handleChange();
  }, [handleChange]);

  useEffect(() => {
    if (isMobile && placeholderForMobile !== undefined) {
      setPlaceholderFinal(placeholderForMobile);
    } else if (placeholder) {
      setPlaceholderFinal(placeholder);
    }
  }, [isMobile, placeholder, placeholderForMobile]);

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.shiftKey && evt.key === KeyNames.Enter) {
      return;
    }
    if (evt.ctrlKey && evt.key === KeyNames.Enter) {
      return;
    }
    if (evt.key === KeyNames.Enter && !isMobile) {
      evt.preventDefault();
      evt.stopPropagation();
      handleEnter();
    }
    if (evt.key === KeyNames.Escape && handleEscape) {
      evt.preventDefault();
      evt.stopPropagation();
      handleEscape();
    }
  }

  function handleChange() {
    if (inputRef && inputRef.current) {
      const newLineCount =
        (inputRef.current.value.match(/[\n\r]/g) || []).length + 1;
      if (maxRows) {
        if (newLineCount <= maxRows) {
          setRows(newLineCount);
        } else {
          setRows(maxRows);
        }
      } else {
        setRows(newLineCount);
      }
    }
  }

  return (
    <textarea
      placeholder={placeholderFinal}
      className={`${styles.input} ${className ?? ""}`}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      defaultValue={defaultValue ?? ""}
      disabled={disabled ?? false}
      rows={rows}
      onChange={handleChange}
    />
  );
}
