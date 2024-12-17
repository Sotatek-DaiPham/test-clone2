export const ImageValidator = (
  _: any,
  value: { src?: string; file?: File }
) => {
  if (!value?.src) {
    return Promise.reject("Icon is required");
  }

  if (value.file) {
    const mb = value.file.size / (1024 * 1024);
    if (mb > 5) {
      return Promise.reject("Upload image should not exceed 5mb");
    }

    if (!checkValidUploadFileType(value.file)) {
      return Promise.reject("Please upload PNG, JPG, JPEG, JFIF, GIF only");
    }
  }

  return Promise.resolve();
};

export const TokenImageValidator = (file: File) => {
  if (!file) {
    return Promise.reject("Icon is required");
  }

  if (file.size) {
    const mb = file.size / (1024 * 1024);
    if (mb > 5) {
      return Promise.reject("Upload image should not exceed 5mb");
    }

    if (!checkValidUploadFileType(file)) {
      return Promise.reject("Please upload PNG, JPG, JPEG, JFIF, GIF only");
    }
  }

  return Promise.resolve();
};

export const ImageLogoValidator = (
  _: any,
  value: { src?: string; file?: File }
) => {
  if (value.file) {
    const mb = value.file.size / (1024 * 1024);
    if (mb > 5) {
      return Promise.reject("Upload image should not exceed 5mb");
    }

    if (!checkValidUploadFileType(value.file)) {
      return Promise.reject("Please upload PNG, JPG, JPEG, JFIF, GIF only");
    }
  }

  return Promise.resolve();
};

export const checkValidUploadFileType = (file: File) => {
  return ALLOW_FILE_TYPE.includes(file.type);
};

export const ALLOW_FILE_TYPE = [
  "image/jpg",
  "image/png",
  "image/gif",
  "image/jpeg",
];

export const ALLOW_FILE_EXTENSION = ["png", "jpg", "gif"];

export const getFileExt = (fileName: string) => fileName.split(".").pop();
