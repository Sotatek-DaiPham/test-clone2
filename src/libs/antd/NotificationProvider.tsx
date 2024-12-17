"use client";

import { notification } from "antd";
import { createContext, useCallback } from "react";
// import ErrorIcon from "@/assets/icons/error-noti.svg";
// import SuccessIcon from "@/assets/icons/success-noti.svg";
// import CloseIcon from "@/assets/icons/close-icon-noti.svg";
import {
  Notification,
  Notification_Duration,
  NotificationParams,
} from "@/constant/toast-message";
import Image from "next/image";
import { ErrorIcon, SuccessIcon } from "@public/assets";

export const NotificationContext = createContext<Notification>({
  error: (params: NotificationParams) => {},
  info: (params: NotificationParams) => {},
  success: (params: NotificationParams) => {},
  warning: (params: NotificationParams) => {},
});

interface NotificationProviderProps {
  children: React.ReactNode;
}

const { useNotification } = notification;

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [rawApi, contextHolder] = useNotification({ placement: "topRight" });
  const error = useCallback(
    ({
      styleType = "standard",
      className = "",
      message,
      icon,
      description,
      ...props
    }: NotificationParams) => {
      rawApi.error({
        className: `toast-error rounded-[5px]`,
        icon: <Image src={ErrorIcon} alt="error icon" />,
        message: (
          <p className="text-white-neutral text-16px-medium">
            {message ?? "Action Failed"}
          </p>
        ),
        closeIcon: false,
        // description: (
        //   <div className="text-text-secondary text-[14px]">
        //     {description || "Something went wrong!"}
        //   </div>
        // ),
        pauseOnHover: false,
        duration: Notification_Duration,
        // closeIcon: <CloseIcon />,
        ...props,
      });
    },
    [rawApi]
  );

  const info = useCallback(
    ({
      styleType = "filled",
      className,
      message,
      icon,
      ...props
    }: NotificationParams) => {
      rawApi.info({
        className,
        icon,
        message: message ?? "info",
        duration: Notification_Duration,
        pauseOnHover: false,
        // closeIcon: <CloseIcon />,
        ...props,
      });
    },
    [rawApi]
  );

  const warning = useCallback(
    ({
      styleType = "filled",
      className,
      message,
      icon,
      ...props
    }: NotificationParams) => {
      rawApi.warning({
        className,
        icon,
        message: message ?? "warning",
        duration: Notification_Duration,
        pauseOnHover: false,
        // closeIcon: <CloseIcon />,
        ...props,
      });
    },
    [rawApi]
  );

  const success = useCallback(
    ({
      styleType = "standard",
      className = "",
      message,
      icon,
      description,
      ...props
    }: NotificationParams) => {
      rawApi.success({
        className: `toast-success rounded-[5px] ${className}`,
        icon: <Image src={SuccessIcon} alt="success icon" />,
        // icon: <SuccessIcon />,
        message: (
          <p className="text-white-neutral text-16px-medium">
            {message ?? "Action Completed"}
          </p>
        ),
        closeIcon: false,
        description: (
          <div className="text-text-secondary text-[14px]">{description}</div>
        ),
        duration: Notification_Duration,
        pauseOnHover: false,
        // closeIcon: <CloseIcon />,
        ...props,
      });
    },
    [rawApi]
  );

  return (
    <NotificationContext.Provider
      value={{
        rawApi,
        error,
        info,
        success,
        warning,
      }}
    >
      {children}
      {contextHolder}
    </NotificationContext.Provider>
  );
};
