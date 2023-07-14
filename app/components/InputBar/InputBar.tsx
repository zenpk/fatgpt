import React, { RefObject, useContext, useRef, useState } from "react";
import styles from "./InputBar.module.css";
import { BsSendFill } from "react-icons/bs";
import {
  Message,
  MessageActionTypes,
  MessageContext,
} from "@/app/contexts/MessageContext";
import { wsGpt } from "@/app/services/wsgpt";
import { ChatCompletionRequestMessage } from "openai/api";
import { KeyNames, STORAGE_NAME } from "@/app/utils/constants";
import { ForceUpdateContext } from "@/app/contexts/ForceUpdateContext";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [messages, dispatch] = useContext(MessageContext)!;
  const forceUpdate = useContext(ForceUpdateContext);

  async function handleSend() {
    if (buttonDisabled || inputDisabled) {
      return;
    }
    if (inputRef && inputRef.current) {
      if (inputRef.current.value === "") {
        dispatch({
          type: MessageActionTypes.addBot,
          msg: "You need to at least say something...",
        });
        return;
      }
    }
    if (inputRef && inputRef.current && inputRef.current.value) {
      dispatch({
        type: MessageActionTypes.addUser,
        msg: inputRef.current.value,
      });
      const token = window.localStorage.getItem(STORAGE_NAME);
      if (token === null) {
        dispatch({
          type: MessageActionTypes.addBot,
          msg: "No Token!",
        });
        return;
      }
      setInputDisabled(true);
      setButtonDisabled(true);
      const transformed = transform(messages, inputRef.current.value);
      inputRef.current.value = "";
      dispatch({
        type: MessageActionTypes.addBot,
        msg: "",
      });
      await wsGpt(token, transformed, dispatch, forceUpdate, setButtonDisabled);
      setInputDisabled(false);
      inputRef.current.focus();
    }
  }

  return (
    <div className={styles.bar}>
      <Input
        inputRef={inputRef}
        handleSend={handleSend}
        disabled={inputDisabled}
      />
      <Send handleSend={handleSend} disabled={buttonDisabled} />
    </div>
  );
}

function Send({
  handleSend,
  disabled,
}: {
  handleSend: () => void;
  disabled: boolean;
}) {
  const [className, setClassName] = useState(styles.send);

  function handleDown() {
    setClassName(`${styles.send} ${styles.sendDark}`);
  }

  function handleUp() {
    setClassName(`${styles.send}`);
    handleSend();
  }

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      disabled={disabled}
    >
      <BsSendFill />
    </button>
  );
}

function Input({
  inputRef,
  handleSend,
  disabled,
}: {
  inputRef: RefObject<HTMLTextAreaElement> | null;
  handleSend: () => void;
  disabled: boolean;
}) {
  const [rows, setRows] = useState(1);
  const maxRows = 10;

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.shiftKey && evt.key === KeyNames.enter) {
      return;
    }
    if (evt.key === KeyNames.enter) {
      handleSend();
      evt.preventDefault();
    }
  }

  function handleChange() {
    if (inputRef && inputRef.current) {
      const newLineCount =
        (inputRef.current.value.match(/\n/g) || []).length + 1;
      if (newLineCount <= maxRows) {
        setRows(newLineCount);
      }
    }
  }

  return (
    <textarea
      placeholder={"Say something... (Press Shift + Enter to add a new line)"}
      className={styles.input}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      rows={rows}
      onChange={handleChange}
    />
  );
}

function transform(messages: Message[], newMessage: string) {
  const transformed: ChatCompletionRequestMessage[] = [];
  for (const msg of messages) {
    const role = msg.isUser ? "user" : "assistant";
    transformed.push({ role: role, content: msg.msg });
  }
  transformed.push({ role: "user", content: newMessage });
  return transformed;
}
