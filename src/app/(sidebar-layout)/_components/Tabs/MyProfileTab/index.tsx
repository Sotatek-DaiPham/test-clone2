"use client";
import AppButton from "@/components/app-button";
import AppDivider from "@/components/app-divider";
import AppImage from "@/components/app-image";
import { MyProfileResponse } from "@/entities/my-profile";
import { BeSuccessResponse } from "@/entities/response";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import useFollowUser from "@/hooks/useFollowUser";
import useWalletAuth from "@/hooks/useWalletAuth";
import { NotificationContext } from "@/libs/antd/NotificationProvider";
import { useAppSelector } from "@/libs/hooks";
import { getAPI } from "@/service";
import { ArrowExport, EditIcon, ImageDefaultIcon } from "@public/assets";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import get from "lodash/get";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useLayoutEffect, useState } from "react";
import TabTitle from "../../TabTitle";
import EditProfileModal from "./EditProfileModal";

export enum EFollow {
  FOLLOW = "FOLLOW",
  UN_FOLLOW = "UN_FOLLOW",
}

const SCAN = process.env.NEXT_PUBLIC_ARBITRUM_SCAN_URL;

const MyProfileTab = ({ apiPath }: { apiPath: string }) => {
  const { error, success } = useContext(NotificationContext);
  const { openConnectModal } = useConnectModal();
  const { id } = useParams();
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const { searchParams } = useAppSearchParams("myProfile");
  const { userId } = useAppSelector((state) => state.user);
  const [followData, setFollowData] = useState<any>({});
  const { accessToken } = useWalletAuth();

  const { data, refetch } = useQuery({
    queryKey: ["my-profile", searchParams, userId, apiPath],
    queryFn: async () => {
      return getAPI(apiPath, {
        params: {
          currentUserId: userId || null,
        },
      }) as Promise<AxiosResponse<BeSuccessResponse<MyProfileResponse>, any>>;
    },
    enabled: !searchParams.tab ? true : searchParams.tab === "my-profile",
  });

  useLayoutEffect(() => {
    if (searchParams.tab === "my-profile") {
      refetch();
    }
  }, [accessToken, userId]);

  const myProfile = get(data, "data.data", {}) as MyProfileResponse;

  const { onFollow } = useFollowUser({
    onFollowSuccess: () => {
      success({
        message: `${
          followData?.isFollowing === EFollow.FOLLOW ? "Follow" : "Unfollow"
        } successfully`,
      });
      refetch();
    },
    onFollowFailed: (message: string) => {
      console.log("message", message);
      error({
        message: `${
          followData?.isFollowing === EFollow.FOLLOW ? "Follow" : "Unfollow"
        } failed`,
      });
    },
  });

  const handleFollow = () => {
    onFollow({
      id: myProfile?.id,
      payload: {
        isFollow: myProfile?.isFollowing ? EFollow.UN_FOLLOW : EFollow.FOLLOW,
      },
    });
    setFollowData({
      isFollowing: myProfile?.isFollowing ? EFollow.UN_FOLLOW : EFollow.FOLLOW,
    });
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex flex-row items-center justify-between">
        <TabTitle title="My Profile" />
        {id ? (
          <>
            {accessToken && (
              <AppButton
                size="small"
                typeButton={
                  accessToken && myProfile?.isFollowing
                    ? "secondary"
                    : "primary"
                }
                customClass="!w-[100px] !rounded-full"
                onClick={!!accessToken ? handleFollow : openConnectModal}
              >
                {accessToken && myProfile?.isFollowing ? "Unfollow" : "Follow"}
              </AppButton>
            )}
          </>
        ) : (
          <AppButton
            size="small"
            rootClassName="!w-fit"
            typeButton="secondary"
            onClick={() => setShowEdit(true)}
            classChildren="!flex !flex-row !items-center"
          >
            <Image src={EditIcon} alt="edit-profile" />
            <span className="ml-2">Edit</span>
          </AppButton>
        )}
      </div>
      <div className="flex sm:flex-row flex-col gap-6 bg-neutral-2 rounded-3xl p-6">
        <div className="flex justify-center">
          {myProfile?.avatar ? (
            <AppImage
              className="!bg-neutral-4 w-[130px] h-[130px] rounded-full overflow-hidden flex [&>img]:!object-cover"
              src={myProfile?.avatar}
              alt="logo"
            />
          ) : (
            <div className="!w-[130px] !h-[130px] !rounded-full overflow-hidden">
              <Image
                className="!bg-neutral-4 [&>img]:!object-cover"
                alt="logo"
                src={ImageDefaultIcon}
              />
            </div>
          )}
        </div>
        <div className="w-full text-14px-normal">
          <div className="grid grid-cols-6 mb-4">
            <span className="sm:col-span-1 col-span-2 text-neutral-7">
              Wallet Address
            </span>
            <div className="sm:col-span-5 col-span-4 flex flex-row">
              <span className="text-14px-medium text-white-neutral mr-2 break-all">
                {myProfile?.walletAddress}
              </span>
              <Image
                onClick={() =>
                  window.open(
                    `${SCAN}/address/${myProfile.walletAddress}`,
                    "_blank"
                  )
                }
                src={ArrowExport}
                alt="arrow-export"
                className="cursor-pointer"
              />
            </div>
          </div>
          <AppDivider />
          <div className="grid grid-cols-6 my-4">
            <span className="sm:col-span-1 col-span-2 text-neutral-7">
              User name
            </span>
            <span className="sm:col-span-5 col-span-4 text-14px-medium text-white-neutral">
              {myProfile?.username}
            </span>
          </div>
          <AppDivider />
          <div className="grid grid-cols-6 my-4">
            <span className="sm:col-span-1 col-span-2 text-neutral-7">Bio</span>
            <span className="sm:col-span-5 col-span-4 text-14px-medium text-white-neutral">
              {myProfile?.bio}
            </span>
          </div>
        </div>
      </div>
      <EditProfileModal
        data={{
          username: myProfile?.username,
          avatar: myProfile?.avatar,
          bio: myProfile?.bio,
        }}
        open={showEdit}
        onOk={() => {
          refetch();
          setShowEdit(false);
        }}
        onCancel={() => setShowEdit(false)}
        destroyOnClose={true}
      />
    </div>
  );
};

export default MyProfileTab;
