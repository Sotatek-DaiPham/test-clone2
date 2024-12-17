import withClient from "@/helpers/with-client";
import { TextAreaProps } from "antd/es/input";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import "./style.scss";

interface Props extends TextAreaProps {
  className?: string;
}

function AppTextarea(props: Props) {
  const { className, ...restProps } = props;

  return (
    <TextArea className={clsx("app-textarea", className)} {...restProps} />
  );
}

export default withClient(AppTextarea);
