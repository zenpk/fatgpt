"use server";

import { fetchWrapper } from "@/app/utils/fetch";

export type AuthInfo = {
  username: string;
  password: string;
};

export type Token = {
  token: string;
};

export type CommonResp = {
  ok: boolean;
  msg: string;
};

export type LoginResp = {
  token: string;
} & CommonResp;

const url = "http://127.0.0.1:8080";

export async function login(info: AuthInfo) {
  return (await fetchWrapper.post(`${url}/login`, info)) as LoginResp;
}

export async function checkToken(token: Token) {
  return (await fetchWrapper.post(`${url}/token`, token)) as CommonResp;
}
