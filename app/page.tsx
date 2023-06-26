"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { MessageContext } from "@/app/contexts/MessageContext";
import { Bubble } from "@/app/components/Bubble/Bubble";
import { InputBar } from "@/app/components/InputBar/InputBar";
import { STORAGE_NAME } from "@/app/utils/constants";
import { checkToken } from "@/app/services/simple-auth";
import Login from "@/app/login/page";

export default function Home() {
  const [messages] = useContext(MessageContext)!;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [messages, divRef]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_NAME);
    if (!token) {
      setIsLoggedIn(false);
    } else {
      checkToken({ token: token }).then((resp) => {
        if (resp.ok) {
          setIsLoggedIn(true);
        }
      });
    }
  }, [isLoggedIn]);

  return isLoggedIn ? (
    <div className={styles.background}>
      <h1 className={styles.title}>FatGPT</h1>
      <div className={styles.card}>
        <div className={styles.textArea} ref={divRef}>
          {messages.map((msg, i) => {
            return <Bubble key={i} {...msg} />;
          })}
        </div>
        <div className={styles.inputBar}>
          <InputBar />
        </div>
      </div>
    </div>
  ) : (
    <Login />
  );
}
