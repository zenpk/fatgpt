import { ChatCompletionRequestMessage } from "openai/api";
import {
  MessageActions,
  MessageActionTypes,
} from "@/app/contexts/MessageContext";
import React from "react";
import { DOMAIN } from "@/app/utils/constants";

type SendObj = {
  token: string;
  messages: ChatCompletionRequestMessage[];
};

export async function wsGpt(
  token: string,
  gptMessages: ChatCompletionRequestMessage[],
  dispatch: React.Dispatch<MessageActions>
) {
  const socket = new WebSocket(`wss://${DOMAIN}/wsgpt/`);
  const sendObj: SendObj = { token: token, messages: gptMessages };
  socket.send(JSON.stringify(sendObj));
  socket.onmessage = (evt) => {
    const msg = evt.data.toString();
    if (msg === "[DONE]") {
      socket.close();
      return;
    }
    dispatch({ type: MessageActionTypes.updateBot, msg: evt.data.toString() });
  };
  socket.onerror = (e) => {
    console.log(e);
  };
}
