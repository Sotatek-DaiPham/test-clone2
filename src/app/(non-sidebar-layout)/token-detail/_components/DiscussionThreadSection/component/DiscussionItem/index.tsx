import AppImage from "@/components/app-image";
import { DEFAULT_AVATAR } from "@/constant";
import { PATH_ROUTER } from "@/constant/router";
import { DiscussionThreadItem, IReplyThreadItem } from "@/entities/my-profile";
import { ArrowTurnDownRightIcon } from "@public/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getTimeDDMMMYYYYHHMM } from "@/helpers/date-time";
import "./styles.scss";

interface DiscussionItemProps {
  data: DiscussionThreadItem;
  onShowReplies: (commentId: number, replyUserId: number) => void;
  selectedReplies: IReplyThreadItem[];
  isShowReplySection?: boolean;
  replyTo?: any;
}

const DiscussionItem: React.FC<DiscussionItemProps> = ({
  data,
  onShowReplies,
  selectedReplies,
  replyTo,
  isShowReplySection = false,
}) => {
  const router = useRouter();
  return (
    <div className="discussion-item flex flex-col gap-1 mb-6">
      <div className="px-6 py-4 rounded-2xl bg-neutral-2 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-auto">
            <AppImage
              className="!bg-neutral-4 w-[40px] h-[40px] rounded-full overflow-hidden flex"
              src={data.avatar || DEFAULT_AVATAR}
              alt="avatar"
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-neutral-9 text-16px-bold cursor-pointer hover:!underline truncate-1-line"
              onClick={() =>
                router.push(PATH_ROUTER.USER_PROFILE(data?.wallet_address))
              }
            >
              {data.username}
            </span>
            <span className="text-neutral-7 text-14px-medium">
              {getTimeDDMMMYYYYHHMM(data.created_at)}
            </span>
          </div>
        </div>
        <p className="text-neutral-9 text-14px-normal break-words">
          {data.content}
        </p>
        {data.image && (
          <AppImage
            className="comment-image rounded-[12px] overflow-hidden w-[80px] h-[80px] object-cover"
            src={data.image}
            preview={true}
          />
        )}
      </div>

      <div className="flex flex-col ml-6 gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            onShowReplies(data.comment_id, data.user_id);
          }}
        >
          <Image src={ArrowTurnDownRightIcon} alt="my-portfolio" />
          {data.mostRecentUserComments &&
            data.mostRecentUserComments.length > 0 && (
              <div className="flex mr-2 relative">
                {data.mostRecentUserComments
                  .slice(0, 2)
                  .map((comment, index) => (
                    <AppImage
                      // key={`User ${index + 1} 123asd`}
                      key={index}
                      className={`!bg-neutral-4 w-[18px] h-[18px] rounded-full overflow-hidden flex border-2 border-neutral-2 ${
                        index === 1 ? "absolute left-[14px]" : ""
                      }`}
                      src={comment.avatar || DEFAULT_AVATAR}
                      alt={`User ${index + 1}`}
                    />
                  ))}
              </div>
            )}

          <span
            className={`${
              (isShowReplySection && replyTo?.commentId === data.comment_id) ||
              selectedReplies.some(
                (reply) => Number(reply?.reply_id) === Number(data?.comment_id)
              )
                ? "text-primary-main"
                : "text-white"
            } text-14px-medium`}
          >{`Reply ${
            data?.number_replies && data?.number_replies > 0
              ? `${data?.number_replies}`
              : ""
          }`}</span>
        </div>
      </div>
    </div>
  );
};
export default DiscussionItem;
