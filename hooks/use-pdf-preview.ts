"use client";

import { useState, useEffect } from 'react';
import { usePdfStore } from '@/lib/store';
import dynamic from 'next/dynamic';

// Keine dynamic import oben nötig!
interface PreviewOptions {
  pageNumber?: number;
  scale?: number;
}

const usePdfPreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const generatePreview = async (
    fileId: string,
    options: PreviewOptions = {}
  ) => {
    const { pageNumber = 1, scale = 1.5 } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamisch importieren zur Laufzeit im Client
      const pdfWrapper = await import('./pdf-js-wrapper').then((mod) => mod.default);
      const pdfjsLib = await pdfWrapper.getPdfJs();

      if (!pdfjsLib) {
        throw new Error('PDF.js library failed to load');
      }

      const { files } = usePdfStore.getState();
      const fileEntry = files.find((f) => f.id === fileId);

      if (!fileEntry) {
        throw new Error('File not found');
      }

      const arrayBuffer = await fileEntry.file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: fileEntry.password || '',
        disableWorker: true,
      });

      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      if (pageNumber < 1 || pageNumber > pdf.numPages) {
        throw new Error(`Page ${pageNumber} does not exist (total pages: ${pdf.numPages})`);
      }

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Could not create canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      return new Promise<string>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Could not generate preview image'));

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          resolve(url);
        }, 'image/png');
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
      console.error('Preview Generation Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generatePreview,
    previewUrl,
    totalPages,
    isLoading,
    error,
  };
};

export default usePdfPreview;