'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { Paperclip, UploadCloud, FileCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface FileUploadUploaderProps {
  folderPath: string; // e.g. "deals/123" or "companies/456"
  onUploadSuccess: (fileData: { name: string; url: string; size: number; mimeType: string }) => void;
}

export default function FileUploadUploader({ folderPath, onUploadSuccess }: FileUploadUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isFirebaseConfigured) {
      setError('Firebase Storage no está configurado aún en .env.local. Revisá las credenciales de Firebase en el archivo de configuración.');
      return;
    }

    // Limit to 15MB max per attachment
    if (file.size > 15 * 1024 * 1024) {
      setError('El archivo supera el tamaño máximo permitido de 15 MB.');
      return;
    }

    setIsUploading(true);
    setError('');
    setProgress(0);

    try {
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `attachments/${folderPath}/${cleanFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(p);
        },
        (err) => {
          setIsUploading(false);
          setError(`Error al subir el archivo: ${err.message}`);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          onUploadSuccess({
            name: file.name,
            url: downloadUrl,
            size: file.size,
            mimeType: file.type,
          });
        }
      );
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Error durante la carga.');
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Almacenamiento de Adjuntos (Firebase Storage)</span>
        </div>
        <p className="text-[11px] text-amber-800">
          Para adjuntar archivos grandes (PDF, presentaciones, briefs) en la nube, completa las credenciales de Firebase en tu archivo <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{error}</p>}

      <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#5CB2D4] rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition text-center group">
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        {isUploading ? (
          <div className="space-y-2 py-2">
            <Loader2 className="w-6 h-6 text-[#274283] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Subiendo a la nube... {progress}%</p>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-[#5CB2D4] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#5CB2D4] mx-auto transition" />
            <p className="text-xs font-semibold text-slate-700">
              Adjuntar Archivo en la Nube (PDF, Presentación, Brief)
            </p>
            <p className="text-[10px] text-slate-400">Arrastrá o elegí un archivo de hasta 15 MB</p>
          </div>
        )}
      </label>
    </div>
  );
}
