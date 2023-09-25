import { useContext, useEffect, useRef } from "react";
import styles from "./Home.module.css";
import { MessageContext } from "@/contexts/MessageContext";
import { Bubble } from "@/components/Bubble/Bubble";
import { InputBar } from "@/components/InputBar/InputBar";
import { sendTest } from "@/services/wsgpt.ts";
import { STORAGE_ACCESS_TOKEN } from "@/utils/constants.ts";
import { redirectLogin } from "@/services/myoauth.ts";

export function Home() {
  const [messages] = useContext(MessageContext)!;
  const divRef = useRef<HTMLDivElement>(null);

  // scroll to the bottom
  useEffect(() => {
    if (divRef && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
    // test login here instead of main.tsx to improve page load speed
    if (!window.localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
      redirectLogin();
    }
    sendTest();
  }, [messages]);

  return (
    <div className={styles.background}>
      <h1 className={styles.title}>FatGPT</h1>
      <div className={styles.card}>
        <div className={styles.textArea} ref={divRef}>
          {messages.map((msg) => {
            return <Bubble key={msg.id} msg={msg} parentRef={divRef} />;
          })}
        </div>
        <div className={styles.inputBar}>
          <InputBar />
        </div>
      </div>
    </div>
  );
}
