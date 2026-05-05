import { PlusIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useUserStats } from "@/hooks/useUserQueries";
import { useTranslate } from "@/utils/i18n";
import { useEditorContext } from "../state";

const TagPickerButton = () => {
  const translate = useTranslate();
  const currentUser = useCurrentUser();
  const { data: userStats } = useUserStats(currentUser?.name);
  const { state, actions, dispatch } = useEditorContext();
  const [newTagName, setNewTagName] = useState("");

  const selectedTags = state.metadata.tags;

  // Union of server-known tags and locally selected tags (so newly added tags are visible)
  const allTags = useMemo(
    () => Array.from(new Set([...Object.keys(userStats?.tagCount ?? {}), ...selectedTags])).sort(),
    [userStats, selectedTags],
  );

  const handleToggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((existing) => existing !== tag)
      : [...selectedTags, tag];
    dispatch(actions.setMetadata({ tags: newTags }));
  };

  const handleAddNewTag = () => {
    const tag = newTagName.trim();
    if (!tag || selectedTags.includes(tag)) {
      setNewTagName("");
      return;
    }
    dispatch(actions.setMetadata({ tags: [...selectedTags, tag] }));
    setNewTagName("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="shadow-none">
          <TagIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-48 p-2">
        <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
          {allTags.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 px-1.5 py-1 rounded-md text-sm cursor-pointer hover:bg-accent transition-colors"
            >
              <Checkbox checked={selectedTags.includes(tag)} onCheckedChange={() => handleToggleTag(tag)} />
              <span className="truncate">{tag}</span>
            </label>
          ))}
        </div>
        {allTags.length > 0 && <div className="border-t my-1.5" />}
        <div
          className="flex flex-row items-center gap-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddNewTag();
          }}
        >
          <Input
            className="h-7 text-sm"
            placeholder={translate("tag.create-tag")}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleAddNewTag}>
            <PlusIcon className="w-4 h-auto" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagPickerButton;
