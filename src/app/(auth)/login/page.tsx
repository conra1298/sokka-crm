'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from './actions';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const fillCredentials = (email: string) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = 'sokka2024';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-xl">
      <h2 className="font-display font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
        <Lock className="w-5 h-5 text-[#274283]" />
        <span>Iniciar Sesión en tu Espacio de Trabajo</span>
      </h2>

      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectPath} />

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nombre@sokka.com"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] focus:border-transparent text-sm transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] focus:border-transparent text-sm transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base shadow-lg"
        >
          <span>{isPending ? 'Autenticando...' : 'Iniciar Sesión'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Demo Users Quick Selector */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
          Cuentas de Prueba (Clic para llenar)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@sokka.com')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 text-xs font-medium transition text-center"
          >
            Administrador
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('manager@sokka.com')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 text-xs font-medium transition text-center"
          >
            Gerente
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('sales@sokka.com')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 text-xs font-medium transition text-center"
          >
            Vendedor
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">Contraseña para todas: sokka2024</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-[#F8FAFC] to-slate-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EB7638] text-white font-bold text-3xl shadow-xl mb-4">
            S
          </div>
          <h1 className="font-display font-extrabold text-3xl text-[#274283]">SOKKA CRM</h1>
          <p className="text-slate-600 text-sm mt-1">Gestión Estratégica de Ventas B2B</p>
        </div>

        <Suspense fallback={<div className="p-8 text-center bg-white rounded-3xl border border-slate-200">Cargando inicio de sesión...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
