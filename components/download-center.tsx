"use client";

import React from "react";
import { 
  Download, 
  Trash2, 
  FileDown, 
  FolderOpen, 
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import { usePdfStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function DownloadCenter() {
  const { downloads, removeDownload, clearAllDownloads } = usePdfStore();
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    return format(new Date(timestamp), "MMM d, h:mm a");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Download className="h-4 w-4 mr-2" />
          Downloads
          {downloads.length > 0 && (
            <Badge variant="secondary" className="ml-2 -mr-1">
              {downloads.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center">
            <FileDown className="h-5 w-5 mr-2" />
            Download Center
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium mb-1">No files to download</h3>
              <p className="text-sm text-muted-foreground">
                Processed files will appear here
              </p>
            </Card>
          ) : (
            <AnimatePresence initial={false}>
              {downloads.map((download) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <FileDown className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-foreground truncate">{download.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(download.size)}</span>
                        <span>•</span>
                        <span>{formatTimestamp(download.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              asChild
                            >
                              <a href={download.url} download={download.name}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeDownload(download.id)}
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
          )}
        </div>
        
        {downloads.length > 0 && (
          <SheetFooter className="mt-6">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={clearAllDownloads}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}