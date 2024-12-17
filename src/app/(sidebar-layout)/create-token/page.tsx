"use client";
import { pumpContractABI } from "@/abi/pumpContractAbi";
import { erc20Abi } from "@/abi/usdtAbi";
import AppButton from "@/components/app-button";
import FormItemLabel from "@/components/app-form-label";
import AppInput from "@/components/app-input";
import { FileItem } from "@/components/app-input/app-input-comment";
import ConfirmModal from "@/components/app-modal/app-confirm-modal";
import InitialBuyModal from "@/components/app-modal/app-initial-buy-modal";
import ConnectWalletButton from "@/components/Button/ConnectWallet";
import {
  ACCEPT_IMAGE_EXTENSION,
  AMOUNT_FIELD_NAME,
  ETH_THRESHOLD_WITH_FEE,
  NATIVE_TOKEN_DECIMAL,
  TOKEN_DECIMAL_PLACE,
} from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { envs } from "@/constant/envs";
import {
  DiscordUrlRegex,
  TelegramUrlRegex,
  TwitterUrlRegex,
  WebsiteUrlRegex,
} from "@/constant/regex";
import { PATH_ROUTER } from "@/constant/router";
import { BeSuccessResponse } from "@/entities/response";
import {
  calculateTokenReceive,
  calculateUsdtShouldPay,
} from "@/helpers/calculate";
import { formatBytes } from "@/helpers/formatNumber";
import { TokenImageValidator } from "@/helpers/upload";
import useWindowSize from "@/hooks/useWindowSize";
import {
  ECoinType,
  ICreateTokenReq,
  ICreateTokenRes,
} from "@/interfaces/token";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppSelector } from "@/libs/hooks";
import { postFormDataAPI } from "@/service";
import { useContract } from "@/web3/contracts/useContract";
import { CloseIcon, UploadIcon } from "@public/assets";
import { useMutation } from "@tanstack/react-query";
import { Form } from "antd";
import { useWatch } from "antd/es/form/Form";
import { AxiosResponse } from "axios";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { get } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FIELD_NAMES = {
  COIN_NAME: "coinName",
  COIN_TICKER: "coinTicker",
  DESCRIPTION: "description",
  LOGO_UPLOAD: "logoUpload",
  WEBSITE: "website",
  TWITTER: "twitter",
  TELEGRAM: "telegram",
  DISCORD: "discord",
} as const;

interface CreateTokenFormValues {
  [FIELD_NAMES.COIN_NAME]: string;
  [FIELD_NAMES.COIN_TICKER]: string;
  [FIELD_NAMES.DESCRIPTION]: string;
  [FIELD_NAMES.LOGO_UPLOAD]: any;
  [FIELD_NAMES.WEBSITE]?: string;
  [FIELD_NAMES.TWITTER]?: string;
  [FIELD_NAMES.TELEGRAM]?: string;
  [FIELD_NAMES.DISCORD]?: string;
}

const urlRegexMap: {
  [x: string]: RegExp;
} = {
  [FIELD_NAMES.WEBSITE]: WebsiteUrlRegex,
  [FIELD_NAMES.TWITTER]: TwitterUrlRegex,
  [FIELD_NAMES.TELEGRAM]: TelegramUrlRegex,
  [FIELD_NAMES.DISCORD]: DiscordUrlRegex,
};

const urlValidator = (props: any, value: string) => {
  if (!!value && !urlRegexMap[props.field].test(value)) {
    return Promise.reject("Invalid URL");
  }

  return Promise.resolve();
};

const CreateTokenPage = () => {
  const router = useRouter();
  const { isDesktop } = useWindowSize();
  const [form] = Form.useForm<CreateTokenFormValues>();
  const [amountForm] = Form.useForm<{ amount: string }>();
  const { accessToken: isAuthenticated, address } = useAppSelector(
    (state) => state.user
  );
  const { error, success } = useContext(NotificationContext);
  const [loadingStatus, setLoadingStatus] = useState({
    createToken: false,
    createTokenWithoutBuy: false,
    approve: false,
  });
  const [isOpenInitialBuyModal, setIsOpenInitialBuyModal] = useState(false);
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [tokenCreatedIdx, setTokenCreatedIdx] = useState("");
  const [tokenCreatedId, setTokenCreatedId] = useState("");
  const { mutateAsync: uploadImages } = useMutation({
    mutationFn: (payload: FormData) => {
      return postFormDataAPI(API_PATH.UPLOAD_IMAGE, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    mutationKey: ["upload-images"],
    onError: (err) => {
      error({ message: "Upload image failed" });
    },
  });

  const { mutateAsync: createToken } = useMutation({
    mutationFn: (
      payload: ICreateTokenReq
    ): Promise<AxiosResponse<BeSuccessResponse<ICreateTokenRes>>> => {
      return postFormDataAPI(API_PATH.TOKEN.CREATE_TOKEN, payload);
    },
    onError: (err) => {
      error({ message: "Create Failed" });
    },
    mutationKey: ["create-token"],
  });
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [coinType, setCoinType] = useState(ECoinType.StableCoin);

  const uploadImage = useWatch(FIELD_NAMES.LOGO_UPLOAD, form);
  const initialBuyAmount = useWatch(AMOUNT_FIELD_NAME, amountForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const usdtShouldPay =
  //   coinType === ECoinType.MemeCoin && initialBuyAmount
  //     ? calculateUsdtShouldPay(initialBuyAmount)
  //     : "";

  // const tokenWillReceive =
  //   coinType === ECoinType.StableCoin && initialBuyAmount
  //     ? calculateTokenReceive(initialBuyAmount)
  //     : "";

  const tokenWillReceive = useMemo(() => {
    if (coinType === ECoinType.StableCoin && initialBuyAmount) {
      const calculatedTokenWillReceive =
        calculateTokenReceive(initialBuyAmount);

      const maxTokenWillReceive = calculateTokenReceive(
        ETH_THRESHOLD_WITH_FEE.toString()
      );

      return BigNumber(initialBuyAmount).gt(ETH_THRESHOLD_WITH_FEE)
        ? maxTokenWillReceive
        : calculatedTokenWillReceive;
    }
    return "";
  }, [coinType, initialBuyAmount]);

  const usdtShouldPay = useMemo(() => {
    if (coinType === ECoinType.MemeCoin && initialBuyAmount) {
      const calculatedUsdtShouldPay = calculateUsdtShouldPay(initialBuyAmount);
      return BigNumber(calculatedUsdtShouldPay).lt(0) ||
        !BigNumber(calculatedUsdtShouldPay).isFinite()
        ? ETH_THRESHOLD_WITH_FEE.toString()
        : calculatedUsdtShouldPay;
    }
    return "";
  }, [coinType, initialBuyAmount]);

  const buyAmount =
    coinType === ECoinType.MemeCoin
      ? BigNumber(usdtShouldPay).toFixed(
          TOKEN_DECIMAL_PLACE,
          BigNumber.ROUND_DOWN
        )
      : initialBuyAmount;

  const tokenFactoryContract = useContract(
    pumpContractABI,
    envs.TOKEN_FACTORY_ADDRESS || ""
  );

  const coinTickerValue = useWatch(FIELD_NAMES.COIN_TICKER, form);

  const USDTContract = useContract(erc20Abi, envs.USDT_ADDRESS);

  const handleUploadFiles = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadImageRes = await uploadImages(formData);
    return uploadImageRes.data;
  };

  const handleCreateTokenSuccess = (
    tokenId?: string,
    isMint: boolean = true,
    isWithoutBuy: boolean = false
  ) => {
    form.resetFields();
    setIsOpenInitialBuyModal(false);
    router.push(PATH_ROUTER.TOKEN_DETAIL(tokenId || tokenCreatedId));
    if (isMint) {
      success({
        message: "Initial buy transaction completed. Token created succesfully",
        key: "1",
      });
    } else {
      if (isWithoutBuy) {
        success({
          message: "Token created succesfully",
          key: "2",
        });
      } else {
        success({
          message: "Initial buy transaction denied. Token created succesfully",
          key: "3",
        });
      }
    }
  };

  const handleApprove = async () => {
    const contract = await USDTContract;
    setLoadingStatus((prev) => ({ ...prev, approve: true }));
    try {
      const txn = await contract?.approve(
        envs.TOKEN_FACTORY_ADDRESS,
        BigNumber(buyAmount).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed()
      );

      await txn?.wait();
      await handleCreateTokenSC(tokenCreatedIdx);

      setLoadingStatus((prev) => ({ ...prev, approve: false }));
    } catch (e: any) {
      console.log({ e });
      handleCreateTokenSuccess(undefined, false);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, approve: false }));
    }
  };

  const handleCreateTokenSC = async (idx: string, tokenId?: string) => {
    const values = form.getFieldsValue();
    try {
      const contract = await tokenFactoryContract;

      console.log(
        "create params",
        values[FIELD_NAMES.COIN_TICKER],
        values[FIELD_NAMES.COIN_NAME],
        BigNumber(buyAmount).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(),
        0,
        address,
        idx,
        address
      );

      const tx = await contract?.buyAndCreateToken(
        values[FIELD_NAMES.COIN_TICKER],
        values[FIELD_NAMES.COIN_NAME],
        0,
        address,
        idx,
        address,
        {
          value: ethers.parseUnits(buyAmount, "ether"),
        }
      );

      await tx.wait();
      handleCreateTokenSuccess(tokenId);
    } catch (e: any) {
      console.log({ e });
      handleCreateTokenSuccess(tokenId, false);
    }
  };

  const handleCreateToken = async (withoutBuy: boolean = false) => {
    if (withoutBuy) {
      setLoadingStatus((prev) => ({ ...prev, createTokenWithoutBuy: true }));
    } else {
      setLoadingStatus((prev) => ({ ...prev, createToken: true }));
    }
    try {
      const values = form.getFieldsValue();
      const file = fileList[0]?.file || null;
      const uploadedFile = await handleUploadFiles(file);
      const res = await createToken({
        name: values[FIELD_NAMES.COIN_NAME],
        symbol: values[FIELD_NAMES.COIN_TICKER],
        description: values[FIELD_NAMES.DESCRIPTION],
        avatar: uploadedFile.data,
        website: values[FIELD_NAMES.WEBSITE],
        twitter: values[FIELD_NAMES.TWITTER],
        telegram: values[FIELD_NAMES.TELEGRAM],
        discord: values[FIELD_NAMES.DISCORD],
      });

      const createTokenDetail = get(res, "data.data");

      setTokenCreatedIdx(createTokenDetail.idx);
      setTokenCreatedId(createTokenDetail.id.toString());

      if (!initialBuyAmount || withoutBuy) {
        setIsOpenInitialBuyModal(false);
        handleCreateTokenSuccess(createTokenDetail.id.toString(), false, true);
        return;
      }

      // const isApproved = BigNumber(buyAmount).gt(allowance ?? "0");

      // if (isApproved) {
      //   setIsOpenApproveModal(true);
      //   return;
      // }

      await handleCreateTokenSC(
        createTokenDetail.idx,
        createTokenDetail?.id.toString()
      );
    } catch (e) {
      console.log({ e });
      error({ message: "Create token failed" });
    } finally {
      if (withoutBuy) {
        setLoadingStatus((prev) => ({ ...prev, createTokenWithoutBuy: false }));
      } else {
        setLoadingStatus((prev) => ({ ...prev, createToken: false }));
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = event.clipboardData.getData("text");
    if (pastedData.includes(" ")) {
      event.preventDefault();
    }
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    try {
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setFileList([
              {
                uid: "-1",
                name: file.name,
                status: "done",
                url: e.target.result,
                file,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      error(error.message);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    try {
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setFileList([
              {
                uid: "-1",
                name: file.name,
                status: "done",
                url: e.target.result,
                file,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      error(error.message);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setFileList([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (fileList[0]?.file) {
      form.validateFields([FIELD_NAMES.LOGO_UPLOAD]);
    }
  }, [fileList]);

  return (
    <div className="create-token-page w-full mr-auto ml-auto">
      {!isDesktop ? (
        <div className="text-20px-bold mb-4 text-white-neutral">
          Create A New Token
        </div>
      ) : null}

      <Form<CreateTokenFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          [FIELD_NAMES.COIN_NAME]: "",
          [FIELD_NAMES.COIN_TICKER]: "",
          [FIELD_NAMES.DESCRIPTION]: "",
        }}
      >
        <h5 className="text-16px-bold md:text-22px-bold mb-4 text-primary-main">
          Token Information
        </h5>
        <div className="rounded-[24px] bg-neutral-2 backdrop-blur-[75px] md:p-6 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:gap-6 gap-0">
            <Form.Item
              name={FIELD_NAMES.COIN_NAME}
              required={false}
              label={<FormItemLabel label="Token name" isRequired />}
              className="w-full md:flex-1"
              rules={[
                {
                  required: true,
                  message: "Token name is required",
                },
              ]}
            >
              <AppInput placeholder="Enter token name" maxLength={30} />
            </Form.Item>
            <Form.Item
              name={FIELD_NAMES.COIN_TICKER}
              required={false}
              label={<FormItemLabel label="Token ticker" isRequired />}
              className="w-full md:flex-1"
              rules={[
                {
                  required: true,
                  message: "Token ticker is required",
                },
              ]}
              normalize={(value) => value.replace(/\s/g, "").toUpperCase()}
            >
              <AppInput
                placeholder="Enter token ticker"
                maxLength={10}
                onPaste={handlePaste}
              />
            </Form.Item>
          </div>
          <Form.Item
            name={FIELD_NAMES.DESCRIPTION}
            required={false}
            label={<FormItemLabel label="Description" />}
          >
            <AppInput.TextArea
              rows={3}
              placeholder="Enter token description"
              maxLength={1200}
            />
          </Form.Item>
          <Form.Item
            name={FIELD_NAMES.LOGO_UPLOAD}
            label={<FormItemLabel label="Icon" isRequired />}
            className="mb-0"
            rules={[
              {
                validator: () => {
                  const file = fileList[0]?.file || null;
                  return TokenImageValidator(file);
                },
              },
            ]}
          >
            {/* <AppUpload accept={ACCEPT_IMAGE_EXTENSION} variant="secondary" /> */}
            <div
              className="flex justify-center items-center gap-8 p-5 min-w-full  md:min-w-[200px] rounded-lg border-neutral-500 w-fit bg-transparent custom-border"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                style={{ display: "none" }}
                accept={ACCEPT_IMAGE_EXTENSION}
              />
              <div className="flex items-center gap-2 md:gap-8 md:flex-row flex-col">
                <Image src={UploadIcon} alt="upload icon" />
                <div className="flex items-center justify-between  flex-col">
                  <div className="text-white-neutral text-[14px]">
                    Drag And Drop A File
                  </div>
                  <div className="text-[#7A7F86] text-12px-medium">
                    Max size - 5Mb. Jpg, Jpeg, Png, Jfif, Gif
                  </div>
                </div>
                <AppButton
                  customClass="!w-[150px]"
                  typeButton="outline-primary"
                >
                  Upload File
                </AppButton>
              </div>
            </div>
          </Form.Item>
          {fileList[0]?.file ? (
            <div className="px-2 py-1.5 bg-neutral-3 rounded-[8px] flex justify-between items-center w-full md:w-[460px] mt-2">
              <div className="flex gap-3 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileList[0]?.url?.toString()}
                  className="rounded-[10px] object-cover min-w-9 w-9 h-9"
                  alt="image upload"
                />
                <div className="flex flex-col gap-1">
                  <div
                    className="text-14px-normal text-neutral-9"
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    {fileList[0]?.file?.name}
                  </div>
                  <div className="text-12px-normal text-neutral-7">
                    {formatBytes(fileList[0]?.file.size as number)}
                  </div>
                </div>
              </div>
              <Image
                src={CloseIcon}
                height={20}
                width={20}
                alt="close icon"
                onClick={removeImage}
                className="cursor-pointer"
              />
            </div>
          ) : null}
        </div>

        <h5 className="text-primary-main text-16px-bold md:text-22px-bold mt-4 mb-4">
          Links
        </h5>
        <div className="rounded-[24px] bg-neutral-2 backdrop-blur-[75px] md:p-6 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:gap-6 gap-0">
            <Form.Item
              name={FIELD_NAMES.WEBSITE}
              label={<FormItemLabel label="Website" />}
              className="w-full md:flex-1"
              rules={[
                {
                  validator: urlValidator,
                },
              ]}
            >
              <AppInput placeholder="Website URL" />
            </Form.Item>
            <Form.Item
              name={FIELD_NAMES.TWITTER}
              label={<FormItemLabel label="Twitter" />}
              className="w-full md:flex-1"
              rules={[
                {
                  validator: urlValidator,
                },
              ]}
            >
              <AppInput placeholder="Twitter URL" />
            </Form.Item>
          </div>
          <div className="flex flex-col md:flex-row md:gap-6 gap-0">
            <Form.Item
              name={FIELD_NAMES.TELEGRAM}
              label={<FormItemLabel label="Telegram" />}
              className="w-full md:flex-1"
              rules={[
                {
                  validator: urlValidator,
                },
              ]}
            >
              <AppInput placeholder="Telegram URL" />
            </Form.Item>
            <Form.Item
              name={FIELD_NAMES.DISCORD}
              label={<FormItemLabel label="Discord" />}
              className="w-full md:flex-1 md:mb-6 !mb-0"
              rules={[
                {
                  validator: urlValidator,
                },
              ]}
            >
              <AppInput placeholder="Discord URL" />
            </Form.Item>
          </div>
        </div>
        <div className="flex justify-end mb-9">
          {isAuthenticated ? (
            <AppButton
              onClick={async () => {
                await form.validateFields();
                const errors = form.getFieldsError();
                const hasErrors = errors.some(
                  (error) => error.errors.length > 0
                );

                if (!hasErrors) {
                  setIsOpenInitialBuyModal(true);
                }
              }}
              customClass="md:!w-fit !w-full"
            >
              Create Token
            </AppButton>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </Form>
      <InitialBuyModal
        onCancel={() => {
          setIsOpenInitialBuyModal(false);
        }}
        onSkip={() => {
          handleCreateToken(true);
        }}
        form={amountForm}
        onOk={() => handleCreateToken(false)}
        open={isOpenInitialBuyModal}
        createLoading={loadingStatus.createToken || loadingStatus.approve}
        skipLoading={loadingStatus.createTokenWithoutBuy}
        initialBuyAmount={initialBuyAmount}
        tokenSymbol={coinTickerValue}
        usdtShouldPay={buyAmount}
        tokenWillReceive={tokenWillReceive}
        coinType={coinType}
        setCoinType={setCoinType}
        tokenImage={fileList[0]?.url?.toString()}
      />
      <ConfirmModal
        title="You need to approve your tokens in order to make transaction"
        onOkText="Approve"
        open={isOpenApproveModal}
        loading={loadingStatus.approve || loadingStatus.createToken}
        onOk={handleApprove}
        onCancel={() => {
          setIsOpenApproveModal(false);
          handleCreateTokenSuccess(undefined, false);
        }}
      />
    </div>
  );
};

export default CreateTokenPage;
