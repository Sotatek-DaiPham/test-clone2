import ButtonContained from "@/components/Button/ButtonContained";
import ButtonOutlined from "@/components/Button/ButtonOutlined";
import { WarningModalIcon } from "@public/assets";
import { Flex, ModalProps } from "antd";
import Image from "next/image";
import AppModal from "..";
import "./styles.scss";
import AppButton from "@/components/app-button";

interface ILoginModal extends ModalProps {
  title: string;
  content: string;
  onOk: () => void;
  loading: boolean;
}

const LoginModal = ({
  title,
  content,
  onOk,
  loading,
  ...props
}: ILoginModal) => {
  return (
    <AppModal
      className="warning-modal"
      width={448}
      footer={false}
      centered
      {...props}
    >
      <Flex vertical align="center" justify="space-between">
        <Image src={WarningModalIcon} alt="warning icon" />
        <div className="warning-modal__title">{title}</div>
        <div className="warning-modal__content">{content}</div>
        <div className="warning-modal__actions">
          <AppButton typeButton="secondary" onClick={props.onCancel}>
            Cancel
          </AppButton>
          <AppButton loading={loading} onClick={onOk}>
            Sign In
          </AppButton>
        </div>
      </Flex>
    </AppModal>
  );
};

export default LoginModal;
