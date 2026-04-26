import { HashIcon } from "lucide-react";
import { AttachmentListView, LocationDisplayView, RelationListView } from "@/components/MemoMetadata";
import { type MemoFilter, useMemoFilterContext } from "@/contexts/MemoFilterContext";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";
import MemoContent from "../../MemoContent";
import { MemoReactionListView } from "../../MemoReactionListView";
import { useMemoHandlers } from "../hooks";
import { useMemoViewContext } from "../MemoViewContext";
import type { MemoBodyProps } from "../types";

const BlurOverlay: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const t = useTranslate();
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer rounded-lg bg-card px-3 text-xs text-foreground shadow-sm hover:-translate-y-0.5 hover:border-ring/40 hover:bg-accent hover:text-accent-foreground hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={onClick}
      >
        <EyeIcon className="h-3.5 w-3.5" />
        {t("memo.click-to-show-sensitive-content")}
      </Button>
    </div>
  );
};

const MemoBody: React.FC<MemoBodyProps> = ({ compact }) => {
  const { memo, parentPage, showBlurredContent, blurred, readonly, openEditor, openPreview, toggleBlurVisibility } = useMemoViewContext();

  const { handleMemoContentClick, handleMemoContentDoubleClick } = useMemoHandlers({ readonly, openEditor, openPreview });

  const referencedMemos = memo.relations.filter(isReferenceRelation);

  return (
    <>
      <div
        className={cn(
          "w-full flex flex-col justify-start items-start gap-2",
          blurred && !showBlurredContent && "blur-lg transition-all duration-200",
        )}
      >
        <MemoContent
          key={`${memo.name}-${memo.updateTime}`}
          content={memo.content}
          onClick={handleMemoContentClick}
          onDoubleClick={handleMemoContentDoubleClick}
          compact={memo.pinned ? false : compact} // Always show full content when pinned
        />
        {memo.tags.length > 0 && <MemoTagBadges tags={memo.tags} />}
        <AttachmentListView attachments={memo.attachments} onImagePreview={openPreview} />
        <RelationListView relations={referencedMemos} currentMemoName={memo.name} parentPage={parentPage} />
        {memo.location && <LocationDisplayView location={memo.location} />}
        <MemoReactionListView memo={memo} reactions={memo.reactions} />
      </div>

      {blurred && !showBlurredContent && <BlurOverlay onClick={toggleBlurVisibility} />}
    </>
  );
};

const MemoTagBadges: React.FC<{ tags: string[] }> = ({ tags }) => {
  const { addFilter, removeFilter, getFiltersByFactor } = useMemoFilterContext();

  const handleTagClick = (tag: string) => {
    const isActive = getFiltersByFactor("tagSearch").some((f: MemoFilter) => f.value === tag);
    if (isActive) {
      removeFilter((f: MemoFilter) => f.factor === "tagSearch" && f.value === tag);
    } else {
      removeFilter((f: MemoFilter) => f.factor === "tagSearch");
      addFilter({ factor: "tagSearch", value: tag });
    }
  };

  return (
    <div className="w-full flex flex-row flex-wrap gap-1.5">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleTagClick(tag);
          }}
        >
          <HashIcon className="w-3 h-3" />
          {tag}
        </button>
      ))}
    </div>
  );
};

export default MemoBody;
