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
  STORAGE_ACCESS_TOKEN,
  STORAGE_MESSAGES,
} from "@/utils/constants";
import { Button } from "@/components/InputBar/Button";
import { useAlert } from "@/hooks/useAlert";
import { redirectLogin } from "@/services/myoauth.ts";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext.tsx";
import { Menu, MenuItem } from "@/components/Menu/Menu.tsx";
import { getBound } from "@/utils/boundRect.ts";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [rows, setRows] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [triggerWsgpt, setTriggerWsgpt] = useState(0);

  const [messages, dispatch] = useContext(MessageContext)!;
  const forceUpdateBubble = useContext(ForceUpdateBubbleContext);

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
        inputRef.current.focus();
        inputRef.current.select();
        setRows(1);
        setTriggerWsgpt((prev) => prev + 1);
      }
    }
  }

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputRef]);

  useEffect(() => {
    if (triggerWsgpt > 0) {
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
      chatWithWsGpt(
        token,
        transformed,
        dispatch,
        setButtonDisabled,
        forceUpdateBubble
      );
      setInputDisabled(false);
    }
  }, [triggerWsgpt]);

  return (
    <div className={styles.bar}>
      <MenuButton
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuButtonRef={menuButtonRef}
      />
      <ToolMenu
        messages={messages}
        dispatch={dispatch}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuButtonRef={menuButtonRef}
      />
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
          setTriggerWsgpt={setTriggerWsgpt}
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
  setTriggerWsgpt,
  messages,
  dispatch,
}: {
  disabled: boolean;
  setTriggerWsgpt: Dispatch<SetStateAction<number>>;
  messages: Message[];
  dispatch: React.Dispatch<MessageActions>;
}) {
  function onClick() {
    if (messages && !messages[messages.length - 1].isUser) {
      dispatch({ type: MessageActionTypes.DeleteBot });
    }
    setTriggerWsgpt((prev) => prev + 1);
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
  menuOpen,
  setMenuOpen,
  menuButtonRef,
}: {
  messages: Message[];
  dispatch: Dispatch<MessageActions>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}) {
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

  const { top: top, left: left } = getBound(menuButtonRef);

  return menuOpen ? (
    <Menu upside={true} setMenuOpen={setMenuOpen} top={top} left={left}>
      <>
        <MenuItem onClick={saveState} setMenuOpen={setMenuOpen}>
          <div className={styles.textButton}>
            <FaFloppyDisk />
            Save
          </div>
        </MenuItem>
        <MenuItem onClick={loadState} setMenuOpen={setMenuOpen}>
          <div className={styles.textButton}>
            <FaCartFlatbedSuitcase />
            Load
          </div>
        </MenuItem>
      </>
    </Menu>
  ) : (
    <></>
  );
}

function MenuButton({
  menuOpen,
  setMenuOpen,
  menuButtonRef,
}: {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <Button
      basicClassName={`${styles.send} ${styles.buttonFlex}`}
      downClassName={`${styles.send} ${styles.sendDark} ${styles.buttonFlex}`}
      onClick={() => {
        setMenuOpen(true);
      }}
      myRef={menuButtonRef}
    >
      {menuOpen ? <FaHorse /> : <FaHorseHead />}
    </Button>
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
