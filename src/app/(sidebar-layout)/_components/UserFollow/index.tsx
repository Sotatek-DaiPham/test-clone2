import AppButton from "@/components/app-button";
import AppImage from "@/components/app-image";
import { PATH_ROUTER } from "@/constant/router";
import { IFollowerResponse } from "@/entities/my-profile";
import { formatAmount } from "@/helpers/formatNumber";
import useWalletAuth from "@/hooks/useWalletAuth";
import useWindowSize from "@/hooks/useWindowSize";
import { ImageDefaultIcon } from "@public/assets";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { EFollow } from "../Tabs/MyProfileTab";

interface IUserFollow {
  data: IFollowerResponse;
  onFollow: (data: any) => void;
}
const UserFollow = ({ data, onFollow }: IUserFollow) => {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { accessToken } = useWalletAuth();
  const { address: userAddress } = useAccount();
  const { isMobile } = useWindowSize();
  return (
    <div
      className="flex flex-col w-full bg-neutral-2 rounded-3xl p-6 cursor-pointer"
      onClick={() =>
        router.push(PATH_ROUTER.USER_PROFILE(data?.wallet_address))
      }
    >
      <div className="w-full flex flex-row">
        <div className="w-[50px] !min-w-[50px]">
          {data?.avatar ? (
            <AppImage
              className="!bg-neutral-4 !w-[50px] !min-w-[50px] !h-[50px] rounded-xl overflow-hidden flex [&>img]:!object-cover"
              alt="logo"
              src={data?.avatar}
            />
          ) : (
            <div className="border border-white-neutral !min-w-[50px] !w-[50px] !h-[50px] rounded-xl overflow-hidden">
              <Image
                className="flex bg-primary-7 [&>img]:!object-cover"
                alt="logo"
                src={ImageDefaultIcon}
              />
            </div>
          )}
        </div>
        <div className="grow mx-4">
          <span className="text-16px-medium text-white-neutral truncate-1-line">
            {data?.username || "-"}
          </span>
          <div className="text-neutral-7 text-14px-normal my-1">
            Follower
            {Number(data?.numberFollower) > 1 ? "s" : ""}
            <span className="ml-2 text-neutral-9">
              {formatAmount(data?.numberFollower || "0")}
            </span>
          </div>
          {!isMobile && (
            <div className="truncate-2-line text-neutral-7 mt-1">
              {data?.bio}
            </div>
          )}
        </div>
        <div className="w-[100px] flex justify-center">
          {userAddress !== data?.wallet_address && accessToken && (
            <AppButton
              size="small"
              typeButton={
                accessToken && data?.isFollowing ? "secondary" : "primary"
              }
              customClass="!w-[100px] !rounded-full"
              onClick={
                !!accessToken
                  ? (e) => {
                      e.stopPropagation();
                      onFollow({
                        id: data?.id,
                        payload: {
                          isFollow: data?.isFollowing
                            ? EFollow.UN_FOLLOW
                            : EFollow.FOLLOW,
                        },
                      });
                    }
                  : openConnectModal
              }
            >
              {accessToken && data?.isFollowing ? "Unfollow" : "Follow"}
            </AppButton>
          )}
        </div>
      </div>
      {isMobile && (
        <div className="truncate-2-line text-neutral-7 mt-1">{data?.bio}</div>
      )}
    </div>
  );
};

export default UserFollow;
