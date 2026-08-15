'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit3, ArrowUpRight } from 'lucide-react';
import ClientEditModal from './ClientEditModal';

interface ClientsTableActionsProps {
  deal: any;
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string; companyId?: string | null }>;
  users: Array<{ id: string; name: string }>;
}

export default function ClientsTableActions({
  deal,
  companies,
  contacts,
  users,
}: ClientsTableActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 text-xs font-semibold transition flex items-center gap-1"
          title="Editar datos del servicio o cliente"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar</span>
        </button>

        <Link
          href={`/deals/${deal.id}`}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1"
          title="Ver ficha completa"
        >
          <span>Ficha</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {isEditing && (
        <ClientEditModal
          deal={deal}
          companies={companies}
          contacts={contacts}
          users={users}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
