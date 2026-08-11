import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/services/auth.service';
import { getDealDetail } from '@/lib/services/deal.service';
import { getDealServiceItems } from '@/lib/services/service-catalog.service';
import { formatDate, formatCurrency } from '@/lib/utils/normalization';
import PrintProposalClient from './PrintProposalClient';

export default async function ProposalPrintPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await requireAuth();

  const deal = await getDealDetail(params.id, user);
  if (!deal) {
    notFound();
  }

  const items = await getDealServiceItems(deal.id);
  const totalAmount = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);

  const proposalDate = formatDate(new Date().toISOString());
  // Valid for 15 days
  const validUntilDate = formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString());

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-800">
      <PrintProposalClient
        deal={deal}
        items={items}
        totalAmount={totalAmount}
        proposalDate={proposalDate}
        validUntilDate={validUntilDate}
      />
    </div>
  );
}
