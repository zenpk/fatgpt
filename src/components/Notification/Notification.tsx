import { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";
import styles from "./Notification.module.css";
import { useNotificationContext } from "../../contexts/NotificationContext.tsx";
import { BACKGROUND_ID } from "@/utils/constants.ts";

export function Notification() {
  const [show, setShow] = useState(false);
  const [className, setClassName] = useState("");
  const [notificationMsg, setNotificationMsg] = useNotificationContext();
  const [timeout1, setTimeout1] = useState(0);
  const [timeout2, setTimeout2] = useState(0);
  const removeDelayTime = 2000;
  const removeAnimationTime = 500;

  // step 1: receive new notification
  useEffect(() => {
    if (notificationMsg.msg !== "") {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      setShow(false);
      setClassName(""); // to step 2
    }
  }, [notificationMsg]);

  useEffect(() => {
    // step 2: change class to display new notification
    if (className === "" && notificationMsg.msg !== "") {
      setClassName(styles.modal); // to step 3
      setShow(true);
    }
    // step 3: end the display
    if (className === styles.modal) {
      setTimeout1(
        window.setTimeout(() => {
          setClassName(`${styles.modal} ${styles.modalRemove}`);
        }, removeDelayTime)
      );
      setTimeout2(
        window.setTimeout(() => {
          setShow(false);
          setNotificationMsg({ success: true, msg: "" });
        }, removeDelayTime + removeAnimationTime)
      );
    }
  }, [className, notificationMsg]);

  return (
    <>
      {show &&
        createPortal(
          <div
            className={className}
            style={
              {
                "--remove-delay-time": `${removeDelayTime}ms`,
                "--remove-animation-time": `${removeAnimationTime}ms`,
              } as CSSProperties
            }
          >
            {notificationMsg.success ? <BiCheckCircle /> : <BiXCircle />}
            {notificationMsg.msg}
          </div>,
          document.getElementById(BACKGROUND_ID)!
        )}
    </>
  );
}
