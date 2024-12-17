import { API_PATH } from "@/constant/api-path";
import { PATH_ROUTER } from "@/constant/router";
import { setStorageRefreshToken } from "@/helpers/storage";
import { useAppDispatch, useAppSelector } from "@/libs/hooks";
import { clearUser, setUser } from "@/libs/slices/userSlice";
import { postAPI } from "@/service";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { UserRejectedRequestError } from "viem";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

type TConnectWallet = {
  signature: string;
  address: string;
};

const useWalletAuth = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.user.accessToken);
  const { chainId, address: userAddress, isConnected } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { signMessageAsync, isPending: isSignMessageLoading } =
    useSignMessage();
  const { mutateAsync: connectWalletAPI, isPending: isSignInLoading } =
    useMutation({
      mutationFn: (data: TConnectWallet) => {
        return postAPI(API_PATH.AUTH.CONNECT_WALLET, data);
      },
    });

  const logout = () => {
    dispatch(clearUser());
    disconnectWallet();
    if (pathname && pathname.includes("my-profile")) {
      router.push(PATH_ROUTER.DASHBOARD);
    }
  };

  const login = async (onSuccess?: () => void, onError?: () => void) => {
    try {
      const signature = await signMessageAsync({
        message: process.env.NEXT_PUBLIC_SIGN_MESSAGE as string,
      });

      if (userAddress && signature) {
        const res = await connectWalletAPI({
          signature,
          address: userAddress,
        });
        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          userId,
        } = res?.data?.data || {};

        dispatch(
          setUser({ accessToken, refreshToken, address: userAddress, userId })
        );
        setStorageRefreshToken(refreshToken);
      }

      onSuccess?.();
    } catch (error) {
      if (error instanceof UserRejectedRequestError) {
        onError?.();
      }
    }
  };

  return {
    chainId,
    userAddress,
    isConnected,
    disconnectWallet,
    login,
    logout,
    accessToken,
    isLoginLoading: isSignInLoading || isSignMessageLoading,
  };
};

export default useWalletAuth;
