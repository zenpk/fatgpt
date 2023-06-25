import styles from "./Bubble.module.css";
import bot from "@/public/openai.png";
import user from "@/public/user.png";
import Image from "next/image";
import { Message } from "@/app/contexts/MessageContext";

export function Bubble(props: Message) {
  let className = styles.bubble;
  if (props.isUser) {
    className += ` ${styles.reverse}`;
  }
  return (
    <div className={className}>
      <Avatar isUser={props.isUser} />
      <Message {...props} />
    </div>
  );
}

function Message(props: Message) {
  let className = styles.textBox;
  className += props.isUser
    ? ` ${styles.marginLeft}`
    : ` ${styles.marginRight}`;
  return <p className={className}>{props.msg}</p>;
}

function Avatar({ isUser }: { isUser: boolean }) {
  const src = isUser ? user : bot;
  return <Image src={src} alt={"avatar"} width={50} height={50} />;
}
