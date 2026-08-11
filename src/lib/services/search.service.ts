import { db } from '@/db';
import { contacts, companies, deals } from '@/db/schema';
import { like, or, eq, and, isNull } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface SearchResultItem {
  id: string;
  type: 'contact' | 'company' | 'deal';
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(query: string, user: SessionUser): Promise<SearchResultItem[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const pattern = `%${clean}%`;
  const results: SearchResultItem[] = [];

  // 1. Search Contacts
  const foundContacts = await db.query.contacts.findMany({
    where: and(
      isNull(contacts.mergedIntoId),
      or(
        like(contacts.firstName, pattern),
        like(contacts.lastName, pattern),
        like(contacts.email, pattern)
      )
    ),
    limit: 5,
  });

  for (const c of foundContacts) {
    results.push({
      id: c.id,
      type: 'contact',
      title: `${c.firstName} ${c.lastName}`,
      subtitle: c.email || 'Contacto',
      href: `/contacts/${c.id}`,
    });
  }

  // 2. Search Companies
  const foundCompanies = await db.query.companies.findMany({
    where: like(companies.name, pattern),
    limit: 5,
  });

  for (const comp of foundCompanies) {
    results.push({
      id: comp.id,
      type: 'company',
      title: comp.name,
      subtitle: comp.industry || 'Empresa',
      href: `/companies/${comp.id}`,
    });
  }

  // 3. Search Deals
  const foundDeals = await db.query.deals.findMany({
    where: like(deals.title, pattern),
    limit: 5,
  });

  for (const d of foundDeals) {
    results.push({
      id: d.id,
      type: 'deal',
      title: d.title,
      subtitle: `Oportunidad ($${d.value || 0} ARS)`,
      href: `/deals/${d.id}`,
    });
  }

  return results;
}
