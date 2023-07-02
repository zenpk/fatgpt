import styles from "./Bubble.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import Image from "next/image";
import { Message } from "@/app/contexts/MessageContext";

export function Bubble({ msg }: { msg: Message }) {
  let className = styles.bubble;
  if (msg.isUser) {
    className += ` ${styles.reverse}`;
  }
  return (
    <div className={className}>
      <Avatar isUser={msg.isUser} />
      <Message msg={msg} />
    </div>
  );
}

function Message({ msg }: { msg: Message }) {
  let className = styles.textBox;
  className += msg.isUser ? ` ${styles.marginLeft}` : ` ${styles.marginRight}`;
  return <p className={className}>{msg.msg}</p>;
}

function Avatar({ isUser }: { isUser: boolean }) {
  const src = isUser ? user : bot;
  return <Image src={src} alt={"avatar"} width={50} height={50} />;
}
