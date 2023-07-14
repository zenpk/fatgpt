import styles from "./Bubble.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import Image from "next/image";
import { Message } from "@/app/contexts/MessageContext";
import { useWidth } from "@/app/hooks/useWidth";
import { useContext } from "react";
import { ForceUpdateContext } from "@/app/contexts/ForceUpdateContext";

export function Bubble({ msg }: { msg: Message }) {
  let className = styles.bubble;
  className += msg.isUser ? ` ${styles.bubbleUser}` : ` ${styles.bubbleBot}`;
  const forceUpdateValue = useContext(ForceUpdateContext);
  return (
    <div className={className}>
      <Avatar isUser={msg.isUser} />
      {msg.isUser && <pre className={styles.textBox}>{msg.msg}</pre>}
      {!msg.isUser && (
        <div
          className={styles.textBox}
          dangerouslySetInnerHTML={{ __html: msg.msg }}
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
    <Image
      src={src}
      alt={"avatar"}
      width={roundedWidth}
      height={roundedWidth}
      className={styles.avatar}
    />
  );
}
