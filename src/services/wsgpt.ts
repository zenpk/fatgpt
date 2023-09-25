import { MessageActions, MessageActionTypes } from "@/contexts/MessageContext";
import React, { Dispatch, SetStateAction } from "react";
import {
  DOT_INTERVAL,
  SOCKET_CONNECTION_TIMEOUT,
  SOCKET_ESTABLISH_TIMEOUT,
  STORAGE_ACCESS_TOKEN,
} from "@/utils/constants";
import { Signals } from "@/utils/constants.ts";
import { redirectLogin, refresh } from "@/services/myoauth.ts";

export type ChatCompletionRequestMessage = {
  role: string;
  content: string;
};

type ReqMessage = {
  token: string;
  messages: ChatCompletionRequestMessage[];
  test?: boolean;
};

export function chatWithWsGpt(
  token: string,
  gptMessages: ChatCompletionRequestMessage[],
  dispatch: React.Dispatch<MessageActions>,
  setButtonDisabled: Dispatch<SetStateAction<boolean>>,
  forceUpdateBubble: () => void
) {
  const dotInterval = setInterval(() => {
    dispatch({ type: MessageActionTypes.UpdateBot, msg: "." });
  }, DOT_INTERVAL);

  const connectionTimeout = setTimeout(() => {
    socket.close();
    dispatch({
      type: MessageActionTypes.EditBot,
      msg: "WebSocket Connection Timeout :(",
    });
    setButtonDisabled(false);
  }, SOCKET_ESTABLISH_TIMEOUT);

  const reqMessage: ReqMessage = { token: token, messages: gptMessages };
  const socket = new WebSocket(import.meta.env.VITE_WSGPT as string);

  socket.onopen = () => {
    dispatch({ type: MessageActionTypes.EditBot, msg: "" });
    clearTimeout(connectionTimeout);
    clearInterval(dotInterval);
    socket.send(JSON.stringify(reqMessage));
    setTimeout(() => {
      socket.close();
    }, SOCKET_CONNECTION_TIMEOUT);
  };

  socket.onmessage = async (evt: MessageEvent<string>) => {
    const resp = evt.data.toString();
    if (resp === Signals.Error) {
      socket.close();
      dispatch({
        type: MessageActionTypes.EditBot,
        msg: resp.slice(Signals.Error.length),
      });
      setButtonDisabled(false);
      return;
    }
    if (resp === Signals.TokenFailed) {
      socket.close();
      await refresh();
      if (!window.localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
        redirectLogin();
      } else {
        dispatch({
          type: MessageActionTypes.EditBot,
          msg: "Token refreshed, please resend the message.",
        });
        setButtonDisabled(false);
      }
      return;
    }
    if (resp === Signals.Done) {
      socket.close();
      setButtonDisabled(false);
      return;
    }
    dispatch({ type: MessageActionTypes.UpdateBot, msg: resp });
    forceUpdateBubble();
  };

  socket.onerror = (e) => {
    console.log(e);
    socket.close();
  };

  socket.onclose = () => {
    clearTimeout(connectionTimeout);
    clearInterval(dotInterval);
  };
}

export function sendTest() {
  const socket = new WebSocket(import.meta.env.VITE_WSGPT as string);

  socket.onopen = () => {
    const reqMessage: ReqMessage = {
      token: window.localStorage.getItem(STORAGE_ACCESS_TOKEN) ?? "",
      messages: [],
      test: true,
    };
    socket.send(JSON.stringify(reqMessage));
    setTimeout(() => {
      socket.close();
    }, SOCKET_CONNECTION_TIMEOUT);
  };

  socket.onmessage = async (evt: MessageEvent<string>) => {
    socket.close();
    const resp = evt.data.toString();
    if (resp !== Signals.Test) {
      await refresh();
      if (!window.localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
        redirectLogin();
      }
    }
  };

  socket.onerror = (e) => {
    console.log(e);
    socket.close();
  };
}
