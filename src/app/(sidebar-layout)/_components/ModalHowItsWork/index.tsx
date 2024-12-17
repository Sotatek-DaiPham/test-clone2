import AppModal from "@/components/app-modal";
import { ModalProps } from "antd";

interface IModalHowItsWorkProps extends ModalProps {
  open: boolean;
  onOk: () => void;
}
const ModalHowItsWork = ({ onOk, ...props }: IModalHowItsWorkProps) => {
  return (
    <AppModal
      width={602}
      footer={false}
      className="p-6"
      title={false}
      centered
      // closeIcon={null}
      {...props}
    >
      <div className="flex flex-col justify-center text-center">
        <span className="text-20px-bold text-white-neutral">How it works</span>
        <div className="mt-[50px] max-w-[346px] m-auto">
          <span className="text-white-neutral text-[20px] font-normal leading-6">
            RainPump prevents rugs by making sure that all created tokens are
            safe. Each token on RainPump is a&nbsp;
            <span className="text-primary-main">fair-launch</span> with no&nbsp;
            <span className="text-primary-main">presale</span> and&nbsp;
            <span className="text-primary-main">no team allocation</span>
          </span>
        </div>
        <div className="flex flex-col m-auto gap-6 my-[50px] text-[#B1B5C3] text-[20px] font-normal leading-6">
          <p>step 1: pick a token that you like</p>
          <p>step 2: buy the token on the bonding curve</p>
          <p>step 3: sell at any time to lock in your profits or losses</p>
          <p>
            step 4: when enough people buy on the bonding
            <br /> curve it reaches a market cap of $69k
          </p>
          <p>step 5: $12k of liquidity is then deposited in GTE and burned</p>
        </div>
        <div className="m-auto">
          <span
            className="hover:!underline cursor-pointer text-white-neutral text-[20px] font-normal leading-4"
            onClick={onOk}
          >
            I'm ready to pump
          </span>
        </div>
      </div>
    </AppModal>
  );
};

export default ModalHowItsWork;
