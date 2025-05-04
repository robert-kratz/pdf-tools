"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  MergeIcon, 
  FileDown, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  MoveVertical,
  FilesIcon
} from "lucide-react";

import UploadZone from "@/components/upload-zone";
import FileList from "@/components/file-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePdfStore } from "@/lib/store";
import usePdfProcessor from "@/hooks/use-pdf-processor";
import PreviewModal from "@/components/preview-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function MergePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    files, 
    selectedForMerge, 
    setCurrentOperation, 
    toggleMergeSelection 
  } = usePdfStore();
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState("merged.pdf");
  const { mergePdfs, isProcessing, error } = usePdfProcessor();
  
  // Set current operation
  useEffect(() => {
    setCurrentOperation("merge");
  }, [setCurrentOperation]);
  
  // Default filename with timestamp
  useEffect(() => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
    setOutputFilename(`merged_${timestamp}.pdf`);
  }, []);
  
  // Handle preview click
  const handlePreviewClick = (fileId: string) => {
    setPreviewFileId(fileId);
  };
  
  // Handle merge button click
  const handleMergeClick = async () => {
    if (selectedForMerge.length < 2) {
      toast({
        variant: "destructive",
        title: "Merge Failed",
        description: "Select at least two files to merge",
      });
      return;
    }
    
    try {
      const result = await mergePdfs(selectedForMerge, outputFilename);
      
      if (result) {
        toast({
          title: "PDFs Merged Successfully",
          description: `Created ${outputFilename}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Merge Failed",
          description: "Failed to merge PDFs",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Merge Failed",
        description: "Failed to merge PDFs. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <MergeIcon className="h-6 w-6 mr-2 text-primary" />
          Merge PDFs
        </h1>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column - File Selection */}
        <div className="md:col-span-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select PDFs</CardTitle>
              <CardDescription>
                Choose files to combine into a single PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <UploadZone />
              ) : (
                <FileList 
                  mode="select"
                  onPreviewClick={handlePreviewClick}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Merge Options */}
        <div className="md:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>Merge Options</CardTitle>
              <CardDescription>
                Configure the output file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedForMerge.length > 0 ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Selected Files ({selectedForMerge.length})</h3>
                        <p className="text-xs text-muted-foreground">Files will be merged in this order</p>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                        {selectedForMerge.map((fileId, index) => {
                          const file = files.find(f => f.id === fileId);
                          if (!file) return null;
                          
                          return (
                            <div 
                              key={fileId}
                              className="p-3 bg-muted rounded-md flex items-center group relative"
                            >
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.totalPages} pages
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => toggleMergeSelection(fileId)}
                              >
                                <MoveVertical className="h-4 w-4" />
                                <span className="sr-only">Reorder</span>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="output-filename">Output Filename</Label>
                      <Input
                        id="output-filename"
                        value={outputFilename}
                        onChange={(e) => setOutputFilename(e.target.value)}
                        placeholder="merged.pdf"
                      />
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      className="w-full"
                      disabled={
                        isProcessing || 
                        selectedForMerge.length < 2
                      }
                      onClick={handleMergeClick}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <MergeIcon className="h-4 w-4 mr-2" />
                          Merge Files
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-12"
                    >
                      <FilesIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No files selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select at least two PDF files to merge
                      </p>
                      {files.length === 0 ? (
                        <Button
                          variant="outline"
                          onClick={() => router.push("/")}
                        >
                          Upload PDFs
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Use the checkboxes to select files from the list
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PreviewModal
        fileId={previewFileId}
        isOpen={!!previewFileId}
        onOpenChange={(open) => {
          if (!open) setPreviewFileId(null);
        }}
      />
    </>
  );
}