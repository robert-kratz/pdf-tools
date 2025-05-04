"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePdfStore } from "@/lib/store";

interface PreviewModalProps {
  fileId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreviewModal({ 
  fileId, 
  isOpen, 
  onOpenChange 
}: PreviewModalProps) {
  const { files } = usePdfStore();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  
  const currentFile = fileId ? files.find(f => f.id === fileId) : null;
  
  // Create object URL when file changes
  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile.file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [currentFile]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center">
          <DialogTitle className="flex items-center text-lg">
            {currentFile?.name || "PDF Preview"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-background/50 dark:bg-muted/10 h-[65vh] flex items-center justify-center">
          {objectUrl ? (
            <div className="w-full h-full">
              <iframe
                src={`${objectUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title="PDF Preview"
                style={{
                  pointerEvents: "all",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none"
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}