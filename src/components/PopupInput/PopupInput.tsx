import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./PopupInput.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import { BACKGROUND_ID, KeyNames } from "@/utils/constants.ts";
import { createPortal } from "react-dom";
import { Button } from "@/components/InputBar/Button.tsx";
import { TextArea } from "@/components/TextArea/TextArea.tsx";
import { useDark } from "@/hooks/useDark.ts";

export function PopupInput({
  title,
  setValue,
  setShowPopupInput,
  value,
  placeholder,
  setNotification,
}: {
  title: string;
  setValue: Dispatch<SetStateAction<string>>;
  setShowPopupInput: Dispatch<SetStateAction<boolean>>;
  value?: string;
  placeholder?: string;
  setNotification?: () => void;
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState(1);
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
    if (inputRef.current) {
      setValue(inputRef.current.value);
      closeModal();
      if (setNotification) {
        setNotification();
      }
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
    <dialog
      className={useDark(styles.dialog, styles.dialogDark)}
      ref={dialogRef}
      onClick={closeModal}
    >
      <div
        className={styles.container}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1>{title}</h1>
        <TextArea
          placeholder={placeholder ?? ""}
          inputRef={inputRef}
          defaultValue={value}
          className={inputBarStyles.input}
          handleEnter={handleOk}
          rows={rows}
          setRows={setRows}
        />
        <div className={styles.buttonContainer}>
          <Button
            basicClassName={`${styles.button} ${inputBarStyles.button} ${inputBarStyles.buttonCancel}`}
            downClassName={`${styles.button} ${inputBarStyles.button} ${inputBarStyles.buttonCancelDark}`}
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            basicClassName={`${styles.button} ${inputBarStyles.button}`}
            downClassName={`${styles.button} ${inputBarStyles.button} ${inputBarStyles.sendDark}`}
            onClick={handleOk}
          >
            OK
          </Button>
        </div>
      </div>
    </dialog>,
    document.getElementById(BACKGROUND_ID)!
  );
}
