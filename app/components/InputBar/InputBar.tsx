import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Menu } from "@headlessui/react";
import styles from "./InputBar.module.css";
import { FaPaperPlane, FaArrowRotateRight, FaHorseHead } from "react-icons/fa6";
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
import { Button } from "@/app/components/InputBar/Button";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [rows, setRows] = useState(1);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [messages, dispatch] = useContext(MessageContext)!;
  const forceUpdate = useContext(ForceUpdateContext);

  async function handleSend(isRetry = false) {
    if (buttonDisabled || inputDisabled) {
      return;
    }
    if (inputRef && inputRef.current && !isRetry) {
      if (inputRef.current.value === "") {
        return;
      }
    }
    const transformed = transform(messages);
    if (inputRef && inputRef.current && inputRef.current.value && !isRetry) {
      transformed.push({
        role: "user",
        content: inputRef.current.value,
      });
      dispatch({
        type: MessageActionTypes.addUser,
        msg: inputRef.current.value,
      });
      inputRef.current.value = "";
      inputRef.current.focus(); // not working
    }
    if (isRetry) {
      // remove the last one, which should be bot error msg
      transformed.splice(transformed.length - 1, 1);
    }
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
  }

  return (
    <div className={styles.bar}>
      <ToolMenu />
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

function Send({
  handleSend,
  disabled,
}: {
  handleSend: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      basicClassName={styles.send}
      downClassName={`${styles.send} ${styles.sendDark}`}
      disabledClassName={`${styles.send} ${styles.sendDisabled}`}
      onClick={handleSend}
      disabled={disabled}
    >
      <FaPaperPlane />
    </Button>
  );
}

function Retry({
  handleSend,
  dispatch,
  setErrorOccurred,
}: {
  handleSend: (isRetry: boolean) => void;
  dispatch: React.Dispatch<MessageActions>;
  setErrorOccurred: Dispatch<SetStateAction<boolean>>;
}) {
  function onClick() {
    setErrorOccurred(false);
    handleSend(true);
    dispatch({ type: MessageActionTypes.deleteBot, msg: "" });
  }

  return (
    <Button
      basicClassName={`${styles.send} ${styles.retry}`}
      downClassName={`${styles.send} ${styles.retryDark}`}
      onClick={onClick}
    >
      <FaArrowRotateRight />
    </Button>
  );
}

function ToolMenu() {
  return (
    <Menu>
      <Menu.Button>
        <Button
          basicClassName={styles.send}
          downClassName={`${styles.send} ${styles.sendDark}`}
          onClick={() => {
            return;
          }}
        >
          <FaHorseHead />
        </Button>
      </Menu.Button>
      <Menu.Items>
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${active && "bg-blue-500"}`}
              href="/account-settings"
            >
              Documentation
            </a>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

function transform(messages: Message[]) {
  const transformed: ChatCompletionRequestMessage[] = [];
  for (const msg of messages) {
    const role = msg.isUser ? "user" : "assistant";
    transformed.push({ role: role, content: msg.msg });
  }
  return transformed;
}
