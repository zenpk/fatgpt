import { ChatCompletionRequestMessage } from "openai/api";
import {
  MessageActions,
  MessageActionTypes,
} from "@/app/contexts/MessageContext";
import React, { useContext } from "react";
import { getDomain } from "@/app/services/util";
import { ForceUpdateContext } from "@/app/contexts/ForceUpdateContext";

type SendObj = {
  token: string;
  messages: ChatCompletionRequestMessage[];
};

export async function wsGpt(
  token: string,
  gptMessages: ChatCompletionRequestMessage[],
  dispatch: React.Dispatch<MessageActions>,
  forceUpdate: () => void
) {
  const domain = await getDomain();
  const socket = new WebSocket(`wss://${domain}/wsgpt/`);

  const sendObj: SendObj = { token: token, messages: gptMessages };
  socket.onopen = (evt) => {
    socket.send(JSON.stringify(sendObj));
  };
  socket.onmessage = (evt) => {
    const msg = evt.data.toString();
    if (msg === "[DONE]") {
      socket.close();
      return;
    }
    dispatch({ type: MessageActionTypes.updateBot, msg: evt.data.toString() });
    forceUpdate();
  };
  socket.onerror = (e) => {
    console.log(e);
  };
}
