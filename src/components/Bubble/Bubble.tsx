import styles from "./Bubble.module.css";
import inputBarStyles from "@/components/InputBar/InputBar.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import {
  Message,
  MessageActionTypes,
  MessageContext,
} from "@/contexts/MessageContext";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext";
import { generateMd } from "@/utils/markdown";
import { Menu, MenuItem } from "@/components/Menu/Menu.tsx";
import { BsFillPencilFill, BsFillTrash3Fill } from "react-icons/bs";

export function Bubble({
  msg,
  parentRef,
}: {
  msg: Message;
  parentRef: RefObject<HTMLDivElement>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const className = msg.isUser
    ? ` ${styles.bubbleUser}`
    : ` ${styles.bubbleBot}`;
  const forceUpdate = useContext(ForceUpdateBubbleContext);
  const md = generateMd(msg.msg);
  if (parentRef && parentRef.current) {
    parentRef.current.scrollTop = parentRef.current.scrollHeight;
  }

  return (
    <div className={`${className} ${styles.bubble}`}>
      <Avatar isUser={msg.isUser} setMenuOpen={setMenuOpen} />
      <ToolMenu msg={msg} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
}: {
  isUser: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const src = isUser ? user : bot;
  // const width = useWidth();
  // if (width < 0) return;
  // const roundedWidth = Math.round(width / 50);
  const roundedWidth = 24;

  return (
    <img
      src={src}
      alt={"avatar"}
      width={roundedWidth}
      height={roundedWidth}
      className={styles.avatar}
      onClick={() => {
        setMenuOpen((prev) => !prev);
      }}
    />
  );
}

function ToolMenu({
  msg,
  menuOpen,
  setMenuOpen,
}: {
  msg: Message;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
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
    <Menu upside={false}>
      <>
        <MenuItem onClick={handleDelete} setMenuOpen={setMenuOpen}>
          <div className={inputBarStyles.textButton}>
            <BsFillTrash3Fill />
            Delete
          </div>
        </MenuItem>
      </>
    </Menu>
  ) : (
    <></>
  );
}
