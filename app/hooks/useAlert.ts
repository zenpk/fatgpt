import { Dispatch, SetStateAction, useContext, useEffect } from "react";
import {
  MessageActionTypes,
  MessageContext,
} from "@/app/contexts/MessageContext";
import { ForceUpdatePageContext } from "@/app/contexts/ForceUpdatePageContext";

export function useAlert(
  alert: string,
  setAlert: Dispatch<SetStateAction<string>>,
  timeout: number
) {
  const [, dispatch] = useContext(MessageContext)!;
  const forceUpdate = useContext(ForceUpdatePageContext);
  useEffect(() => {
    if (alert !== "") {
      dispatch({ type: MessageActionTypes.addBot, msg: alert });
      forceUpdate();
      setTimeout(() => {
        dispatch({ type: MessageActionTypes.deleteBot });
        forceUpdate();
      }, timeout);
      setAlert("");
    }
  }, [dispatch, forceUpdate, alert, timeout, setAlert]);
}
