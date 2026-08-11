'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function ImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<{
    jobId: string;
    totalRows: number;
    validRows: Array<{ rowNumber: number; data: any; hasDuplicates: boolean; duplicateCount: number }>;
    errorRows: Array<{ rowNumber: number; reason: string; data: any }>;
  } | null>(null);

  const sampleCsvContent = `firstName,lastName,email,companyName,jobTitle,phone
Carlos,Ramírez,carlos.ramirez@techlatam.com,Tech Latam,Director Comercial,+54 11 4444 5555
Lucía,Fernández,lucia.f@innovacion.es,Innovación S.A.,Jefa de Proyecto,+34 91 222 3333
Martín,Gómez,martin.gomez@techlatam.com,Tech Latam,Gerente de Producto,+54 11 4444 9999`;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al procesar el archivo CSV.');
      }

      const result = await res.json();
      setImportResult(result);
      setStep('review');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: importResult.jobId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al confirmar la importación.');
      }

      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className={`flex items-center gap-2 font-semibold text-sm ${step === 'upload' ? 'text-[#274283]' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'upload' ? 'bg-[#274283] text-white' : 'bg-slate-100'}`}>
            1
          </div>
          <span>1. Cargar Archivo CSV</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 font-semibold text-sm ${step === 'review' ? 'text-[#274283]' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'review' ? 'bg-[#274283] text-white' : 'bg-slate-100'}`}>
            2
          </div>
          <span>2. Revisar Coincidencias y Errores</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 font-semibold text-sm ${step === 'done' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'done' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
            3
          </div>
          <span>3. Importación Finalizada</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleFileUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 hover:border-[#5CB2D4] transition rounded-2xl p-8 text-center space-y-4 bg-slate-50/50">
              <UploadCloud className="w-12 h-12 text-[#274283] mx-auto" />
              <div>
                <p className="font-semibold text-slate-800">Selecciona o arrastra tu archivo CSV</p>
                <p className="text-xs text-slate-500 mt-1">Soporta columnas: firstName, lastName, email, companyName, jobTitle, phone</p>
              </div>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#274283] file:text-white hover:file:bg-[#1f3468] cursor-pointer"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || isProcessing}
                className="btn-primary py-3 px-8 text-sm shadow-md flex items-center gap-2"
              >
                <span>{isProcessing ? 'Procesando Filas...' : 'Analizar Archivo CSV'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Sample CSV Download / Preview */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400">Formato Estructurado de Ejemplo (CSV)</p>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto font-mono">
              {sampleCsvContent}
            </pre>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW */}
      {step === 'review' && importResult && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Resumen de Análisis del CSV</h2>
              <p className="text-xs text-slate-500 mt-0.5">Se procesaron {importResult.totalRows} filas del archivo cargado.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="font-display font-bold text-lg text-emerald-700">{importResult.validRows.length}</p>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Filas Válidas</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg text-rose-700">{importResult.errorRows.length}</p>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Filas con Error</p>
              </div>
            </div>
          </div>

          {/* Valid Rows Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Registros Válidos Listos para Insertar ({importResult.validRows.length})</span>
            </h3>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase sticky top-0">
                  <tr>
                    <th className="p-3"># Fila</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Estado de Duplicado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importResult.validRows.map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{row.rowNumber}</td>
                      <td className="p-3 font-semibold text-slate-800">{row.data.firstName} {row.data.lastName}</td>
                      <td className="p-3 text-slate-600">{row.data.email}</td>
                      <td className="p-3 text-slate-600">{row.data.companyName || '—'}</td>
                      <td className="p-3">
                        {row.hasDuplicates ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {row.duplicateCount} coincidencia
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">✓ Nuevo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Rows */}
          {importResult.errorRows.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Filas Omitidas por Error ({importResult.errorRows.length})</span>
              </h3>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900">
                {importResult.errorRows.map((e) => (
                  <p key={e.rowNumber}>
                    <span className="font-mono font-bold">Fila {e.rowNumber}:</span> {e.reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => setStep('upload')}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold"
            >
              ← Cancelar y Volver a Cargar
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={isProcessing || importResult.validRows.length === 0}
              className="btn-primary py-2.5 px-8 text-xs shadow-md"
            >
              {isProcessing
                ? 'Insertando Registros...'
                : `Confirmar e Importar ${importResult.validRows.length} Registros`}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DONE */}
      {step === 'done' && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900">¡Importación Finalizada Exitosamente!</h2>
            <p className="text-slate-600 text-sm mt-2">
              Todos los contactos y empresas del archivo CSV han sido procesados e insertados en la base de datos.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/contacts')}
              className="btn-primary py-3 px-8 text-sm shadow-md"
            >
              Ver Directorio de Contactos
            </button>
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setImportResult(null);
              }}
              className="btn-secondary py-3 px-6 text-sm"
            >
              Importar Otro Archivo CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
