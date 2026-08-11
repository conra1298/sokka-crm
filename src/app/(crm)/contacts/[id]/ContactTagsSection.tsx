'use client';

import { useState } from 'react';
import TagSelector, { TagOption } from '@/components/TagSelector';
import { updateContactTagsAction, createTagAction } from '@/app/(crm)/tags/actions';

interface ContactTagsSectionProps {
  contactId: string;
  allTags: TagOption[];
  initialSelectedTagIds: string[];
}

export default function ContactTagsSection({
  contactId,
  allTags: initialAllTags,
  initialSelectedTagIds,
}: ContactTagsSectionProps) {
  const [allTags, setAllTags] = useState<TagOption[]>(initialAllTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedTagIds);

  const handleTagsChange = async (newTagIds: string[]) => {
    setSelectedTagIds(newTagIds);
    await updateContactTagsAction(contactId, newTagIds);
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
        label="Etiquetas del Contacto"
      />
    </div>
  );
}
