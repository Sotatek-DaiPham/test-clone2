import {
  ArgsProps,
  NotificationInstance,
} from "antd/es/notification/interface";

export const Notification_Duration = 5;

export enum TypeNotify {
  Success = "success",
  Warning = "warning",
  Error = "error",
}

export enum PlacementTooltip {
  TopLeft = "topLeft",
  TopRight = "topRight",
  Top = "top",
  Right = "right",
  Left = "left",
  Bottom = "bottom",
  BottomRight = "bottomRight",
  BottomLeft = "bottomLeft",
}

export interface Notification {
  rawApi?: NotificationInstance;
  error: (params: NotificationParams) => void;
  info: (params: NotificationParams) => void;
  warning: (params: NotificationParams) => void;
  success: (params: NotificationParams) => void;
}

export interface NotificationParams extends Omit<ArgsProps, "message"> {
  styleType?: "filled" | "outlined" | "standard";
  message?: string | JSX.Element;
}
