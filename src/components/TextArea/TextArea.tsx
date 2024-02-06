import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { KeyNames } from "@/utils/constants.ts";
import styles from "./TextArea.module.css";
import { useDark } from "@/hooks/useDark.ts";

export function TextArea({
  inputRef,
  className = "",
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
  }, []);

  useEffect(() => {
    if (isMobile && placeholderForMobile !== undefined) {
      setPlaceholderFinal(placeholderForMobile);
    } else if (placeholder) {
      setPlaceholderFinal(placeholder);
    }
  }, [isMobile, placeholder, placeholderForMobile]);

  function handleKeyDown(evt: React.KeyboardEvent) {
    // new line
    if (evt.shiftKey && evt.key === KeyNames.Enter) {
      return;
    }
    if (evt.ctrlKey && evt.key === KeyNames.Enter) {
      return;
    }
    // send
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
    // handle terminal gestures
    // clear
    if (evt.ctrlKey && evt.key === KeyNames.U) {
      if (inputRef && inputRef.current) {
        inputRef.current.value = "";
      }
      evt.preventDefault();
      evt.stopPropagation();
    }
    // move the cursor to the end
    if (evt.ctrlKey && evt.key === KeyNames.E) {
      if (inputRef && inputRef.current) {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
      }
      evt.preventDefault();
      evt.stopPropagation();
    }
    // move the cursor forward by a word
    if (evt.altKey && evt.key === KeyNames.F) {
      if (inputRef && inputRef.current) {
        const currentPos = inputRef.current.selectionStart;
        if (currentPos === inputRef.current.value.length) return;
        const startsWithSpace = inputRef.current.value[currentPos] === " ";
        for (let i = currentPos; i < inputRef.current.value.length; i++) {
          if ((inputRef.current.value[i] === " ") !== startsWithSpace) {
            inputRef.current.setSelectionRange(i, i);
            break;
          }
          if (i === inputRef.current.value.length - 1) {
            inputRef.current.setSelectionRange(i + 1, i + 1);
          }
        }
      }
      evt.preventDefault();
      evt.stopPropagation();
    }
    // move the cursor backward by a word
    if (evt.altKey && evt.key === KeyNames.B) {
      if (inputRef && inputRef.current) {
        let currentPos = inputRef.current.selectionStart;
        if (currentPos === 0) return;
        if (currentPos <= 1) {
          inputRef.current.setSelectionRange(0, 0);
          return;
        }
        const startsWithSpace = inputRef.current.value[currentPos - 1] === " ";
        for (let i = currentPos; i > 0; i--) {
          if ((inputRef.current.value[i - 1] === " ") !== startsWithSpace) {
            inputRef.current.setSelectionRange(i, i);
            break;
          }
          if (i === 1) {
            inputRef.current.setSelectionRange(0, 0);
          }
        }
      }
      evt.preventDefault();
      evt.stopPropagation();
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
      className={useDark(`${styles.input} ${className}`, styles.inputDark)}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      defaultValue={defaultValue ?? ""}
      disabled={disabled ?? false}
      rows={rows}
      onChange={handleChange}
    />
  );
}
