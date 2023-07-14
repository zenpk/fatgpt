"use client";
import React, { useContext, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { MessageContext } from "@/app/contexts/MessageContext";
import { Bubble } from "@/app/components/Bubble/Bubble";
import { InputBar } from "@/app/components/InputBar/InputBar";
import { STORAGE_NAME } from "@/app/utils/constants";
import { tokenParse } from "@/app/services/simple-auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [messages] = useContext(MessageContext)!;
  const router = useRouter();
  const divRef = useRef<HTMLDivElement>(null);

  // scroll to the bottom
  useEffect(() => {
    if (divRef && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_NAME);
    if (!token) {
      // comment this line to temporarily disable the authentication
      router.push("/login");
    } else {
      tokenParse({ token: token }).then((resp) => {
        if (!resp.ok) {
          window.localStorage.removeItem(STORAGE_NAME);
          router.push("/login");
        }
      });
    }
  }, [router]);

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
