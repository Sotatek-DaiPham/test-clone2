import { formatBytes } from "@/helpers/formatNumber";
import { CloseCircleOutlined } from "@ant-design/icons";
import { CloseIcon, UploadIcon } from "@public/assets";
import Upload, { UploadChangeParam, UploadFile } from "antd/es/upload";
import Image from "next/image";
import AppButton from "../app-button";
import "./styles.scss";

export interface AppUploadProps {
  onChange?: (values: { src?: string; file?: File }) => void;
  value?: { src?: string; file?: File };
  accept?: string;
  disabled?: boolean;
  isShowSuggest?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const AppUpload = (props: AppUploadProps) => {
  const { isShowSuggest = true, className, variant = "primary" } = props;
  const handleChange = (value: UploadChangeParam<UploadFile<any>>) => {
    const file = value.file;
    const fileUrl = URL.createObjectURL(file.originFileObj as File);

    props?.onChange?.({
      file: file.originFileObj as File,
      src: fileUrl,
    });
  };

  const handleRemoveImage = (e: any) => {
    e.stopPropagation();
    props?.onChange?.({
      file: undefined,
      src: undefined,
    });
  };

  return (
    <>
      <Upload
        className={`basic-upload ${className ?? ""}`}
        multiple={false}
        showUploadList={false}
        onChange={handleChange}
        accept={props.accept}
        disabled={props?.disabled}
      >
        {props.value?.src && variant === "primary" ? (
          <div
            className="basic-upload__image-box"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props?.value?.src} alt="image upload" />
            {!props?.disabled ? (
              <div onClick={handleRemoveImage} className="basic-upload__remove">
                <CloseCircleOutlined className="text-white-neutral" />
              </div>
            ) : null}
          </div>
        ) : (
          isShowSuggest && (
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
            </div>
          )
        )}
        <AppButton customClass="!w-[150px]" typeButton="outline-primary">
          Upload File
        </AppButton>
      </Upload>
      {props.value?.src && variant === "secondary" ? (
        <div className="px-2 py-1.5 bg-neutral-3 rounded-[8px] flex justify-between items-center w-full md:w-[460px] mt-2">
          <div className="flex gap-3 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={props?.value?.src}
              className="rounded-[10px] object-cover w-9 h-9"
              alt="image upload"
            />
            <div className="flex flex-col gap-1">
              <div
                className="text-14px-normal text-neutral-9"
                style={{
                  wordBreak: "break-word",
                }}
              >
                {props.value?.file?.name}
              </div>
              <div className="text-12px-normal text-neutral-7">
                {formatBytes(props.value?.file?.size as number)}
              </div>
            </div>
          </div>
          <Image
            src={CloseIcon}
            height={20}
            width={20}
            alt="close icon"
            onClick={handleRemoveImage}
            className="cursor-pointer"
          />
        </div>
      ) : null}
    </>
  );
};

export default AppUpload;
