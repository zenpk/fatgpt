import { useContext, useEffect, useRef } from "react";
import styles from "./home.module.css";
import { MessageContext } from "@/contexts/MessageContext";
import { Bubble } from "@/components/Bubble/Bubble";
import { InputBar } from "@/components/InputBar/InputBar";
import { ForceUpdatePageContext } from "@/contexts/ForceUpdatePageContext";
import { sendTest } from "@/services/wsgpt.ts";

export function Home() {
  const [messages] = useContext(MessageContext)!;
  const divRef = useRef<HTMLDivElement>(null);
  const forceUpdateValue = useContext(ForceUpdatePageContext);

  // scroll to the bottom
  useEffect(() => {
    if (divRef && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
    sendTest();
  }, [messages]);

  return (
    <div className={styles.background}>
      <h1 className={styles.title}>FatGPT</h1>
      <div className={styles.card}>
        <div className={styles.textArea} ref={divRef}>
          {messages.map((msg, index) => {
            return <Bubble key={index} msg={msg} parentRef={divRef} />;
          })}
        </div>
        <div className={styles.inputBar}>
          <InputBar />
        </div>
      </div>
    </div>
  );
}
