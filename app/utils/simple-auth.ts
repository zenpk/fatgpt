"use server";
import { tokenCheck } from "@/app/services/simple-auth";

export async function tokenCheckUtil(token: string) {
  const resp = await tokenCheck({ token: token });
  return resp.ok;
}
