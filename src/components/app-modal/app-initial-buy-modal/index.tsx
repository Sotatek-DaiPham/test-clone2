import AppAmountSelect from "@/components/app-amount-select";
import AppButton from "@/components/app-button";
import AppInputBalance from "@/components/app-input/app-input-balance";
import {
  AMOUNT_FIELD_NAME,
  MINIMUM_BUY_AMOUNT,
  PREDEFINE_AMOUNT,
} from "@/constant";
import { REGEX_INPUT_DECIMAL } from "@/constant/regex";
import { nFormatter } from "@/helpers/formatNumber";
import { ECoinType } from "@/interfaces/token";
import { Form, FormInstance, ModalProps } from "antd";
import BigNumber from "bignumber.js";
import { Dispatch, SetStateAction, useEffect } from "react";
import AppModal from "..";
import "./styles.scss";

interface IInitialBuyModal extends ModalProps {
  onOk: (values: any) => void;
  onSkip: (values: any) => void;
  initialBuyAmount: string;
  tokenSymbol: string;
  createLoading: boolean;
  skipLoading: boolean;
  usdtShouldPay: string;
  tokenWillReceive: string;
  coinType: ECoinType;
  setCoinType: Dispatch<SetStateAction<ECoinType>>;
  tokenImage: string | undefined;
  form: FormInstance<{
    amount: string;
  }>;
}

const amountValidator = (value: string, usdtShouldPay: string) => {
  const amount = Number(value);

  if (
    (value && BigNumber(amount).lt(MINIMUM_BUY_AMOUNT)) ||
    (usdtShouldPay && BigNumber(usdtShouldPay).lt(MINIMUM_BUY_AMOUNT))
  ) {
    return Promise.reject(
      new Error(`Minimum transaction amount is ${MINIMUM_BUY_AMOUNT} ETH`)
    );
  }
  return Promise.resolve();
};

const InitialBuyModal = ({
  title,
  onOk,
  initialBuyAmount,
  createLoading,
  skipLoading,
  tokenSymbol,
  usdtShouldPay,
  tokenWillReceive,
  coinType,
  setCoinType,
  onSkip,
  tokenImage,
  form,
  ...props
}: IInitialBuyModal) => {
  const isDisableBuyButton =
    !!(
      !initialBuyAmount ||
      (initialBuyAmount && BigNumber(initialBuyAmount).lt(MINIMUM_BUY_AMOUNT))
    ) || !!(usdtShouldPay && BigNumber(usdtShouldPay).lt(MINIMUM_BUY_AMOUNT));

  useEffect(() => {
    if (!props.open) {
      form.resetFields();
      setCoinType(ECoinType.StableCoin);
    }
  }, [props.open]);

  useEffect(() => {
    if (initialBuyAmount) {
      form.validateFields();
    }
  }, [coinType]);

  return (
    <AppModal
      className="initial-buy-modal"
      width={500}
      footer={false}
      centered
      {...props}
    >
      <div className="flex flex-col gap-4">
        <div className="text-20px-bold md:text-26px-bold text-white-neutral">
          Initial buy (Optional)
        </div>
        <div className="bg-neutral-1 p-6 rounded-[12px] flex flex-col ">
          <div className="flex justify-between items-center mb-2.5">
            <label className="text-14px-medium text-neutral-7">
              Buy Amount
            </label>
            <div className="text-14px-normal text-neutral-7">
              Minimum amount:{" "}
              <span className="text-white-neutral text-14px-medium">
                {MINIMUM_BUY_AMOUNT} ETH
              </span>
            </div>
          </div>
          <Form
            form={form}
            initialValues={{
              amount: "",
            }}
          >
            <Form.Item
              name={AMOUNT_FIELD_NAME}
              rules={[
                {
                  validator: (_: any, value: string) =>
                    amountValidator(value, usdtShouldPay),
                },
              ]}
            >
              <AppInputBalance
                value={initialBuyAmount}
                tokenImageSrc={tokenImage}
                tokenSymbol={tokenSymbol}
                onTokenChange={(token) => setCoinType(token)}
                regex={REGEX_INPUT_DECIMAL(0, 6)}
                isSwap
              />
            </Form.Item>
          </Form>
          {coinType === ECoinType.StableCoin ? (
            <AppAmountSelect
              numbers={PREDEFINE_AMOUNT}
              onSelect={(value) => {
                form.setFieldValue("amount", value);
              }}
              customClass="mb-3"
            />
          ) : null}

          <div className="text-16px-normal text-neutral-7 mb-7">
            {coinType === ECoinType.MemeCoin
              ? "You must pay "
              : "You will receive "}
            <span className="text-white-neutral text-14px-medium">
              {coinType === ECoinType.MemeCoin
                ? `${nFormatter(usdtShouldPay) || 0} ETH`
                : `${nFormatter(tokenWillReceive) || 0} ${tokenSymbol}`}
            </span>
          </div>
          <div className="text-16px-normal text-[#D1D1D2]">
            Enter your initial buy amount. Leave blank if you don’t want to buy
            any.
          </div>
        </div>
        <div className="flex gap-4">
          <AppButton
            customClass="w-auto flex-1"
            typeButton="secondary"
            onClick={onSkip}
            loading={skipLoading}
          >
            Skip
          </AppButton>
          <AppButton
            customClass="w-auto flex-1"
            onClick={onOk}
            loading={createLoading}
            disabled={isDisableBuyButton}
          >
            Buy
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default InitialBuyModal;
