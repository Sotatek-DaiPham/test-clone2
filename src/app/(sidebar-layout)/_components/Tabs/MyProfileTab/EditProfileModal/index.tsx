import AppButton from "@/components/app-button";
import FormItemLabel from "@/components/app-form-label";
import AppInput from "@/components/app-input";
import AppModal from "@/components/app-modal";
import AppUpload from "@/components/app-upload";
import { ACCEPT_IMAGE_EXTENSION } from "@/constant";
import { API_PATH } from "@/constant/api-path";
import {
  TUpdateProfilePayload,
  UpdateProfilePayload,
} from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { ImageLogoValidator } from "@/helpers/upload";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { postAPI, postFormDataAPI } from "@/service";
import { useMutation } from "@tanstack/react-query";
import { Flex, Form, ModalProps } from "antd";
import { AxiosResponse } from "axios";
import { useContext, useEffect } from "react";
import "./styles.scss";

interface IEditProfileModalProps extends ModalProps {
  data: any;
  open: boolean;
  onOk: () => void;
}
interface IUpdateProfileValues {
  avatar: string;
  username: string;
  bio: string;
}

const EditProfileModal = ({ data, onOk, ...props }: IEditProfileModalProps) => {
  const [form] = Form.useForm<IUpdateProfileValues>();
  const { error, success } = useContext(NotificationContext);
  const { mutateAsync: uploadImages, isPending: isUploading } = useMutation({
    mutationFn: (payload: FormData) => {
      return postFormDataAPI(API_PATH.UPLOAD_IMAGE, payload);
    },
    mutationKey: ["upload-images"],
    onError() {
      error({ message: "Upload image failed" });
    },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (
      payload: TUpdateProfilePayload
    ): Promise<AxiosResponse<BeSuccessResponse<any>>> => {
      return postAPI(API_PATH.USER.UPDATE_PROFILE, payload);
    },
    onSuccess() {
      onOk?.();
      success({
        message: "Update successfully",
      });
    },
    onError() {
      error({ message: "Update failed" });
    },
  });

  const handleUpdateProfile = async (values: UpdateProfilePayload) => {
    try {
      let uploadedFile: any = null;
      if (form.getFieldValue("avatar")?.file) {
        uploadedFile = await handleUploadFiles(
          form.getFieldValue("avatar")?.file
        );
      }
      await updateProfile({
        ...values,
        avatar:
          form.getFieldValue("avatar")?.src && uploadedFile
            ? uploadedFile?.data
            : form.getFieldValue("avatar")?.src && !uploadedFile
            ? data?.avatar
            : null,
      });
    } catch (error) {}
  };

  const handleUploadFiles = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadImageRes = await uploadImages(formData);
    return uploadImageRes.data;
  };

  useEffect(() => {
    form.setFieldsValue({
      username: data.username,
      bio: data.bio,
    });
    form.setFieldValue("avatar", { src: data?.avatar });
  }, [data]);

  return (
    <AppModal
      width={573}
      footer={false}
      className="p-6"
      title={false}
      centered
      {...props}
    >
      <span className="text-26px-bold text-white-neutral">Edit Profile</span>
      <Form
        form={form}
        onFinish={handleUpdateProfile}
        initialValues={{
          username: data?.username,
          bio: data?.bio,
          avatar: { src: data?.avatar },
        }}
        layout="vertical"
      >
        <div className="mt-6">
          <div className="bg-neutral-1 p-6 rounded-xl mb-4">
            <Flex className="flex-col md:flex-row">
              <Form.Item
                name="avatar"
                className="w-full md:flex-1"
                rules={[
                  {
                    validator: ImageLogoValidator,
                  },
                ]}
              >
                <AppUpload
                  isShowSuggest={false}
                  className="upload-avatar w-full"
                  accept={ACCEPT_IMAGE_EXTENSION}
                />
              </Form.Item>
            </Flex>
          </div>
          <div className="bg-neutral-1 p-6 rounded-xl">
            <Flex className="flex-col md:flex-row">
              <Form.Item
                name="username"
                required={false}
                className="w-full"
                label={
                  <FormItemLabel
                    label="Name"
                    className="text-16px-medium w-full"
                    isRequired
                  />
                }
                rules={[
                  {
                    required: true,
                    message: "Name is required",
                  },
                ]}
              >
                <AppInput maxLength={150} placeholder="Enter name" />
              </Form.Item>
            </Flex>
            <Flex className="flex-col md:flex-row w-full">
              <Form.Item
                className="w-full"
                name="bio"
                label={
                  <FormItemLabel
                    label="Bio"
                    className="text-16px-medium w-full"
                  />
                }
              >
                <AppInput.TextArea
                  maxLength={1200}
                  rows={5}
                  placeholder="Enter bio"
                />
              </Form.Item>
            </Flex>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <AppButton
            customClass="!rounded-full"
            htmlType="submit"
            loading={isPending}
          >
            Save
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default EditProfileModal;
