import React, {
  Dispatch,
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
  FaTrashCan,
  FaUserPen,
  FaMoon,
  FaSun,
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
  DARK_THEME_NAME,
  STORAGE_ACCESS_TOKEN,
  STORAGE_MESSAGES,
  STORAGE_PERSONA,
  STORAGE_THEME,
} from "@/utils/constants";
import { Button } from "@/components/InputBar/Button";
import { redirectLogin } from "@/services/myoauth.ts";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext.tsx";
import { Menu, MenuItem } from "@/components/Menu/Menu.tsx";
import { getBound } from "@/utils/boundRect.ts";
import { PersonaContext } from "@/contexts/PersonaContext.tsx";
import { PopupInput } from "@/components/PopupInput/PopupInput.tsx";
import { TextArea } from "@/components/TextArea/TextArea.tsx";
import { useNotificationContext } from "@/contexts/NotificationContext.tsx";
import { ThemeContext } from "@/contexts/ThemeContext.tsx";
import { ConnectWsGptContext } from "@/contexts/ConnectWsGptContext.tsx";

export function InputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [rows, setRows] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wsGptSocket, setWsGptSocket] = useState<WebSocket | null>(null);
  const [showPopupInput, setShowPopupInput] = useState(false);

  const [messages, dispatch] = useContext(MessageContext)!;
  const [persona, setPersona] = useContext(PersonaContext)!;
  const [connectWsGpt, setConnectWsGpt] = useContext(ConnectWsGptContext)!;
  const [, setNotification] = useNotificationContext();
  const forceUpdateBubble = useContext(ForceUpdateBubbleContext);

  function handleSend() {
    if (connectWsGpt || inputDisabled) {
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
        setConnectWsGpt(true);
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
    if (connectWsGpt) {
      const token = window.localStorage.getItem(STORAGE_ACCESS_TOKEN);
      if (token === null) {
        redirectLogin();
        return;
      }
      setInputDisabled(true);
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
          setConnectWsGpt,
          forceUpdateBubble
        )
      );
      setInputDisabled(false);
    }
  }, [connectWsGpt]);

  return (
    <div className={styles.bar}>
      {showPopupInput && (
        <PopupInput
          title={"Set FatGPT's Identity"}
          placeholder={"e.g. You are a Go programmer."}
          value={persona}
          setValue={setPersona}
          setShowPopupInput={setShowPopupInput}
          setNotification={() => {
            setNotification({ success: true, msg: "Persona set" });
          }}
        />
      )}
      <MenuButton
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuButtonRef={menuButtonRef}
        disabled={connectWsGpt}
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
      {connectWsGpt && <Stop wsGptSocket={wsGptSocket} />}
      {messages.length > 0 && !connectWsGpt && (
        <Retry
          setTriggerWsgpt={setConnectWsGpt}
          messages={messages}
          dispatch={dispatch}
        />
      )}
      <TextArea
        inputRef={inputRef}
        handleEnter={handleSend}
        disabled={inputDisabled}
        rows={rows}
        setRows={setRows}
        placeholder={"(Press Shift + Enter to add a new line)"}
        placeholderForMobile={""}
        maxRows={10}
      />
      <Send handleSend={handleSend} disabled={connectWsGpt} />
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
  setTriggerWsgpt: Dispatch<SetStateAction<boolean>>;
  messages: Message[];
  dispatch: React.Dispatch<MessageActions>;
}) {
  function onClick() {
    if (messages && !messages[messages.length - 1].isUser) {
      dispatch({ type: MessageActionTypes.DeleteBot });
    }
    setTriggerWsgpt(true);
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

function Stop({ wsGptSocket }: { wsGptSocket: WebSocket | null }) {
  function onClick() {
    if (wsGptSocket) {
      wsGptSocket.close();
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
  // const [alert, setAlert] = useState("");
  // useAlert(alert, setAlert, 1500);
  const [, setNotification] = useNotificationContext();

  function saveState() {
    window.localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
    window.localStorage.setItem(STORAGE_PERSONA, persona);
    setNotification({ success: true, msg: "All data saved" });
  }

  function loadState() {
    const state = window.localStorage.getItem(STORAGE_MESSAGES);
    if (state === null) {
      setNotification({ success: false, msg: "No saved data" });
      return;
    }
    const saved = JSON.parse(state) as Message[];
    dispatch({ type: MessageActionTypes.LoadState, saved: saved });
    const persona = window.localStorage.getItem(STORAGE_PERSONA);
    if (persona) {
      setPersona(persona);
    }
    setNotification({ success: true, msg: "Data loaded from localStorage" });
  }

  function clearAll() {
    dispatch({ type: MessageActionTypes.DeleteAll });
    setNotification({ success: true, msg: "Messages cleared" });
  }

  function openPopupInput() {
    setShowPopupInput(true);
  }

  const { top: top, left: left } = getBound(menuButtonRef);

  const [theme, setTheme] = useContext(ThemeContext)!;

  function toggleThemeStorage() {
    if (theme === DARK_THEME_NAME) {
      window.localStorage.removeItem(STORAGE_THEME);
      setTheme(null);
    } else {
      window.localStorage.setItem(STORAGE_THEME, DARK_THEME_NAME);
      setTheme(DARK_THEME_NAME);
    }
  }

  return menuOpen ? (
    <Menu
      upside={true}
      setMenuOpen={setMenuOpen}
      top={top}
      left={left}
      offset={17}
    >
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
        <MenuItem onClick={clearAll} setMenuOpen={setMenuOpen}>
          <>
            <FaTrashCan />
            Clear
          </>
        </MenuItem>
        <MenuItem onClick={openPopupInput} setMenuOpen={setMenuOpen}>
          <>
            <FaUserPen />
            Set Persona
          </>
        </MenuItem>
        <MenuItem onClick={toggleThemeStorage} setMenuOpen={setMenuOpen}>
          <>
            {theme === DARK_THEME_NAME ? (
              <>
                <FaSun />
                Use Light Theme
              </>
            ) : (
              <>
                <FaMoon />
                Use Dark Theme
              </>
            )}
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
  disabled,
}: {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
  disabled: boolean;
}) {
  return (
    <Button
      basicClassName={`${styles.button} ${styles.buttonSquareFlex}`}
      downClassName={`${styles.button} ${styles.sendDark} ${styles.buttonSquareFlex}`}
      disabledClassName={`${styles.button} ${styles.buttonSquareFlex} ${styles.buttonDisabled}`}
      onClick={() => {
        setMenuOpen(true);
      }}
      myRef={menuButtonRef}
      disabled={disabled}
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
