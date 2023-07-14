import { ChatCompletionRequestMessage } from "openai/api";
import {
  MessageActions,
  MessageActionTypes,
} from "@/app/contexts/MessageContext";
import React, { Dispatch, SetStateAction } from "react";
import { getDomain } from "@/app/services/utils";
import { SOCKET_TIMEOUT } from "@/app/utils/constants";

type SendObj = {
  token: string;
  messages: ChatCompletionRequestMessage[];
};

export async function wsGpt(
  token: string,
  gptMessages: ChatCompletionRequestMessage[],
  dispatch: React.Dispatch<MessageActions>,
  forceUpdate: () => void,
  setButtonDisabled: Dispatch<SetStateAction<boolean>>
) {
  const domain = await getDomain();
  const socket = new WebSocket(`wss://${domain}/wsgpt/`);

  const sendObj: SendObj = { token: token, messages: gptMessages };
  socket.onopen = (evt) => {
    socket.send(JSON.stringify(sendObj));
    setTimeout(socket.close, SOCKET_TIMEOUT);
  };
  socket.onmessage = (evt) => {
    const msg = evt.data.toString();
    if (msg === "[DONE]") {
      socket.close();
      setButtonDisabled(false);
      return;
    }
    dispatch({ type: MessageActionTypes.updateBot, msg: evt.data.toString() });
    forceUpdate();
  };
  socket.onerror = (e) => {
    console.log(e);
  };
}