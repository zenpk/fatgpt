import React, { Dispatch, SetStateAction, useEffect } from "react";
import styles from "./PopupInput.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import { BACKGROUND_ID, KeyNames } from "@/utils/constants.ts";
import { createPortal } from "react-dom";
import { Button } from "@/components/InputBar/Button.tsx";

export function PopupInput({
  title,
  setValue,
  setShowPopupInput,
  value,
  placeholder,
}: {
  title: string;
  setValue: Dispatch<SetStateAction<string>>;
  setShowPopupInput: Dispatch<SetStateAction<boolean>>;
  value?: string;
  placeholder?: string;
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [dialogRef]);

  function closeModal() {
    if (dialogRef.current) {
      dialogRef.current.close();
      setShowPopupInput(false);
    }
  }

  function handleOk() {
    if (inputRef.current && inputRef.current.value) {
      setValue(inputRef.current.value);
      closeModal();
    }
  }

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.key === KeyNames.Enter) {
      evt.preventDefault();
      handleOk();
    }
  }

  useEffect(() => {
    function escPressed(e: KeyboardEvent) {
      if (e.key === KeyNames.Escape) {
        closeModal();
      }
    }

    window.addEventListener("keydown", escPressed);
    return () => window.removeEventListener("keydown", escPressed);
  }, [dialogRef]);

  return createPortal(
    <dialog className={styles.dialog} ref={dialogRef} onClick={closeModal}>
      <div
        className={styles.container}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1>{title}</h1>
        <textarea
          placeholder={placeholder ?? ""}
          ref={inputRef}
          defaultValue={value}
          className={inputBarStyles.input}
          onKeyDown={handleKeyDown}
        />
        <Button
          basicClassName={`${styles.button} ${inputBarStyles.button}`}
          downClassName={`${styles.button} ${inputBarStyles.button} ${inputBarStyles.sendDark}`}
          onClick={handleOk}
        >
          OK
        </Button>
      </div>
    </dialog>,
    document.getElementById(BACKGROUND_ID)!
  );
}
