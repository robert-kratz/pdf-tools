"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FilePlus, Upload, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { usePdfStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type FileEntry } from "@/lib/types";

interface UploadZoneProps {
  onFilesAdded?: (files: FileEntry[]) => void;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function UploadZone({ onFilesAdded, className }: UploadZoneProps) {
  const { addFiles } = usePdfStore();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      
      // Filter for PDF files and check size
      const validFiles = acceptedFiles.filter((file) => {
        if (!file.type.includes("pdf")) {
          setError("Only PDF files are accepted");
          return false;
        }
        
        if (file.size > MAX_FILE_SIZE) {
          setError(`File '${file.name}' exceeds the maximum size of 50MB`);
          return false;
        }
        
        return true;
      });
      
      // If no valid files, return early
      if (validFiles.length === 0) {
        return;
      }
      
      // Convert to FileEntry objects
      const fileEntries: FileEntry[] = validFiles.map((file) => ({
        id: uuidv4(),
        file,
        name: file.name,
        size: file.size,
      }));
      
      // Add to store
      addFiles(fileEntries);
      
      // Call callback if provided
      if (onFilesAdded) {
        onFilesAdded(fileEntries);
      }
    },
    [addFiles, onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative p-6 border-2 border-dashed border-border transition-colors",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <input {...getInputProps()} />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary/10 rounded-full p-4 mb-4"
        >
          {isDragActive ? (
            <Upload className="h-10 w-10 text-primary" />
          ) : (
            <FilePlus className="h-10 w-10 text-primary" />
          )}
        </motion.div>
        
        <h3 className="text-xl font-medium mb-2">Upload PDF files</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Drag & drop your PDF files here, or click to browse
        </p>
        
        <Button variant="outline" className="group">
          <Upload className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
          Browse Files
        </Button>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center mt-4 text-destructive text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </motion.div>
        )}
        
        <p className="text-xs text-muted-foreground mt-4">
          Maximum file size: 50MB
        </p>
      </motion.div>
    </Card>
  );
}