'use client';

import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SheetCollection } from '@/types/hr';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  TableProperties,
  Database
} from 'lucide-react';

interface ExcelUploadHeroProps {
  onDataLoaded: (sheets: SheetCollection, fileName: string) => void;
}

export function ExcelUploadHero({ onDataLoaded }: ExcelUploadHeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload a valid Excel spreadsheet (.xlsx, .xls, or .csv)');
      return;
    }

    setLoading(true);
    setProgress(20);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      setProgress(50);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      setProgress(85);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process spreadsheet file');
      }

      setProgress(100);
      setTimeout(() => {
        onDataLoaded(json.sheets, json.fileName);
        setLoading(false);
      }, 300);
    } catch (err: any) {
      console.error('Error uploading Excel file:', err);
      setError(err?.message || 'Failed to process Excel file.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Local SQLite Database Engine • Persistent & Fast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Enterprise Workforce Analytics
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Upload your multi-sheet HR Excel workbook or link it with the background watcher to auto-sync directly into SQLite.
          </p>
        </div>

        {/* Dropzone Container */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-card shadow-2xs flex flex-col items-center justify-center gap-4 ${
            isDragging
              ? 'border-primary bg-muted/40 scale-[0.99]'
              : 'border-border hover:border-primary/60 hover:bg-muted/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-1.5">
            <p className="text-base font-semibold text-foreground">
              Click to select or drag & drop your Excel file here
            </p>
            <p className="text-xs text-muted-foreground">
              Supports single or multi-sheet .xlsx, .xls, and .csv workbooks
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs font-mono font-normal">
              .XLSX
            </Badge>
            <Badge variant="outline" className="text-xs font-mono font-normal">
              .XLS
            </Badge>
            <Badge variant="outline" className="text-xs font-mono font-normal">
              .CSV
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" /> SQLite Synced
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Storing spreadsheet data into SQLite database...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auto-Sync Tip */}
        <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <TableProperties className="h-4 w-4 text-muted-foreground" />
            <span>Real-Time Excel Auto-Sync</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Run <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">npm run watch-excel "path/to/your/file.xlsx"</code> in your terminal to automatically update the dashboard every time you press <strong>Ctrl + S</strong> in Microsoft Excel!
          </p>
        </div>
      </div>
    </div>
  );
}
