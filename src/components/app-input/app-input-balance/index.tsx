import AppTruncateText from "@/components/app-truncate-text";
import { ECoinType } from "@/interfaces/token";
import { EthIcon, SelectDropdownIcon, UsdtIcon } from "@public/assets";
import { Input, InputProps, Select } from "antd";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { ChangeEvent } from "react";
import "./styles.scss";

interface Props extends InputProps {
  tokenSymbol: string;
  tokenImageSrc?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onTokenChange?: (token: ECoinType) => void;
  regex?: RegExp;
  isSwap?: boolean;
  maxValue?: number;
  label?: string;
  coinType?: ECoinType;
}

const AppInputBalance = ({
  tokenImageSrc,
  tokenSymbol,
  value,
  onChange,
  regex,
  isSwap,
  onTokenChange,
  maxValue,
  label,
  coinType,
  ...restProps
}: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      onChange?.(e);
      return;
    }

    if (
      (regex && !regex.test(value)) ||
      (maxValue && BigNumber(value).gt(maxValue))
    ) {
      return;
    }

    onChange?.(e);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value
      .replace(/(\.\d*?[1-9])0+$/, "$1") // Remove trailing zeros after a non-zero digit
      .replace(/^0+(?=\d)/, "") // Remove leading zeros
      .replace(/(\.\d*?)0+$/, "$1") // Remove trailing zeros if only decimal part is present
      .replace(/\.$/, ""); // Remove the decimal point if it's the last character

    onChange?.({ ...e, target: { ...e.target, value: formattedValue } });
  };

  return (
    <div className="token-balance-input">
      {isSwap ? (
        <div className="token-balance-input__token">
          <Select
            defaultValue={ECoinType.StableCoin}
            value={coinType}
            suffixIcon={
              <Image src={SelectDropdownIcon} alt="Select dropdown icon" />
            }
            popupClassName="select-token-modal"
            onChange={onTokenChange}
            labelRender={(item) => {
              if (item.value === ECoinType.MemeCoin) {
                return (
                  <div className="flex items-center gap-1">
                    {tokenImageSrc && (
                      <Image
                        alt="token"
                        width={20}
                        height={20}
                        className="rounded-full object-cover h-5"
                        src={tokenImageSrc}
                      />
                    )}
                    <span className="text-neutral-9 text-16px-medium">
                      <AppTruncateText text={tokenSymbol} maxLength={5} />
                    </span>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center gap-1">
                    <Image
                      alt="token"
                      width={20}
                      height={20}
                      src={EthIcon}
                      className="rounded-full object-cover h-5"
                    />
                    <span className="text-neutral-9 text-16px-medium">ETH</span>
                  </div>
                );
              }
            }}
          >
            <Select.Option value={ECoinType.MemeCoin}>
              <div className="flex items-center gap-1">
                {tokenImageSrc && (
                  <Image
                    alt="token"
                    width={20}
                    height={20}
                    className="rounded-full object-cover h-5"
                    src={tokenImageSrc}
                  />
                )}
                <span className="text-neutral-9 text-16px-medium">
                  {tokenSymbol}
                </span>
              </div>
            </Select.Option>
            <Select.Option value={ECoinType.StableCoin}>
              <div className="flex items-center gap-1">
                <Image
                  alt="token"
                  width={20}
                  height={20}
                  src={EthIcon}
                  className="rounded-full object-cover h-5"
                />
                <span className="text-neutral-9 text-16px-medium">ETH</span>
              </div>
            </Select.Option>
          </Select>
        </div>
      ) : (
        <div className="token-balance-input__token p-2">
          {tokenImageSrc && (
            <Image
              alt="token"
              width={20}
              height={20}
              src={tokenImageSrc}
              className="rounded-full object-cover h-5"
            />
          )}
          <span className="text-neutral-9 text-16px-medium">
            {label || <AppTruncateText text={tokenSymbol} maxLength={5} />}
          </span>
        </div>
      )}

      <div className="token-balance-input__input">
        <Input
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          {...restProps}
        />
      </div>
    </div>
  );
};

export default AppInputBalance;
