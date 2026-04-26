import { PlusIcon, TagIcon } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useUpdateMemo } from "@/hooks/useMemoQueries";
import { useUserStats } from "@/hooks/useUserQueries";
import { cn } from "@/lib/utils";
import type { Memo } from "@/types/proto/api/v1/memo_service_pb";
import { useTranslate } from "@/utils/i18n";

interface MemoTagPopoverProps {
  memo: Memo;
  className?: string;
}

const MemoTagPopover = ({ memo, className }: MemoTagPopoverProps) => {
  const t = useTranslate();
  const currentUser = useCurrentUser();
  const { data: userStats } = useUserStats(currentUser?.name);
  const { mutateAsync: updateMemo } = useUpdateMemo();
  const [newTagName, setNewTagName] = useState("");

  const allTags = Object.keys(userStats?.tagCount ?? {}).sort();
  const memoTags = memo.tags ?? [];

  const handleToggleTag = useCallback(
    async (tag: string) => {
      const hasTag = memoTags.includes(tag);
      const newTags = hasTag ? memoTags.filter((t) => t !== tag) : [...memoTags, tag];
      try {
        await updateMemo({
          update: { name: memo.name, tags: newTags },
          updateMask: ["tags"],
        });
      } catch {
        toast.error("Failed to update tags");
      }
    },
    [memo.name, memoTags, updateMemo],
  );

  const handleAddNewTag = useCallback(async () => {
    const tag = newTagName.trim();
    if (!tag || memoTags.includes(tag)) {
      setNewTagName("");
      return;
    }
    try {
      await updateMemo({
        update: { name: memo.name, tags: [...memoTags, tag] },
        updateMask: ["tags"],
      });
      setNewTagName("");
    } catch {
      toast.error("Failed to add tag");
    }
  }, [memo.name, memoTags, newTagName, updateMemo]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-7 w-7 flex justify-center items-center rounded-full cursor-pointer transition-all hover:opacity-80",
            className,
          )}
        >
          <TagIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-48 p-2">
        <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
          {allTags.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 px-1.5 py-1 rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
            >
              <Checkbox checked={memoTags.includes(tag)} onCheckedChange={() => handleToggleTag(tag)} />
              <span className="truncate">{tag}</span>
            </label>
          ))}
        </div>
        {allTags.length > 0 && <div className="border-t my-1.5" />}
        <div
          className="flex flex-row items-center gap-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNewTag();
            }
          }}
        >
          <Input className="h-7 text-sm" placeholder={t("tag.create-tag")} value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleAddNewTag}>
            <PlusIcon className="w-4 h-auto" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { MemoTagPopover };
