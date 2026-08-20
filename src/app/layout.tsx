import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Sokka CRM',
    default: 'Sokka CRM — Plataforma de Ventas B2B',
  },
  description:
    'Sokka CRM es una plataforma integral para equipos comerciales y agencias. Gestiona contactos, empresas, oportunidades, finanzas y clientes activos en un solo lugar.',
  icons: {
    icon: [
      { url: '/logo-app.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/logo-app.svg'],
    apple: [
      { url: '/logo-app.svg' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex flex-col bg-[#F8FAFC] text-[#0f172a] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
