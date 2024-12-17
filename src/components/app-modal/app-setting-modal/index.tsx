import { useTradeSettings } from "@/app/(non-sidebar-layout)/token-detail/_components/TradeSection";
import {
  FormSetting,
  SETTINGS_FIELD_NAMES,
} from "@/app/(non-sidebar-layout)/token-detail/_components/TradeSection/TradeTab";
import AppAmountSelect from "@/components/app-amount-select";
import AppButton from "@/components/app-button";
import AppCheckbox from "@/components/app-checkbox";
import AppInputBalance from "@/components/app-input/app-input-balance";
import { PREDEFINE_PRIORITY_FEE, PREDEFINE_SLIPPAGE } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import { REGEX_INPUT_DECIMAL } from "@/constant/regex";
import { BeSuccessResponse } from "@/entities/response";
import { ISaveTradeSettingsReq } from "@/interfaces/token";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { postAPI } from "@/service";
import { EthIcon } from "@public/assets";
import { useMutation } from "@tanstack/react-query";
import { Form, FormInstance, ModalProps } from "antd";
import { useWatch } from "antd/es/form/Form";
import { AxiosResponse } from "axios";
import { useContext, useEffect } from "react";
import AppModal from "..";
import "./styles.scss";

interface ITradeSettingModal extends ModalProps {
  onOk: () => void;
  form: FormInstance<FormSetting>;
}

const TradeSettingModal = ({
  title,
  onOk,
  form,
  ...props
}: ITradeSettingModal) => {
  const { success } = useContext(NotificationContext);
  const fontRunningValue = useWatch(SETTINGS_FIELD_NAMES.FONT_RUNNING, form);
  const { tradeSettings, refetchTradeSettings } = useTradeSettings();

  const { mutateAsync: saveTradeSettings } = useMutation({
    mutationFn: (
      params: ISaveTradeSettingsReq
    ): Promise<AxiosResponse<BeSuccessResponse<any>>> => {
      return postAPI(API_PATH.USER.SAVE_TRADE_SETTINGS, {
        ...params,
      });
    },
    onError: (err) => {},
    onSuccess: () => {
      success({
        message: "Trade setting saved",
      });
      refetchTradeSettings();
    },
    mutationKey: ["save-trade-settings"],
  });

  const handleApplyTradeSetting = async (e: any) => {
    props?.onClose?.(e);
    const values = form.getFieldsValue();

    await saveTradeSettings({
      slippage: values[SETTINGS_FIELD_NAMES.SLIPPAGE] || "0",
      fontRunning: values[SETTINGS_FIELD_NAMES.FONT_RUNNING],
      priorityFee: values[SETTINGS_FIELD_NAMES.PRIORITY_FEE] || "0",
      ...(tradeSettings?.id ? { id: tradeSettings.id } : {}),
    });
  };

  useEffect(() => {
    form.setFieldsValue(tradeSettings);
  }, [tradeSettings, props.open]);

  return (
    <AppModal
      className="trade-setting-modal"
      width={500}
      footer={false}
      centered
      onCancel={(e) => {
        props.onClose?.(e);
        form.setFieldsValue(tradeSettings);
      }}
      {...props}
    >
      <Form form={form}>
        <div className="flex flex-col gap-4">
          <div className="text-20px-bold md:text-26px-bold text-white-neutral">
            Trade Settings
          </div>

          <div className="bg-neutral-1 p-6 rounded-[12px] flex flex-col gap-2">
            <label className="text-14px-medium text-neutral-7">
              Max Slippage
            </label>
            <Form.Item name={SETTINGS_FIELD_NAMES.SLIPPAGE} initialValue={0}>
              <AppInputBalance
                tokenSymbol=""
                label="Slippage (%)"
                regex={REGEX_INPUT_DECIMAL(0, 6)}
                maxValue={25}
                placeholder="Enter slippage amount"
              />
            </Form.Item>

            <AppAmountSelect
              numbers={PREDEFINE_SLIPPAGE}
              onSelect={(value) =>
                form.setFieldValue(
                  SETTINGS_FIELD_NAMES.SLIPPAGE,
                  value.toString()
                )
              }
            />
            <div className="text-14px-normal text-neutral-7">
              This is the maximum amount of slippage you are willing to accept
              when placing trades
            </div>
          </div>
          <div className="bg-neutral-1 p-6 rounded-[12px] flex items-start gap-2">
            <Form.Item
              name={SETTINGS_FIELD_NAMES.FONT_RUNNING}
              valuePropName="checked"
            >
              <AppCheckbox />
            </Form.Item>
            <div>
              <div className="text-16px-medium text-neutral-9">
                Front running protection
              </div>
              <div className="text-14px-normal text-neutral-7">
                Front-running protection prevents sandwich attacks on your
                swaps. With this feature enabled you can safely use high
                slippage.
              </div>
            </div>
          </div>
          {fontRunningValue ? (
            <div className="bg-neutral-1 p-6 rounded-[12px] flex flex-col gap-2">
              <label className="text-14px-medium text-neutral-7">
                Priority fee
              </label>
              <Form.Item
                name={SETTINGS_FIELD_NAMES.PRIORITY_FEE}
                initialValue={0}
              >
                <AppInputBalance
                  tokenImageSrc={EthIcon}
                  tokenSymbol="ETH"
                  regex={REGEX_INPUT_DECIMAL(0, 6)}
                  placeholder="Enter priority fee amount"
                />
              </Form.Item>
              <AppAmountSelect
                numbers={PREDEFINE_PRIORITY_FEE}
                customClass="[&>button]:!flex-none md:[&>button]:!flex-1"
                onSelect={(value) =>
                  form.setFieldValue(
                    SETTINGS_FIELD_NAMES.PRIORITY_FEE,
                    value.toString()
                  )
                }
              />
              <div className="text-14px-normal text-neutral-7">
                A higher priority fee will speed up the confirmation of your
                transactions.
              </div>
            </div>
          ) : null}

          <AppButton onClick={handleApplyTradeSetting}>Apply</AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default TradeSettingModal;
