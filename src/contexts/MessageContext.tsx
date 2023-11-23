import React from "react";

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
  DeleteId,
  UpdateId,
  DeleteAll,
  LoadState,
}

export type MessageActions =
  | { type: MessageActionTypes.AddUser; msg: string }
  | { type: MessageActionTypes.AddBot; msg: string }
  | { type: MessageActionTypes.EditUser; msg: string }
  | { type: MessageActionTypes.EditBot; msg: string }
  | { type: MessageActionTypes.UpdateBot; msg: string }
  | { type: MessageActionTypes.DeleteBot }
  | { type: MessageActionTypes.DeleteId; id: number }
  | { type: MessageActionTypes.UpdateId; id: number; msg: string }
  | { type: MessageActionTypes.DeleteAll }
  | { type: MessageActionTypes.LoadState; saved: Message[] };

export const MessageContext = React.createContext<
  [Message[], React.Dispatch<MessageActions>] | null
>(null);

export function MessageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue: Message[] = [];
  const testValue: Message[] = [
    { id: 1, isUser: true, msg: "hello" },
    {
      id: 2,
      isUser: false,
      msg:
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n" +
        "asopfjopegjoprwgjopwr\n\n",
    },
  ];

  function reducer(state: Message[], action: MessageActions) {
    if (action.type === MessageActionTypes.AddUser) {
      const message: Message = {
        id: state.length > 0 ? (state[state.length - 1].id ?? 0) + 1 : 1,
        msg: action.msg,
        isUser: true,
      };
      return [...state, message];
    }
    if (action.type === MessageActionTypes.AddBot) {
      const message: Message = {
        id: state.length > 0 ? (state[state.length - 1].id ?? 0) + 1 : 1,
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
      return state;
    }
    if (action.type === MessageActionTypes.EditBot) {
      state[findFromLast(false)].msg = action.msg;
      return state;
    }
    if (action.type === MessageActionTypes.UpdateBot) {
      // doing copies to handle double dispatch in strict mode
      const newState = [...state];
      const index = findFromLast(false);
      newState[index] = {
        ...newState[index],
        msg: newState[index].msg + action.msg,
      };
      return newState;
    }
    if (action.type === MessageActionTypes.DeleteBot) {
      const newState = [...state];
      newState.splice(findFromLast(false), 1);
      return newState;
    }
    if (action.type === MessageActionTypes.DeleteId) {
      for (let i = 0; i < state.length; i++) {
        if (state[i].id === action.id) {
          state.splice(i, 1);
          break;
        }
      }
      return [...state];
    }
    if (action.type === MessageActionTypes.UpdateId) {
      for (let i = 0; i < state.length; i++) {
        if (state[i].id === action.id) {
          state[i].msg = action.msg;
          break;
        }
      }
      return [...state];
    }
    if (action.type === MessageActionTypes.DeleteAll) {
      return [];
    }
    if (action.type === MessageActionTypes.LoadState) {
      return action.saved;
    }
    return state;
  }

  const stateAndReducer = React.useReducer(reducer, defaultValue);
  // const stateAndReducer = React.useReducer(reducer, testValue);

  return (
    <MessageContext.Provider value={stateAndReducer}>
      {children}
    </MessageContext.Provider>
  );
}
