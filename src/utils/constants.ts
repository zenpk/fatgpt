export const STORAGE_ACCESS_TOKEN = "accessToken";
export const STORAGE_REFRESH_TOKEN = "refreshToken";
export const STORAGE_MESSAGES = "messages";
export const STORAGE_VERIFIER = "verifier";
export const STORAGE_PERSONA = "persona";
export const STORAGE_THEME = "theme";
export const DARK_THEME_NAME = "dark";

export const SOCKET_CONNECTION_TIMEOUT = 180_000;
export const SOCKET_ESTABLISH_TIMEOUT = 12_000;
export const DOT_INTERVAL = 500;

export const MENU_ANIMATION_TIME = 200;

export const BACKGROUND_ID = "background";

export enum KeyNames {
  Enter = "Enter",
  Escape = "Escape",
  B = "b",
  E = "e",
  F = "f",
  U = "u",
}

export enum Signals {
  // client side
  Test = "[FATGPT]-[TEST]", // test if token is expired. This exists because it can help
  // prevent losing user input by checking token right after the user lands the home page

  // server side
  Error = "[FATGPT]-[ERROR]",
  Done = "[FATGPT]-[DONE]", // get [DONE] from OpenAI
  TokenFailed = "[FATGPT]-[TOKEN]", // token verification failed in parse message process
  GuestQuotaExceeded = "[FATGPT]-[GUESTQUOTA]",
  Pass = "[FATGPT]-[PASS]", // pass the parse message process
}
