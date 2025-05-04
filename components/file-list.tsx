"use client";

import React, { useEffect } from "react";
import {
  File,
  Trash2,
  Scissors,
  MergeIcon,
  FileWarning,
  CheckSquare,
  Square,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import { usePdfStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import usePdfThumbnail from "@/hooks/use-pdf-thumbnail";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UploadZone from "@/components/upload-zone";

interface FileListProps {
  mode?: "select" | "preview";
  onSplitClick?: (fileId: string) => void;
  onMergeClick?: (fileId: string) => void;
  onPreviewClick?: (fileId: string) => void;
}

export default function FileList({
                                   mode = "preview",
                                   onSplitClick,
                                   onMergeClick,
                                   onPreviewClick,
                                 }) {
  const { files, removeFile, toggleMergeSelection, selectedForMerge } = usePdfStore();
  const { generateThumbnail } = usePdfThumbnail();

  // Generate thumbnails for files that don't have them
  useEffect(() => {
    files.forEach((file) => {
      if (!file.thumbnail) {
        generateThumbnail(file.id);
      }
    });
  }, [files, generateThumbnail]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
      <div className="space-y-3">
        {/* Upload More Button */}
        <Card className="p-4 border-dashed">
          <UploadZone />
        </Card>

        <AnimatePresence initial={false}>
          {files.map((file) => (
              <motion.div
                  key={file.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
              >
                <Card
                    className={cn(
                        "p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3",
                        mode === "select" && "hover:bg-muted/50 cursor-pointer",
                        selectedForMerge.includes(file.id) && "ring-2 ring-primary/20"
                    )}
                    onClick={() => {
                      if (mode === "select") {
                        toggleMergeSelection(file.id);
                      }
                    }}
                >
                  {/* Checkbox (for merge mode) */}
                  {mode === "select" && (
                      <div className="flex-shrink-0 text-primary">
                        {selectedForMerge.includes(file.id) ? (
                            <CheckSquare className="h-5 w-5" />
                        ) : (
                            <Square className="h-5 w-5" />
                        )}
                      </div>
                  )}

                  {/* Thumbnail */}
                  <div className="hidden md:block relative flex-shrink-0 w-16 h-16 sm:w-12 sm:h-12 bg-muted rounded overflow-hidden">
                    <div className="flex items-center justify-center w-full h-full">
                      <File className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>

                  {/* File info */}
                  <div className="flex-grow min-w-0 text-left">
                    <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      {file.totalPages && <span>•</span>}
                      {file.totalPages && <span>{file.totalPages} pages</span>}
                      <span>•</span>
                      <span>{format(new Date(file.file.lastModified), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center ml-auto">
                    <TooltipProvider>
                      {mode === "preview" && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onSplitClick) onSplitClick(file.id);
                                    }}
                                >
                                  <Scissors className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Split PDF</TooltipContent>
                            </Tooltip>
                          </>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Card>
              </motion.div>
          ))}
        </AnimatePresence>
      </div>
  );
}