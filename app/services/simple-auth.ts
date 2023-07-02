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

export type ParseResp = {
  data: string;
} & CommonResp;

const url = "http://127.0.0.1:8080";
const INVITATION_CODE = process.env.INVITATION_CODE;

export async function loginRegister(
  info: AuthInfo,
  invitation: string,
  path: string
): Promise<LoginResp> {
  if (invitation !== INVITATION_CODE) {
    throw new Error("Wrong invitation code");
  }
  return (await fetchWrapper.post(
    `${url}/${path.toLowerCase()}`,
    info
  )) as LoginResp;
}

export async function tokenParse(token: Token) {
  return (await fetchWrapper.post(`${url}/token-parse`, token)) as ParseResp;
}
