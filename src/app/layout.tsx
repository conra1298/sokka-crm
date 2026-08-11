import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Sokka CRM',
    default: 'Sokka CRM — Plataforma de Ventas B2B',
  },
  description:
    'Sokka CRM es una alternativa enfocada y confiable a HubSpot CRM para equipos de ventas B2B. Gestiona contactos, empresas, oportunidades, actividades y tareas en un solo lugar.',
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
