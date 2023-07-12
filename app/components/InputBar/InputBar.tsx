import React, { RefObject, useContext, useRef, useState } from "react";
import styles from "./InputBar.module.css";
import { BsSendFill } from "react-icons/bs";
import {
  Message,
  MessageActionTypes,
  MessageContext,
} from "@/app/contexts/MessageContext";
import { wsGpt } from "@/app/services/openai";
import { ChatCompletionRequestMessage } from "openai/api";
import { STORAGE_NAME } from "@/app/utils/constants";
import { generateMd } from "@/app/utils/markdown";

export function InputBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState(false);
  const [messages, dispatch] = useContext(MessageContext)!;

  async function handleSend() {
    if (inputRef && inputRef.current && inputRef.current.value) {
      setDisabled(true);
      const token = window.localStorage.getItem(STORAGE_NAME);
      if (token === null) {
        dispatch({
          type: MessageActionTypes.addBot,
          msg: "No Token!",
        });
        setDisabled(false);
        return;
      }
      const transformed = transform(messages, inputRef.current.value);
      dispatch({
        type: MessageActionTypes.addUser,
        msg: inputRef.current.value,
      });
      inputRef.current.value = "";
      await wsGpt(token, transformed, dispatch);
      setDisabled(false);
    }
  }

  return (
    <div className={styles.bar}>
      <Input inputRef={inputRef} handleSend={handleSend} disabled={disabled} />
      <Send handleSend={handleSend} disabled={disabled} />
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
  }

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onClick={handleSend}
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
  inputRef: RefObject<HTMLInputElement> | null;
  handleSend: () => void;
  disabled: boolean;
}) {
  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.key === "Enter") {
      handleSend();
    }
  }

  return (
    <input
      type={"text"}
      className={styles.input}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      disabled={disabled}
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
