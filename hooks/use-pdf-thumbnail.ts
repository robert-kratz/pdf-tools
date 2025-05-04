"use client";

import { useState } from 'react';
import { usePdfStore } from '@/lib/store';

interface ThumbnailOptions {
  pageNumber?: number;
  scale?: number;
  quality?: number;
}

const usePdfThumbnail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateFileMetadata } = usePdfStore();
  
  // Generate thumbnail for a PDF
  const generateThumbnail = async (
    fileId: string, 
    options: ThumbnailOptions = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { files } = usePdfStore.getState();
      const fileEntry = files.find(f => f.id === fileId);
      
      if (!fileEntry) {
        throw new Error('File not found');
      }
      
      // Create object URL for the PDF
      const objectUrl = URL.createObjectURL(fileEntry.file);
      
      // Update file metadata with object URL as thumbnail
      updateFileMetadata(fileId, { 
        thumbnail: objectUrl,
        totalPages: 1 // Since we can't get actual page count without PDF.js
      });
      
      return objectUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to generate thumbnail');
      console.error('Thumbnail Generation Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateThumbnail,
    isLoading,
    error,
  };
};

export default usePdfThumbnail;