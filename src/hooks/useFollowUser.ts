import { API_PATH } from "@/constant/api-path";
import { postAPI } from "@/service";
import { useMutation } from "@tanstack/react-query";

const useFollowUser = ({
  onFollowSuccess,
  onFollowFailed,
}: {
  onFollowSuccess: () => void;
  onFollowFailed: (error: string) => void;
}) => {
  const { mutate: onFollow, isPending: isLoading } = useMutation({
    mutationFn: async (data: any) => {
      return await postAPI(
        API_PATH.USER.FOLLOW_USER(data?.id?.toString()),
        data?.payload
      );
    },

    onSuccess(...params) {
      onFollowSuccess();
    },
    onError(error: any) {
      onFollowFailed(error);
    },
  });

  return {
    onFollow,
    isLoading,
  };
};

export default useFollowUser;
