import { pumpContractABI } from "@/abi/pumpContractAbi";
import { erc20Abi } from "@/abi/usdtAbi";
import AppAmountSelect from "@/components/app-amount-select";
import AppButton from "@/components/app-button";
import AppInputBalance from "@/components/app-input/app-input-balance";
import ConfirmModal from "@/components/app-modal/app-confirm-modal";
import TradeSettingModal from "@/components/app-modal/app-setting-modal";
import AppNumberToolTip from "@/components/app-number-tooltip";
import ConnectWalletButton from "@/components/Button/ConnectWallet";
import {
  AMOUNT_FIELD_NAME,
  ErrorCode,
  MINIMUM_BUY_AMOUNT,
  PREDEFINE_AMOUNT,
  PREDEFINE_SELL_PERCENT,
  TOKEN_DECIMAL,
  NATIVE_TOKEN_DECIMAL,
  ETH_THRESHOLD,
  ETH_THRESHOLD_WITH_FEE,
  TOKEN_DECIMAL_PLACE,
  GAS_FEE_BUFFER,
  DECIMAL_DISPLAY,
} from "@/constant";
import { envs } from "@/constant/envs";
import { REGEX_INPUT_DECIMAL } from "@/constant/regex";
import { useTokenDetail } from "@/context/TokenDetailContext";
import {
  calculateTokenReceive,
  calculateTokenReceiveWithoutFee,
  calculateUsdtShouldPay,
  decreaseByPercent,
  DISCOUNT_FACTOR,
  increaseByPercent,
} from "@/helpers/calculate";
import useCalculateAmount from "@/hooks/useCalculateAmount";
import useTokenBalance from "@/hooks/useTokenBalance";
import { ECoinType } from "@/interfaces/token";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppSelector } from "@/libs/hooks";
import { useContract, useProvider } from "@/web3/contracts/useContract";
import { SettingIcon } from "@public/assets";
import { Form } from "antd";
import { useWatch } from "antd/es/form/Form";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { TabKey, useTradeSettings } from "..";
import { ethers } from "ethers";
import useEthBalance from "@/hooks/useEthBalance";
import AppTooltip from "@/components/app-tooltip";
import { nFormatter } from "@/helpers/formatNumber";

export const SETTINGS_FIELD_NAMES = {
  FONT_RUNNING: "fontRunning",
  SLIPPAGE: "slippage",
  PRIORITY_FEE: "priorityFee",
} as const;

const LOWEST_SELL_AMOUNT = "0.000001";
export interface FormSetting {
  [SETTINGS_FIELD_NAMES.FONT_RUNNING]: boolean;
  [SETTINGS_FIELD_NAMES.SLIPPAGE]: string;
  [SETTINGS_FIELD_NAMES.PRIORITY_FEE]: string;
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

const TradeTab = ({ tabKey }: { tabKey: TabKey }) => {
  const { accessToken: isAuthenticated, address } = useAppSelector(
    (state) => state.user
  );
  const provider = useProvider();
  const { formattedBalance: ethBalance, refetchEthBalance } =
    useEthBalance(address);

  const { error, success } = useContext(NotificationContext);
  const [gasFee, setGasFee] = useState<string>("");
  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [formSetting] = Form.useForm<FormSetting>();
  const [form] = Form.useForm<{ amount: string }>();
  const {
    tokenDetail,
    tokenDetailSC,
    refetch: refetchDetailSC,
  } = useTokenDetail();
  const [loadingStatus, setLoadingStatus] = useState({
    buyToken: false,
    sellToken: false,
    approve: false,
  });

  const { balance, refetch: refetchUserBalance } = useTokenBalance(
    address,
    tokenDetail?.contractAddress
  );
  const { tradeSettings } = useTradeSettings();

  const [coinType, setCoinType] = useState(ECoinType.StableCoin);
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [sellAmount, setSellAmount] = useState("");

  const USDTContract = useContract(erc20Abi, envs.USDT_ADDRESS);
  const tokenFactoryContract = useContract(
    pumpContractABI,
    envs.TOKEN_FACTORY_ADDRESS || ""
  );

  const isTokenMint = !!tokenDetail?.contractAddress;

  const amountValue = useWatch(AMOUNT_FIELD_NAME, form);

  const availableToken = useMemo(() => {
    const tokenThreshold = calculateTokenReceive(ETH_THRESHOLD.toString());
    return BigNumber(tokenThreshold).minus(tokenDetailSC?.tokensSold || "0");
  }, [tokenDetailSC]);

  const { amount: buyAmountOut } = useCalculateAmount({
    contractAddress: tokenDetail?.contractAddress,
    value: amountValue,
    decimalIn: NATIVE_TOKEN_DECIMAL,
    decimalOut: TOKEN_DECIMAL,
    functionName: "calculateBuyAmountOut",
    coinType: coinType,
  });

  const isExceedAvailableToken = useMemo(() => {
    if (coinType === ECoinType.MemeCoin) {
      return BigNumber(amountValue).gt(availableToken);
    } else {
      return BigNumber(buyAmountOut).gt(availableToken);
    }
  }, [amountValue, availableToken, coinType, buyAmountOut]);

  const { amount: buyAmountIn } = useCalculateAmount({
    contractAddress: tokenDetail?.contractAddress,
    value: isExceedAvailableToken
      ? BigNumber(availableToken).toFixed(6, BigNumber.ROUND_DOWN)
      : amountValue,
    decimalIn: TOKEN_DECIMAL,
    decimalOut: NATIVE_TOKEN_DECIMAL,
    functionName: "calculateBuyAmountIn",
    coinType: coinType,
  });

  const { amount: sellAmountOut, error: err } = useCalculateAmount({
    contractAddress: tokenDetail?.contractAddress,
    value: amountValue,
    decimalIn: TOKEN_DECIMAL,
    decimalOut: NATIVE_TOKEN_DECIMAL,
    functionName: "calculateSellAmountOut",
    coinType: coinType,
  });

  const ethShouldPay: any = useMemo(() => {
    if (amountValue && coinType === ECoinType.MemeCoin) {
      if (isTokenMint) {
        return buyAmountIn;
        // return isExceedAvailableToken ? USDT_THRESHOLD : buyAmountIn;
      } else {
        const calculatedUsdtShouldPay = calculateUsdtShouldPay(amountValue);
        return BigNumber(calculatedUsdtShouldPay).lt(0) ||
          !BigNumber(calculatedUsdtShouldPay).isFinite()
          ? ETH_THRESHOLD_WITH_FEE.toString()
          : calculatedUsdtShouldPay;
      }
    } else {
      return "";
    }
  }, [amountValue, buyAmountIn, isTokenMint, coinType]);

  const tokenWillReceive: any = useMemo(() => {
    if (amountValue && coinType === ECoinType.StableCoin) {
      if (isTokenMint) {
        return isExceedAvailableToken
          ? BigNumber(availableToken).toFixed(6, BigNumber.ROUND_DOWN)
          : buyAmountOut;
      } else {
        const calculatedTokenWillReceive = calculateTokenReceive(amountValue);

        const maxTokenWillReceive = calculateTokenReceive(
          ETH_THRESHOLD_WITH_FEE.toString()
        );

        return BigNumber(amountValue).gt(ETH_THRESHOLD_WITH_FEE)
          ? maxTokenWillReceive
          : calculatedTokenWillReceive;
      }
    } else {
      return "";
    }
  }, [
    amountValue,
    buyAmountOut,
    isTokenMint,
    coinType,
    isExceedAvailableToken,
    availableToken,
  ]);

  const ethAmount =
    coinType === ECoinType.MemeCoin
      ? BigNumber(ethShouldPay).toFixed(
          TOKEN_DECIMAL_PLACE,
          BigNumber.ROUND_DOWN
        )
      : amountValue;

  const isDisableBuyButton =
    !amountValue ||
    !!(amountValue && BigNumber(amountValue).lt(MINIMUM_BUY_AMOUNT)) ||
    !!(ethShouldPay && BigNumber(ethShouldPay).lt(MINIMUM_BUY_AMOUNT));

  const isDisableSellButton =
    !isTokenMint ||
    !amountValue ||
    !!(sellAmountOut && BigNumber(sellAmountOut).lt(MINIMUM_BUY_AMOUNT));

  const getGasFeeForMaxBalanceTx = async () => {
    try {
      const contract = await tokenFactoryContract;
      const args = [tokenDetail?.contractAddress, 0, address];

      let gasEstimate;
      if (coinType === ECoinType.MemeCoin) {
        gasEstimate = (await contract?.buyExactIn?.estimateGas(...args, {
          value: ethers.parseUnits(ethBalance, "ether"),
        })) as any;
      } else {
        gasEstimate = (await contract?.buyExactOut?.estimateGas(...args, {
          value: ethers.parseUnits(ethBalance, "ether"),
        })) as any;
      }

      console.log("gasEstimate", gasEstimate);

      const gasPrice = await provider.getFeeData();

      console.log("gasPrice", gasPrice);
      const totalCostWei = BigNumber(gasEstimate?.toString() || "0")
        .multipliedBy(BigNumber(gasPrice.gasPrice?.toString() || "0"))
        .multipliedBy(GAS_FEE_BUFFER);

      const totalCostEth = ethers.formatEther(totalCostWei.toString());
      console.log("totalCostEth", totalCostEth);

      setGasFee(totalCostEth);
    } catch (e) {
      console.log({ e });
    }
  };

  const handleSelect = (value: string) => {
    form.setFieldValue(AMOUNT_FIELD_NAME, value);
  };

  const handleSelectSellPercent = (value: string) => {
    const cleaned = value.replace("%", "");
    const percentNumber = parseFloat(cleaned);

    const sellValue = BigNumber(balance)
      .multipliedBy(BigNumber(percentNumber).div(100))
      .toFixed(TOKEN_DECIMAL_PLACE, BigNumber.ROUND_DOWN);

    const formattedSellValue = BigNumber(balance)
      .multipliedBy(BigNumber(percentNumber).div(100))
      .toFixed(6, BigNumber.ROUND_DOWN);

    if (BigNumber(balance).gt(LOWEST_SELL_AMOUNT)) {
      form.setFieldValue(AMOUNT_FIELD_NAME, formattedSellValue);
      setSellAmount(sellValue);
    } else {
      return;
    }
  };

  const handleTransactionSuccess = () => {
    form.resetFields(["amount"]);
    refetchUserBalance();
    refetchEthBalance();
    refetchDetailSC();
    success({
      message: "Transaction completed",
      key: "1",
    });
  };

  const handleCreateAndBuyToken = async () => {
    setLoadingStatus((prev) => ({ ...prev, buyToken: true }));
    const contract = await tokenFactoryContract;
    const minTokenOut = Number(tradeSettings?.slippage)
      ? decreaseByPercent(
          coinType === ECoinType.MemeCoin ? ethShouldPay : tokenWillReceive,
          tradeSettings?.slippage
        )
      : 0;

    const gasLimit = Number(tradeSettings?.priorityFee)
      ? BigNumber(tradeSettings?.priorityFee).multipliedBy(1e10).toString()
      : 0;

    try {
      console.log(
        "buyAndCreateToken",
        tokenDetail?.symbol,
        tokenDetail?.name,
        BigNumber(ethAmount).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(),
        BigNumber(minTokenOut).multipliedBy(TOKEN_DECIMAL).toFixed(0),
        address,
        tokenDetail.idx,
        tokenDetail?.userWalletAddress
      );
      const tx = await contract?.buyAndCreateToken(
        tokenDetail?.symbol,
        tokenDetail?.name,
        0,
        address,
        tokenDetail.idx,
        tokenDetail?.userWalletAddress,
        {
          value: ethers.parseUnits(ethAmount, "ether"),
          gasLimit: gasLimit || undefined,
        }
      );
      await tx.wait();
      handleTransactionSuccess();
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
      handleError(e);
      return;
    }
  };

  const handleBuyTokenExactIn = async () => {
    if (BigNumber(ethBalance).lt(amountValue)) {
      error({
        message: "Insufficient Fee",
      });
      return;
    }

    const contract = await tokenFactoryContract;
    setLoadingStatus((prev) => ({ ...prev, buyToken: true }));
    const minTokenOut = Number(tradeSettings?.slippage)
      ? decreaseByPercent(tokenWillReceive, tradeSettings?.slippage)
      : 0;
    const gasLimit = Number(tradeSettings?.priorityFee)
      ? BigNumber(tradeSettings?.priorityFee).multipliedBy(1e10).toString()
      : 0;

    try {
      const etherAmount =
        BigNumber(amountValue).isLessThanOrEqualTo(ethBalance) &&
        BigNumber(amountValue).plus(gasFee).isGreaterThan(ethBalance)
          ? BigNumber(ethBalance).minus(gasFee).toString()
          : amountValue;

      console.log(
        "buyExactInParam",
        tokenDetail?.contractAddress,
        BigNumber(amountValue).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(),
        BigNumber(minTokenOut).multipliedBy(TOKEN_DECIMAL).toFixed(0),
        address
      );

      const tx = await contract?.buyExactIn(
        tokenDetail?.contractAddress,
        BigNumber(minTokenOut).multipliedBy(TOKEN_DECIMAL).toFixed(0),
        address,
        {
          value: ethers.parseUnits(etherAmount, "ether"),
          gasLimit: gasLimit || undefined,
        }
      );
      await tx.wait();
      handleTransactionSuccess();
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
      handleError(e);
      return;
    }
  };
  const handleBuyTokenExactOut = async () => {
    const contract = await tokenFactoryContract;
    setLoadingStatus((prev) => ({ ...prev, buyToken: true }));
    const maxEthOut = Number(tradeSettings?.slippage)
      ? increaseByPercent(ethShouldPay, tradeSettings?.slippage)
      : ethShouldPay;
    const gasLimit = Number(tradeSettings?.priorityFee)
      ? BigNumber(tradeSettings?.priorityFee).multipliedBy(1e10).toString()
      : 0;

    let tx;
    try {
      if (!isExceedAvailableToken) {
        if (BigNumber(ethBalance).lt(ethShouldPay)) {
          setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
          error({
            message: "Insufficient Fee",
          });
          return;
        }

        const etherAmount =
          BigNumber(ethShouldPay).isLessThanOrEqualTo(ethBalance) &&
          BigNumber(ethShouldPay).plus(gasFee).isGreaterThan(ethBalance)
            ? BigNumber(ethBalance).minus(gasFee).toString()
            : ethShouldPay;

        console.log(
          "buyExactOutParam",
          tokenDetail?.contractAddress,
          BigNumber(amountValue).multipliedBy(TOKEN_DECIMAL).toFixed(),
          BigNumber(maxEthOut).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(),
          address
        );

        tx = await contract?.buyExactOut(
          tokenDetail?.contractAddress,
          BigNumber(amountValue).multipliedBy(TOKEN_DECIMAL).toFixed(),
          address,
          {
            value: ethers.parseUnits(etherAmount, "ether"),
            gasLimit: gasLimit || undefined,
          }
        );
      } else {
        if (BigNumber(ethBalance).lt(ETH_THRESHOLD.toString())) {
          setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
          error({
            message: "Insufficient Fee",
          });
          return;
        }

        console.log(
          "buyExactInParam",
          tokenDetail?.contractAddress,
          BigNumber(ETH_THRESHOLD).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(),
          0,
          address
        );

        tx = await contract?.buyExactIn(
          tokenDetail?.contractAddress,
          0,
          address,
          {
            value: ethers.parseUnits(ETH_THRESHOLD.toString(), "ether"),
            gasLimit: gasLimit || undefined,
          }
        );
      }
      await tx.wait();
      handleTransactionSuccess();
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
      handleError(e);
      return;
    }
  };

  const handleSellToken = async () => {
    if (BigNumber(balance).lt(sellAmount)) {
      error({
        message:
          "The current token balance is lower than the input sell amount",
      });
      return;
    }

    setLoadingStatus((prev) => ({ ...prev, sellToken: true }));
    const contract = await tokenFactoryContract;
    const sellAmountOutDiscount = BigNumber(sellAmountOut)
      .multipliedBy(DISCOUNT_FACTOR)
      .toString();

    const minEthOut = Number(tradeSettings?.slippage)
      ? decreaseByPercent(sellAmountOutDiscount, tradeSettings?.slippage)
      : 0;

    const gasLimit = Number(tradeSettings?.priorityFee)
      ? BigNumber(tradeSettings?.priorityFee).multipliedBy(1e10).toString()
      : 0;
    try {
      console.log(
        "sellTokenParam",
        tokenDetail?.contractAddress,
        BigNumber(sellAmount).multipliedBy(TOKEN_DECIMAL).toFixed(),
        BigNumber(minEthOut).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(0),
        address
      );
      const tx = await contract?.sellExactIn(
        tokenDetail?.contractAddress,
        BigNumber(sellAmount).multipliedBy(TOKEN_DECIMAL).toFixed(),
        BigNumber(minEthOut).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(0),
        address,
        {
          gasLimit: gasLimit || undefined,
        }
      );
      await tx.wait();
      handleTransactionSuccess();
      setLoadingStatus((prev) => ({ ...prev, sellToken: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({ ...prev, sellToken: false }));
      handleError(e);
      return;
    }
  };

  const handleApprove = async () => {
    const contract = await USDTContract;
    setLoadingStatus((prev) => ({ ...prev, approve: true }));
    try {
      console.log(
        "Approve params",
        envs.TOKEN_FACTORY_ADDRESS,
        BigNumber(ethAmount)
          .multipliedBy(NATIVE_TOKEN_DECIMAL)
          .integerValue(BigNumber.ROUND_HALF_UP)
          .toString()
      );
      const txn = await contract?.approve(
        envs.TOKEN_FACTORY_ADDRESS,
        BigNumber(ethAmount)
          .multipliedBy(NATIVE_TOKEN_DECIMAL)
          .integerValue(BigNumber.ROUND_HALF_UP)
          .toString()
      );

      await txn?.wait();
      if (isTokenMint) {
        if (coinType === ECoinType.MemeCoin) {
          await handleBuyTokenExactOut();
        } else {
          await handleBuyTokenExactIn();
        }
      } else {
        await handleCreateAndBuyToken();
      }

      setLoadingStatus((prev) => ({ ...prev, approve: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({
        ...prev,
        approve: false,
        buyToken: false,
      }));
      handleError(e);
      return;
    } finally {
      setIsOpenApproveModal(false);
    }
  };

  const handleBuyToken = async () => {
    // const isApproved = BigNumber(usdtAmount).gt(allowance ?? "0");

    // if (isApproved) {
    //   setIsOpenApproveModal(true);
    //   return;
    // }

    if (isTokenMint) {
      if (coinType === ECoinType.MemeCoin) {
        await handleBuyTokenExactOut();
      } else {
        await handleBuyTokenExactIn();
      }
    } else {
      await handleCreateAndBuyToken();
    }
  };

  const renderAmountInOut = () => {
    if (tabKey === TabKey.BUY) {
      return (
        <div className="text-16px-normal text-neutral-7">
          {coinType === ECoinType.MemeCoin
            ? "You must pay "
            : "You will receive "}
          <span className="text-white-neutral text-16px-medium">
            {" "}
            {coinType === ECoinType.MemeCoin ? (
              <>
                <AppNumberToolTip
                  decimal={6}
                  isFormatterK={false}
                  value={BigNumber(ethShouldPay).toString()}
                />{" "}
                ETH
              </>
            ) : (
              <>
                <AppNumberToolTip
                  decimal={6}
                  isFormatterK={false}
                  value={BigNumber(tokenWillReceive).toString()}
                />{" "}
                {tokenDetail?.symbol}
              </>
            )}
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-16px-normal text-neutral-7">
          You will receive
          <span className="text-white-neutral text-16px-medium">
            {" "}
            <AppNumberToolTip
              decimal={6}
              isFormatterK={false}
              value={BigNumber(sellAmountOut)
                .multipliedBy(DISCOUNT_FACTOR)
                .toString()}
            />{" "}
            ETH
          </span>
        </div>
      );
    }
  };

  const renderBuyExactOutReminder = () => {
    return coinType === ECoinType.MemeCoin ? (
      <div className="text-neutral-7 ">
        <div className="text-12px-bold">Reminder: </div>
        <div className="text-12px-normal">
          When using this method to buy tokens, simultaneous transactions may
          cause repeated transaction failures. If this happens, we recommend
          switching to buying with an exact amount of ETH.
        </div>
      </div>
    ) : null;
  };

  const handleError = (e: any) => {
    if (tabKey === TabKey.SELL) {
      if (BigNumber(balance).lt(amountValue)) {
        error({
          message:
            "The current token balance is lower than the input sell amount",
        });
        return;
      }
    }

    if (e?.code === ErrorCode.MetamaskDeniedTx) {
      error({
        message: "Transaction denied",
      });
      return;
    }

    if (e?.reason === ErrorCode.TOKEN_ALREADY_MINTED) {
      error({
        message: "Transaction Error",
      });
      return;
    }

    // if (e?.action === "estimateGas") {
    //   error({
    //     message: "Insufficient fee",
    //   });
    //   return;
    // }

    if (e) {
      error({
        message: "Transaction Error",
      });
      return;
    }
  };

  const maxBuyAmount = useMemo(() => {
    const maxBuyAmount = BigNumber(ethBalance)
      .minus(gasFee)
      .toFixed(DECIMAL_DISPLAY, BigNumber.ROUND_DOWN);
    return BigNumber(maxBuyAmount).gt(0) ? maxBuyAmount : "0";
  }, [ethBalance, gasFee]);

  useEffect(() => {
    if (ethAmount || sellAmountOut) {
      form.validateFields();
    }
  }, [ethAmount, sellAmountOut]);

  useEffect(() => {
    getGasFeeForMaxBalanceTx();
  }, [
    tokenFactoryContract,
    tokenDetail?.contractAddress,
    address,
    provider,
    coinType,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-14px-normal text-neutral-7">
          {tabKey === TabKey.BUY ? (
            <div className="flex items-center gap-2">
              Buy Amount
              <AppTooltip
                overlayClassName="min-w-[300px] rounded border border-[#44474A] bg-[#131314] shadow-md"
                arrow={false}
                title={
                  <div className="flex flex-col gap-2 ">
                    <div className="flex justify-between">
                      <div className="text-14px-normal text-neutral-7">
                        Estimated gas fee:
                      </div>
                      <div className="text-14px-normal text-white-neutral">
                        {isTokenMint
                          ? `${nFormatter(gasFee, DECIMAL_DISPLAY)} ETH`
                          : "NaN"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-14px-normal text-neutral-7">
                        Maximum buy amount:
                      </div>
                      <div className="text-14px-normal text-white-neutral">
                        {isTokenMint ? `${maxBuyAmount} ETH` : "NaN"}
                      </div>
                    </div>
                  </div>
                }
                isShowIcon={true}
              />
            </div>
          ) : (
            "Sell Amount"
          )}
        </div>
        <div className="text-14px-normal text-neutral-7">
          Minimum amount:{" "}
          <span className="text-white-neutral text-14px-medium">
            {" "}
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
                amountValidator(
                  value,
                  tabKey === TabKey.BUY ? ethAmount : sellAmountOut
                ),
            },
          ]}
        >
          {tabKey === TabKey.BUY ? (
            <AppInputBalance
              tokenImageSrc={tokenDetail?.avatar}
              tokenSymbol={tokenDetail?.symbol}
              onTokenChange={(token) => setCoinType(token)}
              regex={REGEX_INPUT_DECIMAL(0, 6)}
              placeholder="Enter buy amount"
              isSwap
              coinType={coinType}
            />
          ) : (
            <AppInputBalance
              tokenImageSrc={tokenDetail?.avatar}
              tokenSymbol={tokenDetail?.symbol}
              regex={REGEX_INPUT_DECIMAL(0, 6)}
              placeholder="Enter sell amount"
            />
          )}
        </Form.Item>
      </Form>
      {tabKey === TabKey.BUY ? (
        coinType === ECoinType.StableCoin ? (
          <AppAmountSelect numbers={PREDEFINE_AMOUNT} onSelect={handleSelect} />
        ) : null
      ) : (
        <AppAmountSelect
          numbers={PREDEFINE_SELL_PERCENT}
          onSelect={handleSelectSellPercent}
        />
      )}

      {renderAmountInOut()}

      {renderBuyExactOutReminder()}

      <div className="flex gap-2 items-center w-full">
        {isAuthenticated ? (
          tabKey === TabKey.BUY ? (
            <AppButton
              customClass="w-full"
              onClick={handleBuyToken}
              loading={
                loadingStatus.buyToken ||
                (!isTokenMint && loadingStatus.approve)
              }
              disabled={isDisableBuyButton}
            >
              Buy
            </AppButton>
          ) : (
            <AppButton
              customClass="w-full"
              onClick={handleSellToken}
              loading={loadingStatus.sellToken}
              disabled={isDisableSellButton}
            >
              Sell
            </AppButton>
          )
        ) : (
          <ConnectWalletButton customClass="flex-1" />
        )}
        <Image
          className="cursor-pointer"
          src={SettingIcon}
          alt="setting"
          width={40}
          height={40}
          onClick={() => setOpenSettingModal(true)}
        />
      </div>
      <TradeSettingModal
        open={openSettingModal}
        onClose={() => {
          setOpenSettingModal(false);
        }}
        onOk={() => setOpenSettingModal(false)}
        form={formSetting}
      />

      <ConfirmModal
        title="You need to approve your tokens in order to make transaction"
        onOkText="Approve"
        open={isOpenApproveModal}
        loading={loadingStatus.approve}
        onOk={handleApprove}
        onCancel={() => {
          setIsOpenApproveModal(false);
          setLoadingStatus((prev) => ({ ...prev, approve: false }));
        }}
      />
    </div>
  );
};

export default TradeTab;
