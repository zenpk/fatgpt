"use client";
import { useRef, useState } from "react";
import { AuthInfo, loginRegister, tokenGen } from "@/app/services/simple-auth";
import { STORAGE_NAME } from "@/app/utils/constants";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Login() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const invitation = useRef<HTMLInputElement>(null);

  const displayMap = {
    Register: "Register",
    Login: "Login",
  };

  const [displayText, setDisplayText] = useState(displayMap.Login);
  const [message, setMessage] = useState("");

  function handleClick() {
    if (displayText === displayMap.Register) {
      setDisplayText(displayMap.Login);
    } else {
      setDisplayText(displayMap.Register);
    }
  }

  async function onSubmit() {
    if (username.current && password.current && invitation.current) {
      const body: AuthInfo = {
        username: username.current.value,
        password: password.current.value,
      };
      try {
        const resp = await loginRegister(
          body,
          invitation.current.value,
          displayText
        );
        if (!resp.ok) {
          setMessage(resp.msg);
        } else {
          const genResp = await tokenGen({
            token: resp.token,
            age: 8760,
            data: "",
          });
          if (!genResp.ok) {
            setMessage(genResp.msg);
          } else {
            window.localStorage.setItem(STORAGE_NAME, genResp.token);
            redirect("/");
          }
        }
      } catch (e) {
        setMessage(e as string);
      }
    }
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.flex}>
          <p>{message}</p>
          <h2>{displayText}</h2>
          <label htmlFor={"username"}>username</label>
          <input ref={username} name={"username"} className={styles.input} />
          <label htmlFor={"password"}>password</label>
          <input
            ref={password}
            name={"password"}
            className={styles.input}
            type={"password"}
          />
          <label htmlFor={"invitation"}>invitation code</label>
          <input
            ref={invitation}
            name={"invitation"}
            className={styles.input}
          />
          <div className={styles.buttonAndRegister}>
            <button onClick={onSubmit} className={styles.button}>
              submit
            </button>
            <a href={"#"} onClick={handleClick} className={styles.anchor}>
              {displayText === displayMap.Register
                ? displayMap.Login
                : displayMap.Register}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
