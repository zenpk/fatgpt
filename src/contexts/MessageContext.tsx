import React, { useContext } from "react";
import { ForceUpdateBubbleContext } from "@/contexts/ForceUpdateBubbleContext";
import { ForceUpdatePageContext } from "@/contexts/ForceUpdatePageContext";

export type Message = {
  id?: number;
  msg: string;
  isUser: boolean;
};

export enum MessageActionTypes {
  AddUser,
  AddBot,
  EditUser,
  EditBot,
  UpdateBot,
  DeleteBot,
  LoadState,
  DeleteId,
  Callback,
}

export type MessageActions =
  | { type: MessageActionTypes.AddUser; msg: string }
  | { type: MessageActionTypes.AddBot; msg: string }
  | { type: MessageActionTypes.EditUser; msg: string }
  | { type: MessageActionTypes.EditBot; msg: string }
  | { type: MessageActionTypes.UpdateBot; msg: string }
  | { type: MessageActionTypes.DeleteBot }
  | { type: MessageActionTypes.DeleteId; id: number }
  | { type: MessageActionTypes.LoadState; saved: Message[] }
  | { type: MessageActionTypes.Callback; callback: any };

export const MessageContext = React.createContext<
  [Message[], React.Dispatch<MessageActions>] | null
>(null);

export function MessageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue: Message[] = [];
  const forceUpdateBubble = useContext(ForceUpdateBubbleContext);
  const forceUpdatePage = useContext(ForceUpdatePageContext);

  function reducer(state: Message[], action: MessageActions) {
    if (action.type === MessageActionTypes.AddUser) {
      const message: Message = {
        id: state.length,
        msg: action.msg,
        isUser: true,
      };
      return [...state, message];
    }
    if (action.type === MessageActionTypes.AddBot) {
      const message: Message = {
        id: state.length,
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

    if (action.type === MessageActionTypes.EditUser) {
      state[findFromLast(true)].msg = action.msg;
      forceUpdateBubble();
    }
    if (action.type === MessageActionTypes.EditBot) {
      state[findFromLast(false)].msg = action.msg;
      forceUpdateBubble();
    }
    if (action.type === MessageActionTypes.UpdateBot) {
      state[findFromLast(false)].msg += action.msg;
      forceUpdateBubble();
    }
    if (action.type === MessageActionTypes.DeleteBot) {
      state.splice(findFromLast(false), 1);
      forceUpdatePage();
    }
    if (action.type === MessageActionTypes.DeleteId) {
      for (let i = 0; i < state.length; i++) {
        if (state[i].id === action.id) {
          state.splice(i, 1);
        }
      }
    }
    if (action.type === MessageActionTypes.LoadState) {
      forceUpdatePage();
      return action.saved;
    }
    if (action.type === MessageActionTypes.Callback) {
      action.callback();
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
