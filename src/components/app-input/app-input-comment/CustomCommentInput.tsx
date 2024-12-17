import { checkValidUploadFileType } from "@/helpers/upload";
import { message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ChangeEvent, forwardRef, useRef, useState } from "react";
import Image from "next/image";
import { CloseIcon, LinkHorizontalIcon } from "@public/assets";
import AppRoundedInfo from "@/components/app-rounded-info";
import { FileItem } from ".";
import { ACCEPT_IMAGE_EXTENSION } from "@/constant";

interface Props {
  showCancelButton: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onChange?: (value: any) => void;
  onFileListChange?: (values: FileItem[]) => void;
  fileList: FileItem[];
  ref?: any;
  isDisabledPostButton?: boolean;
}

const validateFile = (file: any) => {
  if (Number(file.size) > 5000000 && file.type.includes("image")) {
    throw new Error("Uploaded files should not exceed 5MB");
  } else if (!checkValidUploadFileType(file)) {
    throw new Error("Please upload PNG, JPG, JPEG, JFIF, GIF only");
  }
};

const CustomCommentInput = forwardRef<HTMLAreaElement, Props>(function (
  {
    showCancelButton,
    onCancel,
    onSubmit,
    onChange,
    onFileListChange,
    fileList,
    isDisabledPostButton,
  },
  fileTextAreaRef
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canUpload, setCanUpload] = useState(true);

  const triggerFileInput = () => {
    if (fileInputRef.current && canUpload) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!canUpload) return;

    const files = e.target.files;

    try {
      if (files && files.length > 0) {
        validateFile(files[0]);

        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            onFileListChange?.([
              {
                uid: "-1",
                name: file.name,
                status: "done",
                url: e.target.result,
                file,
              },
            ]);
            setCanUpload(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const removeImage = () => {
    onFileListChange?.([]);
    setCanUpload(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="app-input-comment border border-neutral-5 rounded-[8px] p-3">
      <TextArea
        ref={fileTextAreaRef}
        rows={1}
        placeholder="Describe..."
        className="comment-textarea border-none focus:!outline-none focus-within:!shadow-none focus:!shadow-none !bg-transparent !text-neutral-9 !resize-none !placeholder-neutral-5"
        maxLength={1200}
        onChange={onChange}
        showCount={{
          formatter: (value) => (
            <div className="text-neutral-5">
              {value?.count}/{value?.maxLength}
            </div>
          ),
        }}
        autoSize={{ minRows: 1, maxRows: 6 }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;
          if (
            value.length >= 1200 &&
            e.key !== "Backspace" &&
            e.key !== "Delete"
          ) {
            e.preventDefault();
          }
        }}
      />
      <div className="upload-section flex items-end justify-between mt-2">
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
            accept={ACCEPT_IMAGE_EXTENSION}
          />
          {fileList.length > 0 && fileList[0].url && (
            <div className="uploaded-image relative">
              <Image
                src={fileList[0].url.toString()}
                alt="Uploaded"
                width={80}
                height={80}
                className="max-h-[80px] object-cover"
              />
              <Image
                src={CloseIcon}
                alt="Xóa"
                onClick={removeImage}
                className="absolute top-0 right-0 cursor-pointer"
                width={20}
                height={20}
                style={{ color: "#777E90" }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Image
            src={LinkHorizontalIcon}
            alt="image"
            onClick={triggerFileInput}
            className={`upload-icon cursor-pointer ${
              !canUpload ? "opacity-50" : ""
            }`}
          />
          {showCancelButton && (
            <AppRoundedInfo
              text="Cancel"
              onClick={onCancel}
              customClassName="w-fit cursor-pointer"
            />
          )}
          <AppRoundedInfo
            text="Post"
            onClick={() => onSubmit()}
            customClassName="w-fit cursor-pointer"
            disabled={isDisabledPostButton}
          />
        </div>
      </div>
    </div>
  );
});

export default CustomCommentInput;
