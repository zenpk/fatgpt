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
  updateBot,
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
      msg:
        "```jsx\n" +
        "export function Bubble({\n" +
        "  msg,\n" +
        "  parentRef,\n" +
        "}: {\n" +
        "  msg: Message;\n" +
        "  parentRef: RefObject<HTMLDivElement>;\n" +
        "}) {\n" +
        "  let className = styles.bubble;\n" +
        "  className += msg.isUser ? ` ${styles.bubbleUser}` : ` ${styles.bubbleBot}`;\n" +
        "  const forceUpdateValue = useContext(ForceUpdateContext);\n" +
        "  const md = generateMd(msg.msg);\n" +
        "  if (parentRef && parentRef.current) {\n" +
        "    parentRef.current.scrollTop = parentRef.current.scrollHeight;\n" +
        "  }\n" +
        "  return (\n" +
        "    <div className={className}>\n" +
        "      <Avatar isUser={msg.isUser} />\n" +
        "      {msg.isUser && <pre className={styles.textBox}>{msg.msg}</pre>}\n" +
        "      {!msg.isUser && (\n" +
        "        <div\n" +
        "          className={`${styles.textBox} ${styles.textBoxBot}`}\n" +
        "          dangerouslySetInnerHTML={{ __html: md }}\n" +
        "        ></div>\n" +
        "      )}\n" +
        "    </div>\n" +
        "  );\n" +
        "}" +
        "\n```",
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
    }
    if (action.type === MessageActionTypes.editBot) {
      state[findFromLast(false)].msg = action.msg;
    }
    if (action.type === MessageActionTypes.updateBot) {
      state[findFromLast(false)].msg += action.msg;
    }
    // console.log(state);
    return state;
  }

  const stateAndReducer = React.useReducer(reducer, defaultValue);

  return (
    <MessageContext.Provider value={stateAndReducer}>
      {children}
    </MessageContext.Provider>
  );
}
