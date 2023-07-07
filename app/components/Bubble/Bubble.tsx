import styles from "./Bubble.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import Image from "next/image";
import { Message } from "@/app/contexts/MessageContext";
import { useWidth } from "@/app/hooks/useWidth";

export function Bubble({ msg }: { msg: Message }) {
  let className = styles.bubble;
  className += msg.isUser ? ` ${styles.bubbleUser}` : ` ${styles.bubbleBot}`;
  return (
    <div className={className}>
      <Avatar isUser={msg.isUser} />
      <p className={styles.textBox}>{msg.msg}</p>
    </div>
  );
}

function Avatar({ isUser }: { isUser: boolean }) {
  const src = isUser ? user : bot;
  const width = useWidth();
  if (width < 0) return;
  const roundedWidth = Math.round(width / 30);
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
