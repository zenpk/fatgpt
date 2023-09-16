export const STORAGE_TOKEN = "notToken";
export const STORAGE_MESSAGES = "messages";

export const SOCKET_CONNECTION_TIMEOUT = 180_000;
export const SOCKET_ESTABLISH_TIMEOUT = 12_000;
export const DOT_INTERVAL = 500;

export enum KeyNames {
  shift = "Shift",
  enter = "Enter",
}

export enum Signals {
  // client side
  Test = "[FATGPT]-[TEST]", // test if token is expired. This exists because it can help
  // prevent losing user input by checking token right after the user lands the home page

  // server side
  Error = "[FATGPT]-[ERROR]",
  Done = "[FATGPT]-[DONE]", // get [DONE] from OpenAI
  TokenFailed = "[FATGPT]-[TOKEN]", // token verification failed in parse message process
  Pass = "[FATGPT]-[PASS]", // pass the parse message process
}
