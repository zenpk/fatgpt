import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type NotificationMsg = {
  success: boolean;
  msg: string;
};

const NotificationContext = createContext<
  [NotificationMsg, Dispatch<SetStateAction<NotificationMsg>>] | null
>(null);

export function useNotificationContext() {
  return useContext(NotificationContext)!;
}

export function NotificationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const defaultValue: NotificationMsg = { success: true, msg: "" };

  return (
    <NotificationContext.Provider value={useState(defaultValue)}>
      {children}
    </NotificationContext.Provider>
  );
}
