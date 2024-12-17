import AppButton from "@/components/app-button";
import { ApproveIcon } from "@public/assets";
import { Flex, ModalProps } from "antd";
import Image from "next/image";
import AppModal from "..";
import "./styles.scss";

interface IConfirmModal extends ModalProps {
  title: string;
  onOk: () => void;
  loading: boolean;
  icon?: string;
  onOkText?: string;
}

const ConfirmModal = ({
  title,
  icon,
  onOkText,
  onOk,
  loading,
  ...props
}: IConfirmModal) => {
  return (
    <AppModal
      className="confirm-modal"
      width={448}
      footer={false}
      centered
      {...props}
    >
      <Flex vertical align="center" justify="space-between">
        <Image src={icon || ApproveIcon} alt="approve icon" />
        <div className="text-white-neutral text-20px-bold leading-8 tracking-tight md:mt-[35px] mt-6 text-center">
          {title}
        </div>
        <div className="flex w-full md:mt-[35px] mt-6 md:gap-5 gap-4">
          <AppButton
            typeButton="secondary"
            customClass="w-1/2"
            onClick={props.onCancel}
          >
            Cancel
          </AppButton>
          <AppButton customClass="w-1/2" loading={loading} onClick={onOk}>
            {onOkText || "Confirm"}
          </AppButton>
        </div>
      </Flex>
    </AppModal>
  );
};

export default ConfirmModal;
