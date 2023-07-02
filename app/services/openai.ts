"use server";
import { Configuration, OpenAIApi } from "openai";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai/api";
import { tokenCheckUtil } from "@/app/utils/simple-auth";

export async function chatGPT(
  gptMessages: ChatCompletionRequestMessage[],
  token: string
) {
  if (!(await tokenCheckUtil(token))) {
    return "You're not logged in";
  }
  const configuration = new Configuration({
    organization: process.env.ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const body: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      messages: gptMessages,
    };
    const resp = await openai.createChatCompletion(body);
    const respBody = await resp.data;
    console.log(JSON.stringify(respBody));
    return respBody.choices[0].message!.content;
  } catch (e) {
    console.log(e);
  }
}
