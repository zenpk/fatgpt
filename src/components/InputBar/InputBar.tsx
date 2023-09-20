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
import {
  FaArrowRotateRight,
  FaCartFlatbedSuitcase,
  FaFloppyDisk,
  FaHorse,
  FaHorseHead,
  FaPaperPlane,
} from "react-icons/fa6";
import {
  Message,
  MessageActions,
  MessageActionTypes,
  MessageContext,
} from "@/contexts/MessageContext";
import {
  ChatCompletionRequestMessage,
  chatWithWsGpt,
} from "@/services/wsgpt.ts";
import {
  KeyNames,
  STORAGE_MESSAGES,
  STORAGE_ACCESS_TOKEN,
} from "@/utils/constants";
import { Button } from "@/components/InputBar/Button";
import { useAlert } from "@/hooks/useAlert";
import { redirectLogin } from "@/services/myoauth.ts";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [rows, setRows] = useState(1);
  const [messages, dispatch] = useContext(MessageContext)!;

  function handleSend() {
    if (buttonDisabled || inputDisabled) {
      return;
    }
    if (inputRef && inputRef.current) {
      if (inputRef.current.value === "") {
        return;
      } else {
        dispatch({
          type: MessageActionTypes.AddUser,
          msg: inputRef.current.value,
        });
        inputRef.current.value = "";
        inputRef.current.focus(); // not working
        setRows(1);
        dispatch({ type: MessageActionTypes.Callback, callback: handleWsGpt });
      }
    }
  }

  function handleWsGpt() {
    const token = window.localStorage.getItem(STORAGE_ACCESS_TOKEN);
    if (token === null) {
      redirectLogin();
      return;
    }
    setInputDisabled(true);
    setButtonDisabled(true);

    const transformed = transform(messages);
    dispatch({
      type: MessageActionTypes.AddBot,
      msg: "",
    });
    chatWithWsGpt(token, transformed, dispatch, setButtonDisabled);
    setInputDisabled(false);
  }

  return (
    <div className={styles.bar}>
      <ToolMenu messages={messages} dispatch={dispatch} />
      <Input
        inputRef={inputRef}
        handleSend={handleSend}
        disabled={inputDisabled}
        rows={rows}
        setRows={setRows}
      />
      {messages.length > 0 && (
        <Retry
          disabled={buttonDisabled}
          handleWsGpt={handleWsGpt}
          messages={messages}
          dispatch={dispatch}
        />
      )}
      <Send handleSend={handleSend} disabled={buttonDisabled} />
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
    if (evt.shiftKey && evt.key === KeyNames.Enter) {
      return;
    }
    if (evt.ctrlKey && evt.key === KeyNames.Enter) {
      return;
    }
    if (evt.key === KeyNames.Enter && !isMobile) {
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
      basicClassName={`${styles.send} ${styles.buttonFlex}`}
      downClassName={`${styles.send} ${styles.buttonFlex} ${styles.sendDark}`}
      disabledClassName={`${styles.send} ${styles.buttonFlex} ${styles.sendDisabled}`}
      onClick={handleSend}
      disabled={disabled}
    >
      <FaPaperPlane />
    </Button>
  );
}

function Retry({
  disabled,
  handleWsGpt,
  messages,
  dispatch,
}: {
  disabled: boolean;
  handleWsGpt: () => void;
  messages: Message[];
  dispatch: React.Dispatch<MessageActions>;
}) {
  function onClick() {
    if (messages && !messages[messages.length - 1].isUser) {
      dispatch({ type: MessageActionTypes.DeleteBot });
    }
    handleWsGpt();
  }

  return (
    <Button
      basicClassName={`${styles.send} ${styles.buttonFlex} ${styles.retry}`}
      downClassName={`${styles.send} ${styles.buttonFlex} ${styles.retryDark}`}
      disabledClassName={`${styles.send} ${styles.buttonFlex} ${styles.sendDisabled}`}
      disabled={disabled}
      onClick={onClick}
    >
      <FaArrowRotateRight />
    </Button>
  );
}

function ToolMenu({
  messages,
  dispatch,
}: {
  messages: Message[];
  dispatch: Dispatch<MessageActions>;
}) {
  const [menuClassName, setMenuClassName] = useState(styles.toolMenu);
  const [alert, setAlert] = useState("");
  useAlert(alert, setAlert, 1500);

  function saveState() {
    window.localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
    setAlert("Saved successfully!");
  }

  function loadState() {
    const state = window.localStorage.getItem(STORAGE_MESSAGES);
    if (state === null) {
      setAlert("No saved state!");
      return;
    }
    const saved = JSON.parse(state) as Message[];
    dispatch({ type: MessageActionTypes.LoadState, saved: saved });
    setAlert("Loaded successfully!");
  }

  //     {({ open }) => {
  //       if (open) {
  //         setMenuClassName(`${styles.toolMenu} ${styles.toolMenuAppear}`);
  //       } else {
  //         setMenuClassName(styles.toolMenu);
  //       }
  //       return (
  //         <>
  //             <Button
  //               basicClassName={styles.send}
  //               downClassName={`${styles.send} ${styles.sendDark}`}
  //               onClick={() => {
  //                 return;
  //               }}
  //             >
  //               {open ? <FaHorse /> : <FaHorseHead />}
  //             </Button>
  //           </Menu.Button>
  //           <Menu.Items className={menuClassName}>
  //             <Menu.Item>
  //               {({ active }) => {
  //                 return (
  //                   <Button
  //                     basicClassName={`${styles.send} ${styles.textButton}`}
  //                     downClassName={`${styles.send} ${styles.textButton} ${styles.sendDark}`}
  //                     onClick={saveState}
  //                   >
  //                     <div className={styles.textButton}>
  //                       <FaFloppyDisk />
  //                       Save
  //                     </div>
  //                   </Button>
  //                 );
  //               }}
  //             </Menu.Item>
  //             <Menu.Item>
  //               {({ active }) => {
  //                 return (
  //                   <Button
  //                     basicClassName={`${styles.send} ${styles.textButton}`}
  //                     downClassName={`${styles.send} ${styles.textButton} ${styles.sendDark}`}
  //                     onClick={loadState}
  //                   >
  //                     <div className={styles.textButton}>
  //                       <FaCartFlatbedSuitcase />
  //                       Load
  //                     </div>
  //                   </Button>
  //                 );
  //               }}
  //             </Menu.Item>
  //           </Menu.Items>
  //         </>
  //       );
  //     }}
  //   </Menu>
  // );
  return <></>;
}

function transform(messages: Message[]) {
  const transformed: ChatCompletionRequestMessage[] = [];
  for (const msg of messages) {
    const role = msg.isUser ? "user" : "assistant";
    transformed.push({ role: role, content: msg.msg });
  }
  return transformed;
}
