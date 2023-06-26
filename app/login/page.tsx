"use client";
import { useRef } from "react";
import { useRouter } from "next/router";
import { fetchWrapper } from "@/app/utils/fetch";
import { AuthInfo, login } from "@/app/services/simple-auth";
import { STORAGE_NAME } from "@/app/utils/constants";
import { redirect } from "next/navigation";

export default function Login() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  async function onSubmit() {
    if (username.current && password.current) {
      const body: AuthInfo = {
        username: username.current.value,
        password: password.current.value,
      };
      const resp = await login(body);
      if (!resp.ok) {
        console.log("something went wrong");
      } else {
        window.localStorage.setItem(STORAGE_NAME, resp.token);
      }
      redirect("/");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <label>username</label>
      <input ref={username} />
      <label>password</label>
      <input ref={password} />
      <button onClick={onSubmit}>submit</button>
    </div>
  );
}
