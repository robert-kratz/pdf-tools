// PDF application types
export interface FileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  totalPages?: number;
}

export interface DownloadEntry {
  id: string;
  name: string;
  url: string;
  size: number;
  timestamp: number;
}

export type OperationType = 'split' | 'merge' | null;