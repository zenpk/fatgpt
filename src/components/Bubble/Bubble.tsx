import styles from "./Bubble.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import bot from "@/bot-40x40.png";
import user from "@/user-40x40.png";
import {
  Message,
  MessageActionTypes,
  MessageContext,
} from "@/contexts/MessageContext";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext";
import { generateMd } from "@/utils/markdown";
import { Menu, MenuItem } from "@/components/Menu/Menu.tsx";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";
import { PopupInput } from "@/components/PopupInput/PopupInput.tsx";
import { useDark } from "@/hooks/useDark.ts";
import { ConnectWsGptContext } from "@/contexts/ConnectWsGptContext.tsx";

type Position = {
  top: number;
  left: number;
  right?: number;
  bottom?: number;
};

export function Bubble({ msg }: { msg: Message }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgForPopup, setMsgForPopup] = useState("");
  const [popupInputOpen, setPopupInputOpen] = useState(false);
  const avatarRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const [, dispatch] = useContext(MessageContext)!;

  const className = msg.isUser
    ? ` ${styles.bubbleUser}`
    : ` ${styles.bubbleBot}`;
  const darkClassName = msg.isUser
    ? styles.bubbleUserDark
    : styles.bubbleBotDark;
  const forceUpdate = useContext(ForceUpdateBubbleContext);

  useEffect(() => {
    if (msgForPopup !== msg.msg && msgForPopup !== "") {
      if (msg.id) {
        dispatch({
          type: MessageActionTypes.UpdateId,
          id: msg.id,
          msg: msgForPopup,
        });
      } else {
        alert("Something went wrong");
      }
    }
  }, [msg, msgForPopup]);

  return (
    <div
      // style={{ zIndex: `${9999 - (msg.id ?? 0)}` }}
      className={useDark(`${className} ${styles.bubble}`, darkClassName)}
    >
      {popupInputOpen && (
        <PopupInput
          title={"Edit Message"}
          value={msg.msg}
          setValue={setMsgForPopup}
          setShowPopupInput={setPopupInputOpen}
        />
      )}
      <Avatar
        isUser={msg.isUser}
        setMenuOpen={setMenuOpen}
        avatarRef={avatarRef}
        setPosition={setPosition}
      />
      <ToolMenu
        msg={msg}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        position={position}
        setPopupInputOpen={setPopupInputOpen}
      />
      {msg.isUser && (
        <pre className={`${styles.textBox} ${styles.textBoxUser}`}>
          {msg.msg}
        </pre>
      )}
      {!msg.isUser && (
        <div
          className={styles.textBox}
          dangerouslySetInnerHTML={{ __html: generateMd(msg.msg) }}
        ></div>
      )}
    </div>
  );
}

function Avatar({
  isUser,
  setMenuOpen,
  avatarRef,
  setPosition,
}: {
  isUser: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  avatarRef: React.RefObject<HTMLImageElement>;
  setPosition: Dispatch<SetStateAction<Position>>;
}) {
  const [connectWsGpt] = useContext(ConnectWsGptContext)!;
  const src = isUser ? user : bot;
  // const width = useWidth();
  // if (width < 0) return;
  // const roundedWidth = Math.round(width / 50);
  const roundedWidth = 24;

  function handleClick(evt: React.MouseEvent) {
    setMenuOpen(true);
    setPosition({ top: evt.clientY, left: evt.clientX, right: evt.clientX });
  }

  return (
    <img
      src={src}
      alt={"avatar"}
      width={roundedWidth}
      height={roundedWidth}
      className={useDark(styles.avatar, styles.avatarDark)}
      onClick={connectWsGpt ? undefined : handleClick} // disable click when connecting to wsgpt
      ref={avatarRef}
    />
  );
}

function ToolMenu({
  msg,
  menuOpen,
  setMenuOpen,
  position,
  setPopupInputOpen,
}: {
  msg: Message;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  position: Position;
  setPopupInputOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [, dispatch] = useContext(MessageContext)!;

  function handleDelete() {
    if (msg.id) {
      dispatch({ type: MessageActionTypes.DeleteId, id: msg.id });
    } else {
      alert("Something went wrong");
    }
  }

  return menuOpen ? (
    <Menu
      upside={false}
      setMenuOpen={setMenuOpen}
      top={position.top}
      left={position.left}
      right={position.right}
      offset={2}
      rightSide={msg.isUser}
    >
      <>
        <MenuItem
          onClick={handleDelete}
          setMenuOpen={setMenuOpen}
          basicClassName={`${inputBarStyles.whiteMenuButton}`}
          downClassName={`${inputBarStyles.whiteMenuButton} ${inputBarStyles.whiteMenuButtonDark}`}
        >
          <>
            <BsFillTrash3Fill />
            Delete
          </>
        </MenuItem>
        <MenuItem
          onClick={() => setPopupInputOpen(true)}
          setMenuOpen={setMenuOpen}
          basicClassName={`${inputBarStyles.whiteMenuButton}`}
          downClassName={`${inputBarStyles.whiteMenuButton} ${inputBarStyles.whiteMenuButtonDark}`}
        >
          <>
            <BsFillPencilFill />
            Edit
          </>
        </MenuItem>
      </>
    </Menu>
  ) : (
    <></>
  );
}
