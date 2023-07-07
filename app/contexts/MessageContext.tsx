"use client";
import React from "react";

export type Message = {
  msg: string;
  isUser: boolean;
};

export type MessageActions = { type: number; msg: string };

export enum MessageActionTypes {
  addUser,
  addBot,
  editUser,
  editBot,
}

export const MessageContext = React.createContext<
  [Message[], React.Dispatch<MessageActions>] | null
>(null);

export function MessageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue: Message[] = [
    {
      msg: "give me a text that contains as much markdown syntax example as you can provide",
      isUser: true,
    },
    {
      msg: 'Sure! Here\'s a text that contains various examples of Markdown syntax: # Markdown Syntax Examples ## Headings You can create headings using hash symbols (#). The number of hashes determines the level of the heading. For example, # Heading 1 ## Heading 2 ### Heading 3 ## Emphasis You can emphasize text using asterisks (*) or underscores (_). Examples include *italic*, _italic_, **bold**, and __bold__. ## Lists You can create ordered and unordered lists easily. For example: 1. First item 2. Second item 3. Third item - Unordered item 1 - Unordered item 2 - Unordered item 3 ## Links You can add links to your text by using square brackets for the link text and parentheses for the URL. Here\'s an example: [Markdown Guide](https://www.markdownguide.org). ## Images You can also include images in your Markdown text using similar syntax to links. For example: ![alt text](image.jpg). ## Blockquotes To create blockquotes, use the greater-than symbol (>). > This is an example of a blockquote. ## Code You can include inline code using backticks (`) like `print("Hello, World!")`. To display code blocks, use triple backticks (```) with the appropriate language specified: ```python def hello_world(): print("Hello, World!") ``` ## Tables Markdown also supports tables. Here\'s an example: | Name | Age | | ------ | --- | | John | 25 | | Alice | 30 | | Bob | 28 | ## Horizontal Rule To create a horizontal rule, use three or more hyphens, asterisks, or underscores: --- These are just a few examples of Markdown syntax. Markdown is a flexible and easy-to-use markup language widely used for formatting text. You can find more comprehensive guides and references online.',
      isUser: false,
    },
  ];

  function reducer(state: Message[], action: MessageActions) {
    if (action.type === MessageActionTypes.addUser) {
      const message: Message = {
        msg: action.msg,
        isUser: true,
      };
      return [...state, message];
    }
    if (action.type === MessageActionTypes.addBot) {
      const message: Message = {
        msg: action.msg,
        isUser: false,
      };
      return [...state, message];
    }

    function findFromLast(isUser: boolean) {
      let i = state.length - 1;
      for (; i >= 0; i--) {
        if (state[i].isUser === isUser) {
          break;
        }
      }
      return i;
    }

    if (action.type === MessageActionTypes.editUser) {
      state[findFromLast(true)].msg = action.msg;
      return state;
    }
    if (action.type === MessageActionTypes.editBot) {
      state[findFromLast(false)].msg = action.msg;
    }
    return state;
  }

  const stateAndReducer = React.useReducer(reducer, defaultValue);

  return (
    <MessageContext.Provider value={stateAndReducer}>
      {children}
    </MessageContext.Provider>
  );
}
