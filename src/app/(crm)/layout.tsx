import { requireAuth } from '@/lib/services/auth.service';
import Sidebar from '@/components/Sidebar';
import GlobalSearchModal from '@/components/GlobalSearchModal';

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="print:hidden">
        <Sidebar user={user} />
      </div>
      <div className="md:pl-64 print:pl-0 flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <GlobalSearchModal />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium hidden sm:inline">{user.name} ({user.role})</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full print:p-0 print:m-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
