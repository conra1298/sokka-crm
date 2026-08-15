'use client';

import { useState } from 'react';
import { Edit3, MessageCircle } from 'lucide-react';
import ContactEditModal from './ContactEditModal';

interface ContactHeaderActionsProps {
  contact: any;
  companies: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
}

export default function ContactHeaderActions({
  contact,
  companies,
  users,
}: ContactHeaderActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Format WhatsApp Link
  const rawPhone = contact.phone ? contact.phone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = rawPhone ? `https://wa.me/${rawPhone}` : null;

  return (
    <>
      <div className="flex items-center gap-2">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
        )}

        <button
          onClick={() => setIsEditing(true)}
          className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#274283]" />
          <span>Editar Contacto</span>
        </button>
      </div>

      {isEditing && (
        <ContactEditModal
          contact={contact}
          companies={companies}
          users={users}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
