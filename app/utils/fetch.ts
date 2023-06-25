import { BASE_URL } from "@/app/utils/constants";

export const fetchWrapper = {
  get: get,
  post: post,
  put: put,
  delete: _delete,
};

const baseURL = BASE_URL;

async function get(url: string) {
  const options: RequestInit = {
    method: "GET",
    credentials: "include",
  };
  return await handleFetch(baseURL + url, options);
}

async function post(url: string, body: any) {
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    // credentials: "include",
    body: JSON.stringify(body),
  };
  return await handleFetch(baseURL + url, options);
}

async function put(url: string, body: any) {
  const options: RequestInit = {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    credentials: "include",
    body: JSON.stringify(body),
  };
  return await handleFetch(baseURL + url, options);
}

async function _delete(url: string) {
  const options: RequestInit = {
    method: "DELETE",
    credentials: "include",
  };
  return await handleFetch(baseURL + url, options);
}

async function handleFetch(url: string, options: RequestInit) {
  try {
    const resp = await fetch(url, options);
    return await resp.json();
  } catch (e) {
    console.log(e);
    throw e;
  }
}
