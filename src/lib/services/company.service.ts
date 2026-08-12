import { db } from '@/db';
import { companies, contacts, deals, activities } from '@/db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { normalizeDomain } from '@/lib/utils/normalization';
import { SessionUser } from './auth.service';

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  address?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  clientStatus?: string;
  briefNotes?: string;
  ownerId?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  domain?: string;
  industry?: string;
  phone?: string;
  address?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  clientStatus?: string;
  briefNotes?: string;
  ownerId?: string;
}

export async function listCompanies(
  user: SessionUser,
  options?: {
    search?: string;
    ownerId?: string;
    clientStatus?: string;
    showArchived?: boolean;
  }
) {
  const conditions = [];

  if (user.role === 'salesperson') {
    conditions.push(eq(companies.ownerId, user.id));
  } else if (options?.ownerId) {
    conditions.push(eq(companies.ownerId, options.ownerId));
  }

  if (options?.clientStatus) {
    conditions.push(eq(companies.clientStatus, options.clientStatus));
  }

  if (!options?.showArchived) {
    conditions.push(eq(companies.isArchived, false));
  }

  if (options?.search) {
    const pattern = `%${options.search.trim()}%`;
    conditions.push(
      or(
        ilike(companies.name, pattern),
        ilike(companies.domain, pattern),
        ilike(companies.industry, pattern)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.companies.findMany({
    where: whereClause,
    with: {
      owner: true,
      contacts: true,
      deals: true,
      companyTags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: [desc(companies.createdAt)],
  });
}

export async function getCompanyById(id: string, user: SessionUser) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
    with: {
      owner: true,
      contacts: {
        where: eq(contacts.isArchived, false),
      },
      deals: {
        where: eq(deals.isArchived, false),
        with: {
          stage: true,
          owner: true,
        },
      },
      activities: {
        with: {
          creator: true,
        },
        orderBy: [desc(activities.createdAt)],
      },
    },
  });

  if (!company) return null;

  if (user.role === 'salesperson' && company.ownerId !== user.id) {
    throw new Error('Forbidden: You do not have permission to view this company.');
  }

  return company;
}

export const getCompanyDetail = getCompanyById;

export async function createCompany(input: CreateCompanyInput, user: SessionUser) {
  const rawDomain = input.domain?.trim() || '';
  const normalized = normalizeDomain(rawDomain);

  const [newCompany] = await db
    .insert(companies)
    .values({
      name: input.name.trim(),
      domain: normalized || null,
      industry: input.industry?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      website: input.website?.trim() || null,
      linkedinUrl: input.linkedinUrl?.trim() || null,
      instagramUrl: input.instagramUrl?.trim() || null,
      facebookUrl: input.facebookUrl?.trim() || null,
      tiktokUrl: input.tiktokUrl?.trim() || null,
      clientStatus: input.clientStatus || 'prospect',
      briefNotes: input.briefNotes?.trim() || null,
      ownerId: input.ownerId || user.id,
    })
    .returning();

  await db.insert(activities).values({
    type: 'note',
    content: `Company "${newCompany.name}" created by ${user.name}`,
    companyId: newCompany.id,
    createdBy: user.id,
  });

  return newCompany;
}

export async function updateCompany(id: string, input: UpdateCompanyInput, user: SessionUser) {
  const existing = await db.query.companies.findFirst({ where: eq(companies.id, id) });
  if (!existing) throw new Error('Company not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only edit your own companies.');
  }

  const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.domain !== undefined) updateData.domain = normalizeDomain(input.domain) || null;
  if (input.industry !== undefined) updateData.industry = input.industry?.trim() || null;
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;
  if (input.address !== undefined) updateData.address = input.address?.trim() || null;
  if (input.website !== undefined) updateData.website = input.website?.trim() || null;
  if (input.linkedinUrl !== undefined) updateData.linkedinUrl = input.linkedinUrl?.trim() || null;
  if (input.instagramUrl !== undefined) updateData.instagramUrl = input.instagramUrl?.trim() || null;
  if (input.facebookUrl !== undefined) updateData.facebookUrl = input.facebookUrl?.trim() || null;
  if (input.tiktokUrl !== undefined) updateData.tiktokUrl = input.tiktokUrl?.trim() || null;
  if (input.clientStatus !== undefined) updateData.clientStatus = input.clientStatus;
  if (input.briefNotes !== undefined) updateData.briefNotes = input.briefNotes?.trim() || null;
  if (input.ownerId !== undefined && user.role !== 'salesperson') {
    updateData.ownerId = input.ownerId || null;
  }

  const [updated] = await db
    .update(companies)
    .set(updateData)
    .where(eq(companies.id, id))
    .returning();

  return updated;
}

export async function archiveCompany(id: string, user: SessionUser) {
  const existing = await db.query.companies.findFirst({ where: eq(companies.id, id) });
  if (!existing) throw new Error('Company not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only archive your own companies.');
  }

  const [archived] = await db
    .update(companies)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning();

  return archived;
}
