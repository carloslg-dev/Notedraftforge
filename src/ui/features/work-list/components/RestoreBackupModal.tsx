import { useState, useRef } from 'react';
import { useRestoreBackup } from '../use-restore-backup';
import { Button } from '@/ui/components/ui/button';
import { AlertTriangle, Upload, Clipboard, Check } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RestoreBackupModal({
  isOpen,
  onClose,
  onSuccess
}: RestoreBackupModalProps) {
  const { restoreBackup, isRestoring } = useRestoreBackup();
  const { t, uiLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setUploadedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const executeRestore = async () => {
    if (isRestoring) return;
    let jsonString = '';

    if (activeTab === 'upload') {
      if (!uploadedFile) return;
      try {
        jsonString = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(uploadedFile);
        });
      } catch (err) {
        console.error(err);
        return;
      }
    } else {
      if (!jsonText.trim()) return;
      jsonString = jsonText;
    }

    const success = await restoreBackup(jsonString);
    if (success) {
      onSuccess();
      onClose();
      // Clean up inputs
      setJsonText('');
      setUploadedFile(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card text-card-foreground border rounded-xl shadow-lg p-6 flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {t('restoreBackup')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('selectBackupFile')}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="flex gap-3 p-4 border border-destructive/30 rounded-lg bg-destructive/10 text-destructive text-sm leading-relaxed items-start">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-destructive-foreground dark:text-red-400">
              WARNING / ADVERTENCIA
            </span>
            <p className="text-muted-foreground text-xs">
              {t('backupWarning')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            {uiLanguage === 'es' ? 'Subir Archivo' : 'Upload File'}
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('paste')}
          >
            {uiLanguage === 'es' ? 'Pegar JSON' : 'Paste JSON'}
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[160px] flex flex-col justify-center">
          {activeTab === 'upload' ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : uploadedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedFile ? (
                <>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                    <Check className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm text-emerald-500 mt-2">
                    {uploadedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB • {uiLanguage === 'es' ? 'Hacer clic para cambiar' : 'Click to change'}
                  </span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-muted rounded-full">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm mt-2">
                    {t('clickOrDragFile')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {uiLanguage === 'es' ? 'Soporta archivos .json de copia de seguridad' : 'Supports .json backup files'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 h-full">
              <textarea
                placeholder={uiLanguage === 'es' ? 'Pega el contenido JSON de la copia aquí...' : 'Paste backup JSON content here...'}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isRestoring}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={executeRestore}
            disabled={
              isRestoring ||
              (activeTab === 'upload' && !uploadedFile) ||
              (activeTab === 'paste' && !jsonText.trim())
            }
            className="flex gap-2 items-center text-white"
          >
            {activeTab === 'paste' ? (
              <Clipboard className="h-4 w-4 text-white" />
            ) : (
              <Upload className="h-4 w-4 text-white" />
            )}
            {isRestoring ? t('restoreProgress') : t('restoreConfirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
