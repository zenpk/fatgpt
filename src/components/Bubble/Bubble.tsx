import styles from "./Bubble.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import bot from "../../../public/bot.png";
import user from "../../../public/user.png";
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

type Position = {
  top: number;
  left: number;
  right?: number;
  bottom?: number;
};

export function Bubble({ msg }: { msg: Message }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgForPopup, setMsgForPopup] = useState("");
  const [md, setMd] = useState("");
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
  const forceUpdate = useContext(ForceUpdateBubbleContext);

  useEffect(() => {
    setMd(generateMd(msg.msg));
    setMsgForPopup(msg.msg);
  }, [msg.msg]);

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
  }, [msgForPopup]);

  return (
    <div
      style={{ zIndex: `${9999 - (msg.id ?? 0)}` }}
      className={`${className} ${styles.bubble}`}
    >
      {popupInputOpen && (
        <PopupInput
          title={"Edit Message"}
          value={msgForPopup}
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
          dangerouslySetInnerHTML={{ __html: md }}
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
      className={styles.avatar}
      onClick={handleClick}
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
