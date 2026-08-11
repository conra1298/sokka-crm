'use client';

import { useState } from 'react';
import TagSelector, { TagOption } from '@/components/TagSelector';
import { updateCompanyTagsAction, createTagAction } from '@/app/(crm)/tags/actions';

interface CompanyTagsSectionProps {
  companyId: string;
  allTags: TagOption[];
  initialSelectedTagIds: string[];
}

export default function CompanyTagsSection({
  companyId,
  allTags: initialAllTags,
  initialSelectedTagIds,
}: CompanyTagsSectionProps) {
  const [allTags, setAllTags] = useState<TagOption[]>(initialAllTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedTagIds);

  const handleTagsChange = async (newTagIds: string[]) => {
    setSelectedTagIds(newTagIds);
    await updateCompanyTagsAction(companyId, newTagIds);
  };

  const handleCreateTag = async (name: string, color: string) => {
    const res = await createTagAction(name, color);
    if (res.tag) {
      setAllTags([...allTags, res.tag]);
      return res.tag;
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <TagSelector
        allTags={allTags}
        selectedTagIds={selectedTagIds}
        onChange={handleTagsChange}
        onCreateTag={handleCreateTag}
        label="Etiquetas de la Empresa"
      />
    </div>
  );
}
