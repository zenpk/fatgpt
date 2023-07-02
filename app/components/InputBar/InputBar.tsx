import React, { RefObject, useContext, useRef, useState } from "react";
import styles from "./InputBar.module.css";
import { BsSendFill } from "react-icons/bs";
import { Message, MessageContext } from "@/app/contexts/MessageContext";
import { chatGPT } from "@/app/services/openai";
import { ChatCompletionRequestMessage } from "openai/api";
import { STORAGE_NAME } from "@/app/utils/constants";

export function InputBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, dispatch] = useContext(MessageContext)!;

  async function handleSend() {
    if (inputRef && inputRef.current) {
      const token = window.localStorage.getItem(STORAGE_NAME);
      if (token === null) {
        return;
      }
      const transformed = transform(messages, inputRef.current.value);
      dispatch({ type: "addUser", msg: inputRef.current.value });
      const response = await chatGPT(transformed, token);
      dispatch({ type: "addBot", msg: response as string });
      inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.bar}>
      <Input inputRef={inputRef} handleSend={handleSend} />
      <Send handleSend={handleSend} />
    </div>
  );
}

function Send({ handleSend }: { handleSend: () => void }) {
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
    >
      <BsSendFill />
    </button>
  );
}

function Input({
  inputRef,
  handleSend,
}: {
  inputRef: RefObject<HTMLInputElement> | null;
  handleSend: () => void;
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
