import { DropDownProps, Dropdown } from "antd";
import "./style.scss";
import withClient from "@/helpers/with-client";

interface AppDropdownProps extends DropDownProps {
  className?: string;
}

const AppDropdown = ({ children, className, ...props }: AppDropdownProps) => {
  return (
    <Dropdown rootClassName={`app-dropdown ${className}`} {...props}>
      {children}
    </Dropdown>
  );
};

export default withClient(AppDropdown);
