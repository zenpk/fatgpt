import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./InputBar.module.css";
import { FaPaperPlane, FaArrowRotateRight } from "react-icons/fa6";
import {
  Message,
  MessageActions,
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
  const [rows, setRows] = useState(1);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [messages, dispatch] = useContext(MessageContext)!;
  const forceUpdate = useContext(ForceUpdateContext);

  async function handleSend() {
    if (buttonDisabled || inputDisabled) {
      return;
    }
    if (inputRef && inputRef.current) {
      if (inputRef.current.value === "") {
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
          msg: "No Token! (Normally, you shouldn't see this. Try refreshing the page and you'll be guided to the login page)",
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
      setRows(1);
      await wsGpt(
        token,
        transformed,
        dispatch,
        forceUpdate,
        setButtonDisabled,
        setErrorOccurred
      );
      setInputDisabled(false);
      inputRef.current.focus(); // not working
    }
  }

  return (
    <div className={styles.bar}>
      <Input
        inputRef={inputRef}
        handleSend={handleSend}
        disabled={inputDisabled}
        rows={rows}
        setRows={setRows}
      />
      {!errorOccurred && (
        <Send handleSend={handleSend} disabled={buttonDisabled} />
      )}
      {errorOccurred && (
        <Retry
          handleSend={handleSend}
          dispatch={dispatch}
          setErrorOccurred={setErrorOccurred}
        />
      )}
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

  function handleLeave() {
    setClassName(`${styles.send}`);
  }

  useEffect(() => {
    if (disabled) {
      setClassName(`${styles.send} ${styles.sendDisabled}`);
    } else {
      setClassName(`${styles.send}`);
    }
  }, [disabled]);

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleLeave}
      disabled={disabled}
    >
      <FaPaperPlane />
    </button>
  );
}

function Input({
  inputRef,
  handleSend,
  disabled,
  rows,
  setRows,
}: {
  inputRef: RefObject<HTMLTextAreaElement> | null;
  handleSend: () => void;
  disabled: boolean;
  rows: number;
  setRows: Dispatch<SetStateAction<number>>;
}) {
  const maxRows = 10;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.shiftKey && evt.key === KeyNames.enter) {
      return;
    }
    if (evt.ctrlKey && evt.key === KeyNames.enter) {
      return;
    }
    if (evt.key === KeyNames.enter && !isMobile) {
      evt.preventDefault();
      handleSend();
    }
  }

  function handleChange() {
    if (inputRef && inputRef.current) {
      const newLineCount =
        (inputRef.current.value.match(/[\n\r]/g) || []).length + 1;
      if (newLineCount <= maxRows) {
        setRows(newLineCount);
      } else {
        setRows(maxRows);
      }
    }
  }

  return (
    <textarea
      placeholder={!isMobile ? "(Press Shift + Enter to add a new line)" : ""}
      className={styles.input}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      rows={rows}
      onChange={handleChange}
    />
  );
}

function Retry({
  handleSend,
  dispatch,
  setErrorOccurred,
}: {
  handleSend: () => void;
  dispatch: React.Dispatch<MessageActions>;
  setErrorOccurred: Dispatch<SetStateAction<boolean>>;
}) {
  const [className, setClassName] = useState(`${styles.send} ${styles.retry}`);

  function handleDown() {
    setClassName(`${styles.send} ${styles.retryDark}`);
  }

  function handleUp() {
    setClassName(`${styles.send} ${styles.retry}`);
    dispatch({ type: MessageActionTypes.deleteBot, msg: "" });
    handleSend();
  }

  function handleLeave() {
    setClassName(`${styles.send} ${styles.retry}`);
  }

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleLeave}
    >
      <FaArrowRotateRight />
    </button>
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
