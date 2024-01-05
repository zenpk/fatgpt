import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./Home.module.css";
import { MessageContext } from "@/contexts/MessageContext";
import { Bubble } from "@/components/Bubble/Bubble";
import { InputBar } from "@/components/InputBar/InputBar";
import { sendTest } from "@/services/wsgpt.ts";
import { BACKGROUND_ID, STORAGE_ACCESS_TOKEN } from "@/utils/constants.ts";
import { redirectLogin } from "@/services/myoauth.ts";
import { Notification } from "@/components/Notification/Notification.tsx";
import { useDark } from "@/hooks/useDark.ts";

export function Home() {
  const [messages] = useContext(MessageContext)!;
  const [messageCount, setMessageCount] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);

  // scroll to the bottom
  useEffect(() => {
    // length < count means the user deleted a message, in which case we don't want to scroll
    if (messages.length >= messageCount) {
      if (divRef && divRef.current) {
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    }
    setMessageCount(messages.length);
  }, [messages]);

  // test token on initial land
  useEffect(() => {
    // test login here instead of main.tsx to improve page load speed
    if (!window.localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
      redirectLogin();
    }
    sendTest();
  }, []);

  return (
    <div
      id={BACKGROUND_ID}
      className={useDark(styles.background, styles.bodyDark)}
    >
      <Notification />
      <h1 className={useDark(styles.title, styles.titleDark)}>FatGPT</h1>
      <div className={useDark(styles.card, styles.cardDark)}>
        <div className={styles.textArea} ref={divRef}>
          {messages.map((msg) => {
            return <Bubble key={msg.id} msg={msg} />;
          })}
        </div>
        <div className={useDark(styles.inputBar, styles.inputBarDark)}>
          <InputBar />
        </div>
      </div>
    </div>
  );
}
