"use server";

export async function getDomain() {
  return process.env.DOMAIN;
}
