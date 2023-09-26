import React, { useContext, useEffect, useRef } from "react";
import styles from "./Home.module.css";
import { MessageContext } from "@/contexts/MessageContext";
import { Bubble } from "@/components/Bubble/Bubble";
import { InputBar } from "@/components/InputBar/InputBar";
import { sendTest } from "@/services/wsgpt.ts";
import { STORAGE_ACCESS_TOKEN } from "@/utils/constants.ts";
import { redirectLogin } from "@/services/myoauth.ts";
import { MenuStatusContext } from "@/contexts/MenuStatusContext.tsx";

export function Home() {
  const [messages] = useContext(MessageContext)!;
  const divRef = useRef<HTMLDivElement>(null);
  const [menuStatus, setMenuStatus] = useContext(MenuStatusContext)!;

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

  function clickAreaHandler(evt: React.MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    setMenuStatus(false);
  }

  return (
    <div className={styles.background}>
      {menuStatus && (
        <div
          className={styles.clickArea}
          id={"clickArea"}
          onClick={clickAreaHandler}
        ></div>
      )}
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
