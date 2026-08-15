'use client';

import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import DealEditModal from './DealEditModal';

interface DealHeaderActionsProps {
  deal: any;
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string; companyId?: string | null }>;
  users: Array<{ id: string; name: string }>;
}

export default function DealHeaderActions({
  deal,
  companies,
  contacts,
  users,
}: DealHeaderActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsEditing(true)}
        className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
      >
        <Edit3 className="w-3.5 h-3.5 text-[#274283]" />
        <span>Editar {deal.dealType === 'retainer' ? 'Servicio' : 'Oportunidad'}</span>
      </button>

      {isEditing && (
        <DealEditModal
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
