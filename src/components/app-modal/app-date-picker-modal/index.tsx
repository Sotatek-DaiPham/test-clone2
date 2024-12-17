import AppButton from "@/components/app-button";
import { DATE_TIME_FORMAT } from "@/constant/format";
import { DatePicker, Flex, Form, ModalProps } from "antd";
import { FormInstance } from "antd/lib";
import dayjs from "dayjs";
import AppModal from "..";
import "./styles.scss";
import { Dispatch, SetStateAction } from "react";

interface IDatePickerModal extends ModalProps {
  title?: string;
  onOk?: () => void;
  icon?: string;
  onOkText?: string;
  form: FormInstance<{
    startDate: string;
    endDate: string;
  }>;
  setSearchParams: Dispatch<
    SetStateAction<{
      page: number;
      action: string;
      startDate: string;
      endDate: string;
    }>
  >;
}

const generateStartTimeValidator = ({ getFieldValue }: any) => ({
  validator(_: any, value: string) {
    const endTime = getFieldValue("endDate");
    if (endTime && value && dayjs(endTime).diff(value) <= 0) {
      return Promise.reject("Invalid time");
    }

    return Promise.resolve();
  },
});

const generateEndTimeValidator = ({ getFieldValue }: any) => ({
  validator(_: any, value: string) {
    const startTime = getFieldValue("startDate");

    if (startTime && value && dayjs(startTime).diff(value) >= 0) {
      return Promise.reject("Invalid time");
    }
    return Promise.resolve();
  },
});

const DatePickerModal = ({
  title,
  icon,
  onOkText,
  onOk,
  loading,
  form,
  setSearchParams,
  ...props
}: IDatePickerModal) => {
  return (
    <AppModal
      className="date-picker-modal"
      width={343}
      footer={false}
      centered={false}
      {...props}
    >
      <Flex vertical justify="space-between" gap={24}>
        <div className="text-white-neutral text-2xl font-bold leading-8 tracking-tight">
          {title || "Filter By Date"}
        </div>
        <Form
          form={form}
          onValuesChange={(_, values) => {}}
          onFinish={(values) => {
            setSearchParams((prev) => ({
              ...prev,
              endDate: values.endDate
                ? dayjs(values.endDate)?.toISOString()
                : "",
              startDate: values.startDate
                ? dayjs(values.startDate)?.toISOString()
                : "",
            }));
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-stretch rounded-[8px] border border-neutral-4 h-9">
              <div className="text-16px-normal text-neutral-9 px-3 min-w-[62.5px] border-r-neutral-4 border-r flex items-center">
                From
              </div>
              <Form.Item
                name="startDate"
                rules={[generateStartTimeValidator]}
                dependencies={["endDate"]}
              >
                <DatePicker
                  format={DATE_TIME_FORMAT}
                  showTime
                  placeholder="dd/mm/yyyy hh:mm"
                />
              </Form.Item>
            </div>
            <div className="flex items-stretch rounded-[8px] border border-neutral-4 h-9">
              <div className="text-16px-normal text-neutral-9 px-3 min-w-[62.5px] border-r-neutral-4 border-r flex items-center">
                To
              </div>
              <Form.Item
                name="endDate"
                rules={[generateEndTimeValidator]}
                dependencies={["startDate"]}
              >
                <DatePicker
                  format={DATE_TIME_FORMAT}
                  showTime
                  placeholder="dd/mm/yyyy hh:mm"
                />
              </Form.Item>
            </div>
          </div>
        </Form>

        <div className="flex w-full  md:gap-5 gap-[10px]">
          <AppButton
            typeButton="secondary"
            customClass="w-1/2"
            onClick={() => {
              form.resetFields();
              // setSearchParams((prev) => ({
              //   ...prev,
              //   endDate: "",
              //   startDate: "",
              // }));
            }}
          >
            Clear
          </AppButton>
          <AppButton
            customClass="w-1/2"
            loading={loading}
            onClick={(e: any) => {
              form.submit();
              props?.onCancel?.(e);
            }}
          >
            {onOkText || "Apply"}
          </AppButton>
        </div>
      </Flex>
    </AppModal>
  );
};

export default DatePickerModal;
