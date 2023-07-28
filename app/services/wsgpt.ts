import { ChatCompletionRequestMessage } from "openai/api";
import {
  MessageActions,
  MessageActionTypes,
} from "@/app/contexts/MessageContext";
import React, { Dispatch, SetStateAction } from "react";
import { getDomain } from "@/app/services/utils";
import {
  DOT_INTERVAL,
  SOCKET_CONNECTION_TIMEOUT,
  SOCKET_ESTABLISH_TIMEOUT,
} from "@/app/utils/constants";

type SendObj = {
  token: string;
  messages: ChatCompletionRequestMessage[];
};

type Resp = {
  ok: boolean;
  msg: string;
};

export async function wsGpt(
  token: string,
  gptMessages: ChatCompletionRequestMessage[],
  dispatch: React.Dispatch<MessageActions>,
  forceUpdate: () => void,
  setButtonDisabled: Dispatch<SetStateAction<boolean>>,
  setErrorOccurred: Dispatch<SetStateAction<boolean>>
) {
  const dotInterval = setInterval(() => {
    dispatch({ type: MessageActionTypes.updateBot, msg: "." });
    forceUpdate();
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

  const sendObj: SendObj = { token: token, messages: gptMessages };
  const domain = await getDomain();
  const socket = new WebSocket(`wss://${domain}/wsgpt/`);
  socket.onopen = (evt) => {
    dispatch({ type: MessageActionTypes.editBot, msg: "" });
    clearTimeout(connectionTimeout);
    clearInterval(dotInterval);
    socket.send(JSON.stringify(sendObj));
    setTimeout(socket.close, SOCKET_CONNECTION_TIMEOUT);
  };
  socket.onmessage = (evt) => {
    const resp: Resp = JSON.parse(evt.data.toString());
    if (!resp.ok) {
      socket.close();
      dispatch({ type: MessageActionTypes.editBot, msg: resp.msg });
      setErrorOccurred(true);
      setButtonDisabled(false);
      return;
    }
    if (resp.msg === "[DONE]") {
      socket.close();
      setButtonDisabled(false);
      return;
    }
    dispatch({ type: MessageActionTypes.updateBot, msg: resp.msg });
    forceUpdate();
  };
  socket.onerror = (e) => {
    console.log(e);
  };
}
