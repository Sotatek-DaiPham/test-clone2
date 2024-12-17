import withClient from "@/helpers/with-client";
import { Divider } from "antd";

const AppDivider = () => {
  return (
    <Divider
      style={{ borderColor: "var(--color-neutral-4)", margin: "10px 0" }}
    />
  );
};

export default withClient(AppDivider);
