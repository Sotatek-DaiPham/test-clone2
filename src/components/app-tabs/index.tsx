import withClient from "@/helpers/with-client";
import { Tabs, TabsProps } from "antd";
import clsx from "clsx";
import "./style.scss";

interface ITabsProps extends TabsProps {
  className?: string;
  operations?: React.ReactNode;
}

const AppTabs = ({ className, operations, ...props }: ITabsProps) => {
  return (
    <Tabs
      className={clsx("app-tabs", className)}
      {...props}
      tabBarExtraContent={operations}
    />
  );
};

export default withClient(AppTabs);
