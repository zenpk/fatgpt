import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import { MessageActionTypes, MessageContext } from "@/contexts/MessageContext";

export function useAlert(
  alert: string,
  setAlert: Dispatch<SetStateAction<string>>,
  timeout: number
) {
  const [, dispatch] = useContext(MessageContext)!;
  useEffect(() => {
    if (alert !== "") {
      dispatch({ type: MessageActionTypes.AddBot, msg: alert });
      setTimeout(() => {
        dispatch({ type: MessageActionTypes.DeleteBot });
      }, timeout);
      setAlert("");
    }
  }, [dispatch, alert, timeout, setAlert]);
}
