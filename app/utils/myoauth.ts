import axios from "axios";

export type ChallengeVerifier = {
  codeChallenge: string;
  codeVerifier: string;
};

export type LoginReq = {
  clientId: string;
  clientSecret: string;
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

export class MyOAuthSdk {
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
    const clientId = this.stringToBase64Url(req.clientId);
    const clientSecret = this.stringToBase64Url(req.clientSecret);
    const redirect = this.stringToBase64Url(req.redirect);
    const codeChallenge = this.stringToBase64Url(req.codeChallenge);
    window.location.replace(
      `${this.endpoint}/login?clientId=${clientId}&clientSecret=${clientSecret}&codeChallenge=${codeChallenge}&redirect=${redirect}`
    );
  }

  authorize(req: AuthorizeReq): Promise<AuthorizeResp> {
    const urlParams = new URLSearchParams(window.location.search);
    req.authorizationCode = urlParams.get("authorizationCode") ?? "";
    return axios.post(`${this.endpoint}/api/auth/authorize`, req);
  }

  refresh(req: RefreshReq): Promise<AuthorizeResp> {
    return axios.post(`${this.endpoint}/api/auth/refresh`, req);
  }

  verify(accessToken: string): Promise<VerifyResp> {
    return axios.post(`${this.endpoint}/api/auth/verify`, {
      accessToken: accessToken,
    });
  }

  getPublicKey(): Promise<PublicJwk> {
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
