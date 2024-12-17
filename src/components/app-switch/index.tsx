import { Switch, SwitchProps } from "antd";
import clsx from "clsx";
import React from "react";
import "./style.scss";

interface IAppSwitchProps extends SwitchProps {
  className?: string;
}

const AppSwitch = ({ className, ...props }: IAppSwitchProps) => {
  return <Switch className={clsx(`app-switch ${className}`)} {...props} />;
};

export default AppSwitch;
