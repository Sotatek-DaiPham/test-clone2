import { routerContactAbi } from "@/abi/routerContract";
import { erc20Abi } from "@/abi/usdtAbi";
import AppAmountSelect from "@/components/app-amount-select";
import AppButton from "@/components/app-button";
import AppInputBalance from "@/components/app-input/app-input-balance";
import ConfirmModal from "@/components/app-modal/app-confirm-modal";
import TradeSettingModal from "@/components/app-modal/app-setting-modal";
import ConnectWalletButton from "@/components/Button/ConnectWallet";
import {
  AMOUNT_FIELD_NAME,
  ErrorCode,
  MINIMUM_BUY_AMOUNT,
  PREDEFINE_AMOUNT,
  PREDEFINE_SELL_PERCENT,
  TOKEN_DECIMAL,
  NATIVE_TOKEN_DECIMAL,
  GAS_FEE_BUFFER,
  DECIMAL_DISPLAY,
} from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { envs } from "@/constant/envs";
import { REGEX_INPUT_DECIMAL } from "@/constant/regex";
import { useTokenDetail } from "@/context/TokenDetailContext";
import { BeSuccessResponse } from "@/entities/response";
import {
  calculateTokenReceiveAfterListed,
  calculateUsdtShouldPayAfterListed,
  decreaseByPercent,
  swapToken1ForToken2,
} from "@/helpers/calculate";
import { nFormatter } from "@/helpers/formatNumber";
import usePairContract from "@/hooks/usePairContract";
import useTokenBalance from "@/hooks/useTokenBalance";
import { ECoinType } from "@/interfaces/token";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppSelector } from "@/libs/hooks";
import { postAPI } from "@/service";
import { useContract, useProvider } from "@/web3/contracts/useContract";
import { SettingIcon } from "@public/assets";
import { useMutation } from "@tanstack/react-query";
import { Form } from "antd";
import { useWatch } from "antd/es/form/Form";
import { AxiosResponse } from "axios";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { TabKey, useTradeSettings } from "..";
import { ethers } from "ethers";
import useEthBalance from "@/hooks/useEthBalance";
import AppTooltip from "@/components/app-tooltip";

export const SETTINGS_FIELD_NAMES = {
  FONT_RUNNING: "fontRunning",
  SLIPPAGE: "slippage",
  PRIORITY_FEE: "priorityFee",
} as const;

export interface FormSetting {
  [SETTINGS_FIELD_NAMES.FONT_RUNNING]: boolean;
  [SETTINGS_FIELD_NAMES.SLIPPAGE]: string;
  [SETTINGS_FIELD_NAMES.PRIORITY_FEE]: string;
}

const CONTRACT_ROUTER = envs.CONTRACT_ROUTER_ADDRESS;

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

const TradeTabAfterListed = ({ tabKey }: { tabKey: TabKey }) => {
  const { accessToken: isAuthenticated, address } = useAppSelector(
    (state) => state.user
  );
  const provider = useProvider();
  const {
    refetchEthBalance,
    balance: ethBalance,
    formattedBalance,
  } = useEthBalance(address);
  const { error, success } = useContext(NotificationContext);
  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [formSetting] = Form.useForm<FormSetting>();
  const [form] = Form.useForm<{ amount: string }>();
  const { tokenDetail, refetch } = useTokenDetail();
  const [loadingStatus, setLoadingStatus] = useState({
    buyToken: false,
    sellToken: false,
    approve: false,
  });

  const [gasFee, setGasFee] = useState<string>("");
  const { tradeSettings } = useTradeSettings();

  const { mutateAsync: confirmHash } = useMutation({
    mutationFn: (
      hash: string
    ): Promise<AxiosResponse<BeSuccessResponse<any>>> => {
      return postAPI(API_PATH.TRADING.CONFIRM(hash));
    },
    onError: (err) => {},
    mutationKey: ["confirm-hash"],
  });

  const { memeTokenAddress, wethAddress, memeTokenReserve, wethReserve } =
    usePairContract(tokenDetail?.pairListDex);

  const { data: memeTokenAllowance } = useReadContract({
    abi: erc20Abi,
    address: memeTokenAddress as any,
    functionName: "allowance",
    args: [address, CONTRACT_ROUTER],
  });

  const [coinType, setCoinType] = useState(ECoinType.StableCoin);
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const MemeTokenContract = useContract(erc20Abi, memeTokenAddress as string);

  const routerContract = useContract(routerContactAbi, CONTRACT_ROUTER);

  const amountValue = useWatch(AMOUNT_FIELD_NAME, form);

  const { balance, refetch: refetchUserBalance } = useTokenBalance(
    address,
    memeTokenAddress
  );

  const wethShouldPay: any = useMemo(() => {
    if (amountValue && coinType === ECoinType.MemeCoin) {
      return calculateUsdtShouldPayAfterListed(
        memeTokenReserve,
        wethReserve,
        amountValue
      );
    } else {
      return "";
    }
  }, [amountValue, tabKey, coinType]);

  const tokenWillReceive: any = useMemo(() => {
    if (amountValue && coinType === ECoinType.StableCoin) {
      return calculateTokenReceiveAfterListed(
        memeTokenReserve,
        wethReserve,
        amountValue
      );
    } else {
      return "";
    }
  }, [amountValue, tabKey, coinType]);

  const sellAmountOut: any = useMemo(() => {
    if (amountValue) {
      return swapToken1ForToken2(
        memeTokenReserve,
        wethReserve,
        BigNumber(amountValue)
      );
    } else {
      return "";
    }
  }, [amountValue, tabKey, coinType]);

  const usdtAmount =
    coinType === ECoinType.MemeCoin
      ? BigNumber(wethShouldPay)
          .multipliedBy(NATIVE_TOKEN_DECIMAL)
          .integerValue(BigNumber.ROUND_CEIL)
          .dividedBy(NATIVE_TOKEN_DECIMAL)
          .toFixed(6)
      : amountValue;

  const isDisableBuyButton =
    !amountValue ||
    !!(amountValue && BigNumber(amountValue).lt(MINIMUM_BUY_AMOUNT)) ||
    !!(wethShouldPay && BigNumber(wethShouldPay).lt(MINIMUM_BUY_AMOUNT));

  const getGasFeeForMaxBalanceTx = async () => {
    const contract = await routerContract;
    const path = getSwapPath();
    const args = [0, path, address, 9999999999999];
    const gasEstimate = (await contract?.swapExactETHForTokens?.estimateGas(
      ...args,
      {
        value: ethers.parseUnits(formattedBalance, "ether"),
      }
    )) as any;

    console.log("gasEstimate", gasEstimate);

    const gasPrice = await provider.getFeeData();

    console.log("gasPrice", gasPrice);
    const totalCostWei = BigNumber(gasEstimate?.toString() || "0")
      .multipliedBy(BigNumber(gasPrice.gasPrice?.toString() || "0"))
      .multipliedBy(GAS_FEE_BUFFER);

    const totalCostEth = ethers.formatEther(totalCostWei.toString());
    console.log("totalCostEth", totalCostEth);

    setGasFee(totalCostEth);
  };

  const handleSelect = (value: string) => {
    form.setFieldValue(AMOUNT_FIELD_NAME, value);
  };

  const handleSelectSellPercent = (value: string) => {
    const cleaned = value.replace("%", "");
    const percentNumber = parseFloat(cleaned);

    const sellValue = BigNumber(balance)
      .multipliedBy(BigNumber(percentNumber).div(100))
      .toFixed(2);
    if (Number(balance)) {
      form.setFieldValue(AMOUNT_FIELD_NAME, sellValue);
    } else {
      return;
    }
  };

  const handleTransactionSuccess = () => {
    form.resetFields(["amount"]);
    setIsOpenApproveModal(false);
    refetchUserBalance();
    refetchEthBalance();
    success({
      message: "Transaction completed",
      key: "1",
    });
  };

  const handleApproveToken = async () => {
    const contract = await MemeTokenContract;

    setLoadingStatus((prev) => ({ ...prev, approve: true }));

    try {
      console.log(
        "Approve params",
        CONTRACT_ROUTER,
        BigNumber(amountValue).multipliedBy(TOKEN_DECIMAL).toFixed()
      );
      const txn = await contract?.approve(
        CONTRACT_ROUTER,
        BigNumber(amountValue).multipliedBy(TOKEN_DECIMAL).toFixed()
      );

      await txn?.wait();
      await handleSwapToken();

      setLoadingStatus((prev) => ({ ...prev, approve: false }));
    } catch (e: any) {
      console.log({ e });
      setLoadingStatus((prev) => ({
        ...prev,
        approve: false,
        sellToken: false,
      }));
      handleError(e);
      return;
    } finally {
      setIsOpenApproveModal(false);
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
            {coinType === ECoinType.MemeCoin
              ? `${nFormatter(wethShouldPay) || 0} ETH`
              : `${nFormatter(tokenWillReceive) || 0} ${tokenDetail?.symbol}`}
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-16px-normal text-neutral-7">
          You will receive
          <span className="text-white-neutral text-16px-medium">
            {" "}
            {`${nFormatter(sellAmountOut) || 0} ETH`}
          </span>
        </div>
      );
    }
  };

  const getSwapAmount = () => {
    return tabKey === TabKey.BUY
      ? coinType === ECoinType.MemeCoin
        ? BigNumber(wethShouldPay).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(0)
        : ethers.parseUnits(amountValue, "ether")
      : BigNumber(amountValue).multipliedBy(TOKEN_DECIMAL).toFixed();
  };

  const getMinTokenOut = () => {
    return Number(tradeSettings?.slippage)
      ? tabKey === TabKey.BUY
        ? coinType === ECoinType.MemeCoin
          ? decreaseByPercent(amountValue, tradeSettings?.slippage)
          : decreaseByPercent(tokenWillReceive, tradeSettings?.slippage)
        : decreaseByPercent(sellAmountOut, tradeSettings?.slippage)
      : 0;
  };

  const getSwapPath = () => {
    return tabKey === TabKey.BUY
      ? [wethAddress, memeTokenAddress]
      : [memeTokenAddress, wethAddress];
  };

  const handleError = (e: any) => {
    if (e?.code === ErrorCode.MetamaskDeniedTx) {
      error({
        message: "Transaction denied",
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

  const handleSwapToken = async () => {
    if (tabKey === TabKey.BUY) {
      setLoadingStatus((prev) => ({ ...prev, buyToken: true }));
    } else {
      setLoadingStatus((prev) => ({ ...prev, sellToken: true }));
    }
    const contract = await routerContract;

    const gasLimit = Number(tradeSettings?.priorityFee)
      ? BigNumber(tradeSettings?.priorityFee).multipliedBy(1e10).toString()
      : 0;

    const swapAmount = getSwapAmount();
    const minTokenOut = getMinTokenOut();

    const path = getSwapPath();

    console.log(
      "Swap Params",
      swapAmount,
      BigNumber(minTokenOut)
        .multipliedBy(
          tabKey === TabKey.BUY ? TOKEN_DECIMAL : NATIVE_TOKEN_DECIMAL
        )
        .toFixed(0),
      path,
      address,
      address,
      9999999999999
    );

    try {
      let tx;
      if (tabKey === TabKey.BUY) {
        if (
          BigNumber(ethBalance?.toString() || "0").lt(swapAmount.toString())
        ) {
          setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
          error({
            message: "Insufficient Fee",
          });
          return;
        }

        const etherAmount =
          (BigNumber(amountValue).isLessThanOrEqualTo(
            BigNumber(formattedBalance)
          ) &&
            BigNumber(amountValue)
              .plus(gasFee)
              .isGreaterThan(formattedBalance)) ||
          (BigNumber(wethShouldPay).isLessThanOrEqualTo(wethShouldPay) &&
            BigNumber(wethShouldPay)
              .plus(gasFee)
              .isGreaterThan(formattedBalance))
            ? ethers.parseUnits(
                BigNumber(formattedBalance).minus(gasFee).toString()
              )
            : swapAmount;

        tx = await contract?.swapExactETHForTokens(
          BigNumber(minTokenOut)
            .multipliedBy(
              tabKey === TabKey.BUY ? TOKEN_DECIMAL : NATIVE_TOKEN_DECIMAL
            )
            .toFixed(0),
          path,
          address,
          9999999999999,
          {
            value: etherAmount,
            gasLimit: gasLimit || undefined,
          }
        );
      } else {
        tx = await contract?.swapExactTokensForETH(
          swapAmount,
          BigNumber(minTokenOut).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(0),
          path,
          address,
          9999999999999,
          {
            gasLimit: gasLimit || undefined,
          }
        );
      }

      await tx.wait();
      const txHash = tx?.hash;
      await confirmHash(txHash);
      handleTransactionSuccess();
      if (tabKey === TabKey.BUY) {
        setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
      } else {
        refetchUserBalance();
        setLoadingStatus((prev) => ({ ...prev, sellToken: false }));
      }
    } catch (e: any) {
      console.log({ e });
      if (tabKey === TabKey.BUY) {
        setLoadingStatus((prev) => ({ ...prev, buyToken: false }));
      } else {
        setLoadingStatus((prev) => ({ ...prev, sellToken: false }));
      }
      handleError(e);
      return;
    }
  };

  const handleBuyToken = async () => {
    await handleSwapToken();
  };

  const handleSellToken = async () => {
    const memeTokenAllowanceConverted = BigNumber(
      memeTokenAllowance as string
    ).dividedBy(TOKEN_DECIMAL);
    const needApprove = BigNumber(amountValue).gt(
      memeTokenAllowanceConverted ?? "0"
    );

    if (needApprove) {
      setIsOpenApproveModal(true);
      return;
    }

    await handleSwapToken();
  };

  const maxBuyAmount = useMemo(() => {
    const maxBuyAmount = BigNumber(formattedBalance)
      .minus(gasFee)
      .toFixed(DECIMAL_DISPLAY, BigNumber.ROUND_DOWN);
    return BigNumber(maxBuyAmount).gt(0) ? maxBuyAmount : "0";
  }, [formattedBalance, gasFee]);

  useEffect(() => {
    if (usdtAmount || sellAmountOut) {
      form.validateFields();
    }
  }, [usdtAmount, sellAmountOut]);

  useEffect(() => {
    getGasFeeForMaxBalanceTx();
  }, [
    routerContract,
    tokenDetail?.contractAddress,
    address,
    provider,
    coinType,
    formattedBalance,
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
                        {nFormatter(gasFee, DECIMAL_DISPLAY)} ETH
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-14px-normal text-neutral-7">
                        Maximum buy amount:
                      </div>
                      <div className="text-14px-normal text-white-neutral">
                        {maxBuyAmount} ETH
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
                  tabKey === TabKey.BUY ? usdtAmount : sellAmountOut
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

      <div className="flex gap-2 items-center w-full">
        {isAuthenticated ? (
          tabKey === TabKey.BUY ? (
            <AppButton
              customClass="w-full"
              onClick={handleBuyToken}
              loading={loadingStatus.buyToken || loadingStatus.approve}
              disabled={isDisableBuyButton}
            >
              Buy
            </AppButton>
          ) : (
            <AppButton
              customClass="w-full"
              onClick={handleSellToken}
              loading={loadingStatus.sellToken}
              disabled={!amountValue}
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
        onOk={handleApproveToken}
        onCancel={() => {
          setIsOpenApproveModal(false);
          setLoadingStatus((prev) => ({ ...prev, approve: false }));
        }}
      />
    </div>
  );
};

export default TradeTabAfterListed;
