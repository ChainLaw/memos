import { timestampDate } from "@bufbuild/protobuf/wkt";
import copy from "copy-to-clipboard";
import { BookmarkIcon, CopyIcon, Edit3Icon } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useNavigateTo from "@/hooks/useNavigateTo";
import i18n from "@/i18n";
import { Visibility } from "@/types/proto/api/v1/memo_service_pb";
import type { User } from "@/types/proto/api/v1/user_service_pb";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityToString } from "@/utils/memo";
import MemoActionMenu from "../../MemoActionMenu";
import { MemoTagPopover } from "../../MemoActionMenu/MemoTagPopover";
import UserAvatar from "../../UserAvatar";
import VisibilityIcon from "../../VisibilityIcon";
import { useMemoActions } from "../hooks";
import { useMemoViewContext, useMemoViewDerived } from "../MemoViewContext";
import type { MemoHeaderProps } from "../types";

const MemoHeader: React.FC<MemoHeaderProps> = ({ showCreator, showVisibility, showPinned }) => {
  const t = useTranslate();

  const { memo, creator, currentUser, parentPage, isArchived, readonly, openEditor } = useMemoViewContext();
  const { relativeTimeFormat } = useMemoViewDerived();

  const navigateTo = useNavigateTo();
  const handleGotoMemoDetailPage = useCallback(() => {
    navigateTo(`/${memo.name}`, { state: { from: parentPage } });
  }, [memo.name, parentPage, navigateTo]);

  const { unpinMemo } = useMemoActions(memo);

  const displayTime = isArchived ? (
    (memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toLocaleString(i18n.language)
  ) : (
    <relative-time
      datetime={(memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toISOString()}
      lang={i18n.language}
      format={relativeTimeFormat}
    ></relative-time>
  );

  return (
    <div className="w-full flex flex-row justify-between items-center gap-2">
      <div className="w-auto max-w-[calc(100%-8rem)] grow flex flex-row justify-start items-center">
        {showCreator && creator ? (
          <CreatorDisplay creator={creator} displayTime={displayTime} onGotoDetail={handleGotoMemoDetailPage} />
        ) : (
          <TimeDisplay displayTime={displayTime} onGotoDetail={handleGotoMemoDetailPage} />
        )}
      </div>

      <div className="flex flex-row justify-end items-center select-none shrink-0 gap-2">
        {/* Tag button (non-readonly, non-archived) */}
        {currentUser && !readonly && !isArchived && <MemoTagPopover memo={memo} />}

        {/* Copy content button (non-archived) */}
        {!isArchived && (
          <button
            type="button"
            className="h-7 w-7 flex justify-center items-center rounded-full cursor-pointer transition-all hover:opacity-80"
            onClick={() => {
              copy(memo.content);
              toast.success(t("message.succeed-copy-content"));
            }}
          >
            <CopyIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Edit button (non-readonly, non-archived) */}
        {currentUser && !readonly && !isArchived && (
          <button
            type="button"
            className="h-7 w-7 flex justify-center items-center rounded-full cursor-pointer transition-all hover:opacity-80"
            onClick={openEditor}
          >
            <Edit3Icon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {showVisibility && memo.visibility !== Visibility.PRIVATE && (
          <Tooltip>
            <TooltipTrigger>
              <span className="flex justify-center items-center rounded-md hover:opacity-80">
                <VisibilityIcon visibility={memo.visibility} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {t(`memo.visibility.${convertVisibilityToString(memo.visibility).toLowerCase()}` as Parameters<typeof t>[0])}
            </TooltipContent>
          </Tooltip>
        )}

        {showPinned && memo.pinned && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  <BookmarkIcon className="w-4 h-auto text-primary" onClick={unpinMemo} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("common.unpin")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <MemoActionMenu memo={memo} readonly={readonly} onEdit={openEditor} />
      </div>
    </div>
  );
};

interface CreatorDisplayProps {
  creator: User;
  displayTime: React.ReactNode;
  onGotoDetail: () => void;
}

const CreatorDisplay: React.FC<CreatorDisplayProps> = ({ creator, displayTime, onGotoDetail }) => (
  <div className="w-full flex flex-row justify-start items-center">
    <Link className="w-auto hover:opacity-80 rounded-md transition-colors" to={`/u/${encodeURIComponent(creator.username)}`} viewTransition>
      <UserAvatar className="mr-2 shrink-0" avatarUrl={creator.avatarUrl} />
    </Link>
    <div className="w-full flex flex-col justify-center items-start">
      <Link
        className="block leading-tight hover:opacity-80 rounded-md transition-colors truncate text-muted-foreground"
        to={`/u/${encodeURIComponent(creator.username)}`}
        viewTransition
      >
        {creator.displayName || creator.username}
      </Link>
      <button
        type="button"
        className="w-auto -mt-0.5 text-xs leading-tight text-muted-foreground select-none cursor-pointer hover:opacity-80 transition-colors text-left"
        onClick={onGotoDetail}
      >
        {displayTime}
      </button>
    </div>
  </div>
);

interface TimeDisplayProps {
  displayTime: React.ReactNode;
  onGotoDetail: () => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ displayTime, onGotoDetail }) => (
  <button
    type="button"
    className="w-full text-sm leading-tight text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors text-left"
    onClick={onGotoDetail}
  >
    {displayTime}
  </button>
);

export default MemoHeader;
