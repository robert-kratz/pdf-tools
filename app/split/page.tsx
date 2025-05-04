'use client';

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Scissors, 
  FileDown, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Images
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

export default function SplitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { files, setCurrentOperation } = usePdfStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [parsedRanges, setParsedRanges] = useState<number[][]>([]);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const { splitPdf, isProcessing, error } = usePdfProcessor();
  
  // Set current operation
  useEffect(() => {
    setCurrentOperation("split");
  }, [setCurrentOperation]);
  
  // Get selected file
  const selectedFile = selectedFileId 
    ? files.find(f => f.id === selectedFileId) 
    : null;
  
  // Parse range input
  useEffect(() => {
    if (!rangeInput.trim()) {
      setParsedRanges([]);
      setRangeError(null);
      return;
    }
    
    try {
      // Split by commas and parse each part
      const ranges = rangeInput
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);
      
      const parsedRanges: number[][] = [];
      
      for (const range of ranges) {
        // Check if range (e.g., "1-5")
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(num => parseInt(num, 10));
          
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid range: ${range}`);
          }
          
          if (start > end) {
            throw new Error(`Start page cannot be greater than end page: ${range}`);
          }
          
          // Create array of pages in range
          const pages = [];
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
          
          parsedRanges.push(pages);
        } else {
          // Single page
          const page = parseInt(range, 10);
          
          if (isNaN(page)) {
            throw new Error(`Invalid page number: ${range}`);
          }
          
          parsedRanges.push([page]);
        }
      }
      
      setParsedRanges(parsedRanges);
      setRangeError(null);
    } catch (err: any) {
      setParsedRanges([]);
      setRangeError(err.message);
    }
  }, [rangeInput]);
  
  // Handle file selection from the list
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
  };
  
  // Handle preview click
  const handlePreviewClick = (fileId: string) => {
    setPreviewFileId(fileId);
  };
  
  // Handle split button click
  const handleSplitClick = async () => {
    if (!selectedFileId || parsedRanges.length === 0) {
      return;
    }
    
    try {
      const results = await splitPdf(selectedFileId, parsedRanges);
      
      if (results) {
        toast({
          title: "PDF Split Complete",
          description: `Created ${parsedRanges.length} file${parsedRanges.length > 1 ? 's' : ''}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Split Failed",
          description: "No valid pages to extract",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Split Failed",
        description: "Failed to split PDF. Please try again.",
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
          <Scissors className="h-6 w-6 mr-2 text-primary" />
          Split PDF
        </h1>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column - File Selection */}
        <div className="md:col-span-5">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select PDF</CardTitle>
              <CardDescription>
                Choose a file to split into multiple PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <UploadZone />
              ) : (
                <FileList 
                  onSplitClick={handleFileSelect}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Split Options */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Split Options</CardTitle>
              <CardDescription>
                Define page ranges to extract
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFile ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Selected File:</h3>
                    <div className="p-3 bg-muted rounded-md flex items-center">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                        <FileDown className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFile.totalPages} pages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFileId(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="page-range" className="text-sm font-medium block mb-2">
                        Page Ranges:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="page-range"
                          placeholder="e.g., 1-3, 5, 7-9"
                          value={rangeInput}
                          onChange={(e) => setRangeInput(e.target.value)}
                          className={rangeError ? "border-destructive" : ""}
                        />
                        <Button
                          variant="outline"
                          onClick={() => handlePreviewClick(selectedFile.id)}
                        >
                          <Images className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      
                      {rangeError && (
                        <p className="text-xs text-destructive mt-1">
                          {rangeError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter page numbers (e.g., 1,2,3) or ranges (e.g., 1-3) separated by commas
                      </p>
                    </div>
                    
                    {parsedRanges.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Pages to extract:</h4>
                        <div className="flex flex-wrap gap-2">
                          {parsedRanges.map((range, index) => (
                            <div 
                              key={index} 
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                            >
                              {range.length === 1 
                                ? `Page ${range[0]}` 
                                : `Pages ${range[0]}-${range[range.length - 1]}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      className="w-full mt-4"
                      disabled={
                        isProcessing || 
                        parsedRanges.length === 0 || 
                        !!rangeError
                      }
                      onClick={handleSplitClick}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Scissors className="h-4 w-4 mr-2" />
                          Split PDF
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-12"
                  >
                    <FileDown className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No file selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Please select a PDF file to split
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                    >
                      Upload PDF
                    </Button>
                  </motion.div>
                </AnimatePresence>
              )}
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