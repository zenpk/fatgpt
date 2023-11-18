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
  FaRegSquare,
  FaUserPen,
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
  STORAGE_PERSONA,
} from "@/utils/constants";
import { Button } from "@/components/InputBar/Button";
import { useAlert } from "@/hooks/useAlert";
import { redirectLogin } from "@/services/myoauth.ts";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext.tsx";
import { Menu, MenuItem } from "@/components/Menu/Menu.tsx";
import { getBound } from "@/utils/boundRect.ts";
import { PersonaContext } from "@/contexts/PersonaContext.tsx";
import { PopupInput } from "@/components/PopupInput/PopupInput.tsx";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [rows, setRows] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [triggerWsgpt, setTriggerWsgpt] = useState(0);
  const [wsGptSocket, setWsGptSocket] = useState<WebSocket | null>(null);
  const [showPopupInput, setShowPopupInput] = useState(false);

  const [messages, dispatch] = useContext(MessageContext)!;
  const [persona, setPersona] = useContext(PersonaContext)!;
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

      const transformed = transform(messages, persona);
      dispatch({
        type: MessageActionTypes.AddBot,
        msg: "",
      });
      setWsGptSocket(
        chatWithWsGpt(
          token,
          transformed,
          dispatch,
          setButtonDisabled,
          forceUpdateBubble
        )
      );
      setInputDisabled(false);
    }
  }, [triggerWsgpt]);

  return (
    <div className={styles.bar}>
      {showPopupInput && (
        <PopupInput
          title={"Edit FatGPT's identity"}
          placeholder={"e.g. You are a Go programmer."}
          value={persona}
          setValue={setPersona}
          setShowPopupInput={setShowPopupInput}
        />
      )}
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
        setShowPopupInput={setShowPopupInput}
        persona={persona}
        setPersona={setPersona}
      />
      {buttonDisabled && (
        <Stop wsGptSocket={wsGptSocket} setButtonDisabled={setButtonDisabled} />
      )}
      {messages.length > 0 && !buttonDisabled && (
        <Retry
          setTriggerWsgpt={setTriggerWsgpt}
          messages={messages}
          dispatch={dispatch}
        />
      )}
      <Input
        inputRef={inputRef}
        handleSend={handleSend}
        disabled={inputDisabled}
        rows={rows}
        setRows={setRows}
      />
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
      basicClassName={`${styles.button} ${styles.buttonSquareFlex}`}
      downClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.sendDark}`}
      disabledClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.buttonDisabled}`}
      onClick={handleSend}
      disabled={disabled}
    >
      <FaPaperPlane />
    </Button>
  );
}

function Retry({
  setTriggerWsgpt,
  messages,
  dispatch,
}: {
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
      basicClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.retry}`}
      downClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.retryDark}`}
      onClick={onClick}
    >
      <FaArrowRotateRight />
    </Button>
  );
}

function Stop({
  wsGptSocket,
  setButtonDisabled,
}: {
  wsGptSocket: WebSocket | null;
  setButtonDisabled: Dispatch<SetStateAction<boolean>>;
}) {
  function onClick() {
    if (wsGptSocket) {
      wsGptSocket.close();
      setButtonDisabled(false);
    }
  }

  return (
    <Button
      basicClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.stop}`}
      downClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.stopDark}`}
      onClick={onClick}
    >
      <FaRegSquare />
    </Button>
  );
}

function ToolMenu({
  messages,
  dispatch,
  menuOpen,
  setMenuOpen,
  menuButtonRef,
  setShowPopupInput,
  persona,
  setPersona,
}: {
  messages: Message[];
  dispatch: Dispatch<MessageActions>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
  setShowPopupInput: Dispatch<SetStateAction<boolean>>;
  persona: string;
  setPersona: Dispatch<SetStateAction<string>>;
}) {
  const [alert, setAlert] = useState("");
  useAlert(alert, setAlert, 1500);

  function saveState() {
    window.localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
    window.localStorage.setItem(STORAGE_PERSONA, persona);
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
    const persona = window.localStorage.getItem(STORAGE_PERSONA);
    if (persona) {
      setPersona(persona);
    }
    setAlert("Loaded successfully!");
  }

  function openPopupInput() {
    setShowPopupInput(true);
  }

  const { top: top, left: left } = getBound(menuButtonRef);

  return menuOpen ? (
    <Menu upside={true} setMenuOpen={setMenuOpen} top={top} left={left}>
      <>
        <MenuItem onClick={saveState} setMenuOpen={setMenuOpen}>
          <>
            <FaFloppyDisk />
            Save
          </>
        </MenuItem>
        <MenuItem onClick={loadState} setMenuOpen={setMenuOpen}>
          <>
            <FaCartFlatbedSuitcase />
            Load
          </>
        </MenuItem>
        <MenuItem onClick={openPopupInput} setMenuOpen={setMenuOpen}>
          <>
            <FaUserPen />
            Set Persona
          </>
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
      basicClassName={`${styles.button} ${styles.buttonSquareFlex}`}
      downClassName={`${styles.button} ${styles.sendDark} ${styles.buttonSquareFlex}`}
      onClick={() => {
        setMenuOpen(true);
      }}
      myRef={menuButtonRef}
    >
      {menuOpen ? <FaHorse /> : <FaHorseHead />}
    </Button>
  );
}

function transform(messages: Message[], persona: string) {
  const transformed: ChatCompletionRequestMessage[] = [];
  if (persona.length > 0) {
    transformed.push({ role: "system", content: persona });
  }
  for (const msg of messages) {
    const role = msg.isUser ? "user" : "assistant";
    transformed.push({ role: role, content: msg.msg });
  }
  return transformed;
}
