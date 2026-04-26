import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BookmarkMinusIcon,
  BookmarkPlusIcon,
  LinkIcon,
  MoreVerticalIcon,
  SmilePlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useInstance } from "@/contexts/InstanceContext";
import { cn } from "@/lib/utils";
import { State } from "@/types/proto/api/v1/common_pb";
import { useTranslate } from "@/utils/i18n";
import { useReactionActions } from "../MemoReactionListView/hooks";
import { useMemoActionHandlers } from "./hooks";
import type { MemoActionMenuProps } from "./types";

const MemoActionMenu = (props: MemoActionMenuProps) => {
  const { memo, readonly } = props;
  const t = useTranslate();
  const currentUser = useCurrentUser();
  const { memoRelatedSetting } = useInstance();
  const { hasReacted, handleReactionClick } = useReactionActions({ memo });

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Derived state
  const isComment = Boolean(memo.parent);
  const isArchived = memo.state === State.ARCHIVED;

  // Action handlers
  const {
    handleTogglePinMemoBtnClick,
    handleToggleMemoStatusClick,
    handleCopyLink,
    handleDeleteMemoClick,
    confirmDeleteMemo,
  } = useMemoActionHandlers({
    memo,
    onEdit: props.onEdit,
    setDeleteDialogOpen,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-4">
          <MoreVerticalIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={2}>
        {/* Pin/Unpin (non-readonly, non-archived, non-comment) */}
        {!readonly && !isArchived && !isComment && (
          <DropdownMenuItem onClick={handleTogglePinMemoBtnClick}>
            {memo.pinned ? <BookmarkMinusIcon className="w-4 h-auto" /> : <BookmarkPlusIcon className="w-4 h-auto" />}
            {memo.pinned ? t("common.unpin") : t("common.pin")}
          </DropdownMenuItem>
        )}

        {/* Reaction submenu (logged-in, non-archived) */}
        {currentUser && !isArchived && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SmilePlusIcon className="w-4 h-auto" />
              {t("common.reaction")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-w-[90vw] sm:max-w-md p-2">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                {memoRelatedSetting.reactions.map((reactionType) => (
                  <button
                    type="button"
                    key={reactionType}
                    className={cn(
                      "inline-flex w-auto text-base cursor-pointer rounded px-1 text-muted-foreground hover:opacity-80 transition-colors",
                      hasReacted(reactionType) && "bg-secondary text-secondary-foreground",
                    )}
                    onClick={() => handleReactionClick(reactionType)}
                  >
                    {reactionType}
                  </button>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* Copy link (non-archived) */}
        {!isArchived && (
          <DropdownMenuItem onClick={handleCopyLink}>
            <LinkIcon className="w-4 h-auto" />
            {t("memo.copy-link")}
          </DropdownMenuItem>
        )}

        {/* Write actions (non-readonly) */}
        {!readonly && (
          <>
            {/* Archive/Restore (non-comment) */}
            {!isComment && (
              <DropdownMenuItem onClick={handleToggleMemoStatusClick}>
                {isArchived ? <ArchiveRestoreIcon className="w-4 h-auto" /> : <ArchiveIcon className="w-4 h-auto" />}
                {isArchived ? t("common.restore") : t("common.archive")}
              </DropdownMenuItem>
            )}

            {/* Delete */}
            <DropdownMenuItem onClick={handleDeleteMemoClick}>
              <TrashIcon className="w-4 h-auto" />
              {t("common.delete")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("memo.delete-confirm")}
        confirmLabel={t("common.delete")}
        description={t("memo.delete-confirm-description")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmDeleteMemo}
        confirmVariant="destructive"
      />
    </DropdownMenu>
  );
};

export default MemoActionMenu;
