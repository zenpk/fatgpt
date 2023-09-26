import axios, { AxiosResponse } from "axios";
import {
  STORAGE_ACCESS_TOKEN,
  STORAGE_REFRESH_TOKEN,
  STORAGE_VERIFIER,
} from "@/utils/constants.ts";

export type ChallengeVerifier = {
  codeChallenge: string;
  codeVerifier: string;
};

export type LoginReq = {
  clientId: string;
  redirect: string;
  codeChallenge: string;
};

export type AuthorizeReq = {
  clientId: string;
  clientSecret: string;
  codeVerifier: string;
  authorizationCode: string;
};

export type AuthorizeResp = {
  ok: boolean;
  msg: string;
  accessToken: string;
  refreshToken: string;
};

export type RefreshReq = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type VerifyResp = {
  ok: boolean;
  msg: string;
};

export type PublicJwk = {
  kty: string;
  e: string;
  use: string;
  kid: string;
  alg: string;
  n: string;
};

class MyOAuthSdk {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async genChallengeVerifier(len: number) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);

    const verifier = this.arrayToBase64Url(bytes);

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(hashBuffer);
    const challenge = this.arrayToBase64Url(hashArray);

    const challengeVerifier: ChallengeVerifier = {
      codeChallenge: challenge,
      codeVerifier: verifier,
    };
    return challengeVerifier;
  }

  redirectLogin(req: LoginReq) {
    const clientId = encodeURIComponent(req.clientId);
    const redirect = encodeURIComponent(req.redirect);
    const codeChallenge = encodeURIComponent(req.codeChallenge);
    window.location.replace(
      `${this.endpoint}/login?clientId=${clientId}&codeChallenge=${codeChallenge}&redirect=${redirect}`
    );
  }

  authorize(req: AuthorizeReq): Promise<AxiosResponse<AuthorizeResp>> {
    const urlParams = new URLSearchParams(window.location.search);
    req.authorizationCode = urlParams.get("authorizationCode") ?? "";
    return axios.post(`${this.endpoint}/api/auth/authorize`, req);
  }

  refresh(req: RefreshReq): Promise<AxiosResponse<AuthorizeResp>> {
    return axios.post(`${this.endpoint}/api/auth/refresh`, req);
  }

  verify(accessToken: string): Promise<AxiosResponse<VerifyResp>> {
    return axios.post(`${this.endpoint}/api/auth/verify`, {
      accessToken: accessToken,
    });
  }

  getPublicKey(): Promise<AxiosResponse<PublicJwk>> {
    return axios.get(`${this.endpoint}/api/setup/public-key`);
  }

  arrayToBase64Url(array: Uint8Array) {
    let src = "";
    array.forEach((num) => {
      src += String.fromCharCode(num);
    });
    return this.stringToBase64Url(src);
  }

  stringToBase64Url(src: string) {
    return btoa(src).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
}

export function redirectLogin() {
  const auth = new MyOAuthSdk(import.meta.env.VITE_AUTH as string);
  auth
    .genChallengeVerifier(96)
    .then((challengeVerifier) => {
      window.localStorage.setItem(
        STORAGE_VERIFIER,
        challengeVerifier.codeVerifier
      );
      auth.redirectLogin({
        clientId: import.meta.env.VITE_CLIENT_ID as string,
        redirect: import.meta.env.VITE_REDIRECT as string,
        codeChallenge: challengeVerifier.codeChallenge,
      });
    })
    .catch((e) => {
      console.log(e);
    });
}

export function authorization() {
  const auth = new MyOAuthSdk(import.meta.env.VITE_AUTH as string);
  const codeVerifier = window.localStorage.getItem(STORAGE_VERIFIER) as string;
  auth
    .authorize({
      clientId: import.meta.env.VITE_CLIENT_ID as string,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET as string,
      codeVerifier: codeVerifier,
      authorizationCode: "", // will be filled in the auth.authorize method
    })
    .then((resp) => {
      handleAuthResp(resp, true);
    })
    .catch((e) => {
      window.localStorage.removeItem(STORAGE_ACCESS_TOKEN);
      window.localStorage.removeItem(STORAGE_REFRESH_TOKEN);
      window.localStorage.removeItem(STORAGE_VERIFIER);
      console.log(e);
    });
}

export async function refresh() {
  window.localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  const refreshToken = window.localStorage.getItem(STORAGE_REFRESH_TOKEN);
  if (!refreshToken) {
    return redirectLogin();
  }
  const auth = new MyOAuthSdk(import.meta.env.VITE_AUTH as string);
  try {
    const resp = await auth.refresh({
      clientId: import.meta.env.VITE_CLIENT_ID as string,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET as string,
      refreshToken: refreshToken,
    });
    handleAuthResp(resp, false);
  } catch (e) {
    window.localStorage.removeItem(STORAGE_REFRESH_TOKEN);
    console.log(e);
  }
}

function handleAuthResp(resp: AxiosResponse<AuthorizeResp>, isAuth: boolean) {
  if (!resp.data.ok) {
    console.log(`Authorization failed: ${resp.data.msg}`);
    window.localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  } else {
    window.localStorage.setItem(STORAGE_ACCESS_TOKEN, resp.data.accessToken);
    window.localStorage.setItem(STORAGE_REFRESH_TOKEN, resp.data.refreshToken);
  }
  // handle the authorization request that uses the code
  if (isAuth) {
    const url = window.location.href;
    window.localStorage.removeItem(STORAGE_VERIFIER);
    window.location.replace(url.substring(0, url.indexOf("?")));
  }
}
