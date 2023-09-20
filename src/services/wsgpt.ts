import { MessageActions, MessageActionTypes } from "@/contexts/MessageContext";
import React, { Dispatch, SetStateAction } from "react";
import {
  DOT_INTERVAL,
  SOCKET_CONNECTION_TIMEOUT,
  SOCKET_ESTABLISH_TIMEOUT,
  STORAGE_ACCESS_TOKEN,
} from "@/utils/constants";
import { Signals } from "@/utils/constants.ts";
import { redirectLogin } from "@/services/myoauth.ts";
import { debug } from "util";

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
  setErrorOccurred: Dispatch<SetStateAction<boolean>>
) {
  const dotInterval = setInterval(() => {
    dispatch({ type: MessageActionTypes.updateBot, msg: "." });
  }, DOT_INTERVAL);

  const connectionTimeout = setTimeout(() => {
    socket.close();
    dispatch({
      type: MessageActionTypes.editBot,
      msg: "WebSocket Connection Timeout :(",
    });
    setErrorOccurred(true);
    setButtonDisabled(false);
  }, SOCKET_ESTABLISH_TIMEOUT);

  const reqMessage: ReqMessage = { token: token, messages: gptMessages };
  const socket = new WebSocket(import.meta.env.VITE_DOMAIN as string);

  socket.onopen = () => {
    dispatch({ type: MessageActionTypes.editBot, msg: "" });
    clearTimeout(connectionTimeout);
    clearInterval(dotInterval);
    socket.send(JSON.stringify(reqMessage));
    setTimeout(() => {
      socket.close();
    }, SOCKET_CONNECTION_TIMEOUT);
  };

  socket.onmessage = (evt: MessageEvent<string>) => {
    const resp = evt.data.toString();
    if (resp === Signals.Error) {
      socket.close();
      dispatch({
        type: MessageActionTypes.editBot,
        msg: resp.slice(Signals.Error.length),
      });
      setErrorOccurred(true);
      setButtonDisabled(false);
      return;
    }
    if (resp === Signals.Done) {
      socket.close();
      setButtonDisabled(false);
      return;
    }
    dispatch({ type: MessageActionTypes.updateBot, msg: resp });
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
      token: localStorage.getItem(STORAGE_ACCESS_TOKEN) ?? "",
      messages: [],
      test: true,
    };
    socket.send(JSON.stringify(reqMessage));
    setTimeout(() => {
      socket.close();
    }, SOCKET_CONNECTION_TIMEOUT);
  };

  socket.onmessage = (evt: MessageEvent<string>) => {
    const resp = evt.data.toString();
    if (resp !== Signals.Test) {
      socket.close();
      redirectLogin();
    }
  };

  socket.onerror = (e) => {
    console.log(e);
    socket.close();
  };
}