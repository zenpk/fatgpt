import styles from "./Bubble.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import { Message } from "@/contexts/MessageContext";
import { RefObject, useContext } from "react";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext";
import { generateMd } from "@/utils/markdown";

export function Bubble({
  msg,
  parentRef,
}: {
  msg: Message;
  parentRef: RefObject<HTMLDivElement>;
}) {
  let className = styles.bubble;
  className += msg.isUser ? ` ${styles.bubbleUser}` : ` ${styles.bubbleBot}`;
  const forceUpdateValue = useContext(ForceUpdateBubbleContext);
  const md = generateMd(msg.msg);
  if (parentRef && parentRef.current) {
    parentRef.current.scrollTop = parentRef.current.scrollHeight;
  }
  return (
    <div className={className}>
      <Avatar isUser={msg.isUser} />
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

function Avatar({ isUser }: { isUser: boolean }) {
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
    />
  );
}