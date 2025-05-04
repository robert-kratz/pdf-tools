"use client";

import { useState, useCallback } from 'react';
import { usePdfStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { type DownloadEntry } from '@/lib/types';

const usePdfProcessor = () => {
  const { addDownload } = usePdfStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper to create a download entry and add to store
  const createDownload = useCallback((blob: Blob, filename: string): DownloadEntry => {
    const url = URL.createObjectURL(blob);
    const id = uuidv4();
    const download = {
      id,
      name: filename,
      url,
      size: blob.size,
      timestamp: Date.now(),
    };
    
    addDownload(download);
    return download;
  }, [addDownload]);

  // Split PDF into separate files based on page ranges
  const splitPdf = useCallback(async (fileId: string, ranges: number[][]) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const { files } = usePdfStore.getState();
      const fileEntry = files.find(f => f.id === fileId);
      
      if (!fileEntry) {
        throw new Error('File not found');
      }

      const formData = new FormData();
      formData.append('file', fileEntry.file);
      formData.append('ranges', JSON.stringify(ranges));

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to split PDF');
      }

      const blob = await response.blob();
      return createDownload(blob, 'split_pdfs.zip');
    } catch (err: any) {
      setError(err.message || 'Failed to split PDF');
      console.error('PDF Split Error:', err);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [createDownload]);
  
  // Merge multiple PDFs into one
  const mergePdfs = useCallback(async (fileIds: string[], outputName: string = 'merged.pdf') => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const { files } = usePdfStore.getState();
      const filesToMerge = files.filter(f => fileIds.includes(f.id));
      
      if (filesToMerge.length < 2) {
        throw new Error('At least two files are required for merging');
      }

      const formData = new FormData();
      filesToMerge.forEach(fileEntry => {
        formData.append('files', fileEntry.file);
      });

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to merge PDFs' }));
        throw new Error(error.error || 'Failed to merge PDFs');
      }

      const blob = await response.blob();
      return createDownload(blob, outputName);
    } catch (err: any) {
      setError(err.message || 'Failed to merge PDFs');
      console.error('PDF Merge Error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [createDownload]);
  
  return {
    splitPdf,
    mergePdfs,
    isProcessing,
    error,
  };
};

export default usePdfProcessor;