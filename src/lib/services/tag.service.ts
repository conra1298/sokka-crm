import { db } from '@/db';
import { tags, contactTags, companyTags } from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface TagItem {
  id: string;
  name: string;
  color: string;
  createdBy?: string;
  createdAt?: string;
}

export async function listTags(): Promise<TagItem[]> {
  return db.query.tags.findMany({
    orderBy: (t: any, { asc }: any) => [asc(t.name)],
  });
}

export async function createTag(
  input: { name: string; color?: string },
  user: SessionUser
): Promise<TagItem> {
  const cleanName = input.name.trim();
  if (!cleanName) throw new Error('El nombre de la etiqueta no puede estar vacío.');

  const existing = await db.query.tags.findFirst({
    where: eq(tags.name, cleanName),
  });

  if (existing) return existing;

  const [newTag] = await db
    .insert(tags)
    .values({
      name: cleanName,
      color: input.color || '#5CB2D4',
      createdBy: user.id,
    })
    .returning();

  return newTag;
}

export async function deleteTag(id: string, user: SessionUser): Promise<void> {
  if (user.role === 'salesperson') {
    throw new Error('Forbidden: Only admins or managers can delete tags.');
  }

  await db.delete(tags).where(eq(tags.id, id));
}

export async function setContactTags(contactId: string, tagIds: string[]): Promise<void> {
  // Delete existing contact tags
  await db.delete(contactTags).where(eq(contactTags.contactId, contactId));

  if (tagIds.length > 0) {
    const values = tagIds.map((tagId) => ({
      contactId,
      tagId,
    }));
    await db.insert(contactTags).values(values);
  }
}

export async function setCompanyTags(companyId: string, tagIds: string[]): Promise<void> {
  // Delete existing company tags
  await db.delete(companyTags).where(eq(companyTags.companyId, companyId));

  if (tagIds.length > 0) {
    const values = tagIds.map((tagId) => ({
      companyId,
      tagId,
    }));
    await db.insert(companyTags).values(values);
  }
}

export async function getContactTags(contactId: string): Promise<TagItem[]> {
  const links = await db.query.contactTags.findMany({
    where: eq(contactTags.contactId, contactId),
    with: {
      tag: true,
    },
  });
  return links.map((l: any) => l.tag);
}

export async function getCompanyTags(companyId: string): Promise<TagItem[]> {
  const links = await db.query.companyTags.findMany({
    where: eq(companyTags.companyId, companyId),
    with: {
      tag: true,
    },
  });
  return links.map((l: any) => l.tag);
}
