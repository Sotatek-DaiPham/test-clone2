import { ModalCloseIcon } from "@public/assets";
import { Modal, ModalProps } from "antd";
import Image from "next/image";
import "./style.scss";

interface IAppModal extends ModalProps {}

const AppModal = ({ children, className, ...props }: IAppModal) => {
  return (
    <Modal
      centered
      maskClosable={false}
      closeIcon={<Image src={ModalCloseIcon} alt="close icon" />}
      className={`app-modal ${className || ""}`}
      {...props}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
