'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SheetCollection } from '@/types/hr';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ExcelDropzoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataLoaded: (sheets: SheetCollection, fileName: string) => void;
}

export function ExcelDropzoneModal({
  open,
  onOpenChange,
  onDataLoaded,
}: ExcelDropzoneModalProps) {
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
        onOpenChange(false);
      }, 300);
    } catch (err: any) {
      console.error('Error uploading Excel file:', err);
      setError(err?.message || 'Failed to upload and save Excel file.');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Upload HR Excel Workbook to SQLite
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select a new single or multi-sheet Excel file. Ingested directly into local SQLite database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dropzone Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
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

            <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Click to browse or drag & drop your spreadsheet here
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supports .xlsx, .xls, and .csv
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <Badge variant="outline" className="text-[10px] font-mono font-normal">
                .XLSX
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono font-normal">
                .XLS
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono font-normal">
                .CSV
              </Badge>
            </div>
          </div>

          {/* Loading Progress */}
          {loading && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Saving records to SQLite database...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
