"use client";
import { useRef, useState } from "react";
import {
  AuthInfo,
  login,
  register,
  tokenGen,
} from "@/app/services/simple-auth";
import { STORAGE_NAME } from "@/app/utils/constants";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const invitation = useRef<HTMLInputElement>(null);

  const displayMap = {
    Register: "Register",
    Login: "Login",
  };

  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  function handleClick() {
    setIsLogin((prev) => !prev);
  }

  async function onSubmit() {
    if (username.current && password.current && invitation.current) {
      const body: AuthInfo = {
        username: username.current.value,
        password: password.current.value,
      };
      try {
        let resp;
        if (!isLogin) {
          resp = await register(body, invitation.current.value);
        } else {
          resp = await login(body);
        }
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
            router.push("/");
          }
        }
      } catch (e: any) {
        setMessage(e.toString());
      }
    }
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.flex}>
          <p>{message}</p>
          <h2>{isLogin ? displayMap.Login : displayMap.Register}</h2>
          <label htmlFor={"username"}>username</label>
          <input ref={username} name={"username"} className={styles.input} />
          <label htmlFor={"password"}>password</label>
          <input
            ref={password}
            name={"password"}
            className={styles.input}
            type={"password"}
          />
          {!isLogin && (
            <>
              <label htmlFor={"invitation"}>invitation code</label>
              <input
                ref={invitation}
                name={"invitation"}
                className={styles.input}
                autoComplete={"off"}
              />
            </>
          )}
          <div className={styles.buttonAndRegister}>
            <button onClick={onSubmit} className={styles.button}>
              submit
            </button>
            <a href={"#"} onClick={handleClick} className={styles.anchor}>
              {isLogin ? displayMap.Register : displayMap.Login}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
