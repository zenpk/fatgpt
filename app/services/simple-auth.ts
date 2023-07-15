"use server";

import { fetchWrapper } from "@/app/utils/fetch";

export type AuthInfo = {
  username: string;
  password: string;
};

export type Token = {
  token: string;
};

export type TokenReq = {
  age: number;
  data: string;
} & Token;

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
const APP_ID = process.env.APP_ID;

export async function register(
  info: AuthInfo,
  invitation: string
): Promise<LoginResp> {
  if (invitation !== INVITATION_CODE) {
    throw new Error("Wrong invitation code");
  }
  return (await fetchWrapper.post(`${url}/register`, info)) as LoginResp;
}

export async function login(info: AuthInfo): Promise<LoginResp> {
  return (await fetchWrapper.post(`${url}/login`, info)) as LoginResp;
}

export async function tokenGen(req: TokenReq) {
  return (await fetchWrapper.post(`${url}/token-gen`, {
    ...req,
    appId: APP_ID,
  })) as LoginResp;
}

export async function tokenParse(req: Token) {
  return (await fetchWrapper.post(`${url}/token-parse`, {
    ...req,
    appId: APP_ID,
  })) as ParseResp;
}

export async function tokenCheck(req: Token) {
  return (await fetchWrapper.post(`${url}/token-check`, {
    ...req,
    appId: APP_ID,
  })) as CommonResp;
}
