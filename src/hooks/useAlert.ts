import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import { MessageActionTypes, MessageContext } from "@/contexts/MessageContext";
import { ForceUpdatePageContext } from "@/contexts/ForceUpdatePageContext";

export function useAlert(
  alert: string,
  setAlert: Dispatch<SetStateAction<string>>,
  timeout: number
) {
  const [, dispatch] = useContext(MessageContext)!;
  const forceUpdate = useContext(ForceUpdatePageContext);
  useEffect(() => {
    if (alert !== "") {
      dispatch({ type: MessageActionTypes.AddBot, msg: alert });
      forceUpdate();
      setTimeout(() => {
        dispatch({ type: MessageActionTypes.DeleteBot });
        forceUpdate();
      }, timeout);
      setAlert("");
    }
  }, [dispatch, forceUpdate, alert, timeout, setAlert]);
}
