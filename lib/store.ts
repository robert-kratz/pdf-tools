import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type FileEntry, type DownloadEntry, type OperationType } from '@/lib/types';

interface PdfStore {
  files: FileEntry[];
  selectedForMerge: string[];
  currentOperation: OperationType;
  downloads: DownloadEntry[];
  
  // Actions
  addFiles: (files: FileEntry[]) => void;
  removeFile: (id: string) => void;
  clearAllFiles: () => void;
  setMergeOrder: (ids: string[]) => void;
  toggleMergeSelection: (id: string) => void;
  setCurrentOperation: (operation: OperationType) => void;
  
  // Download actions
  addDownload: (download: DownloadEntry) => void;
  removeDownload: (id: string) => void;
  clearAllDownloads: () => void;
  
  // PDF metadata
  updateFileMetadata: (id: string, data: Partial<FileEntry>) => void;
}

export const usePdfStore = create<PdfStore>()(
  persist(
    (set) => ({
      files: [],
      selectedForMerge: [],
      currentOperation: null,
      downloads: [],
      
      addFiles: (newFiles) => 
        set((state) => ({ 
          files: [...state.files, ...newFiles] 
        })),
      
      removeFile: (id) => 
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          selectedForMerge: state.selectedForMerge.filter((fileId) => fileId !== id)
        })),
      
      clearAllFiles: () => 
        set({ 
          files: [],
          selectedForMerge: []
        }),
      
      setMergeOrder: (ids) => 
        set({ 
          selectedForMerge: ids 
        }),
      
      toggleMergeSelection: (id) =>
        set((state) => ({
          selectedForMerge: state.selectedForMerge.includes(id)
            ? state.selectedForMerge.filter((fileId) => fileId !== id)
            : [...state.selectedForMerge, id]
        })),
      
      setCurrentOperation: (operation) => 
        set({ 
          currentOperation: operation 
        }),
      
      addDownload: (download) =>
        set((state) => ({
          downloads: [download, ...state.downloads]
        })),
      
      removeDownload: (id) =>
        set((state) => ({
          downloads: state.downloads.filter((download) => download.id !== id)
        })),
      
      clearAllDownloads: () =>
        set({ 
          downloads: [] 
        }),
      
      updateFileMetadata: (id, data) =>
        set((state) => ({
          files: state.files.map((file) => 
            file.id === id 
              ? { ...file, ...data } 
              : file
          )
        })),
    }),
    {
      name: 'pdf-storage',
      partialize: (state) => ({ 
        downloads: state.downloads 
      }),
    }
  )
);