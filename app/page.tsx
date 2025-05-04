"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scissors, MergeIcon, ArrowRight } from "lucide-react";

import UploadZone from "@/components/upload-zone";
import FileList from "@/components/file-list";
import { Button } from "@/components/ui/button";
import { usePdfStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEntry } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { files, setCurrentOperation } = usePdfStore();
  const [showFiles, setShowFiles] = useState(false);
  
  // Handle navigation to feature pages
  const handleNavigation = (route: string, operation: 'split' | 'merge') => {
    setCurrentOperation(operation);
    router.push(route);
  };
  
  // Handle file uploads
  const handleFilesAdded = (newFiles: FileEntry[]) => {
    // Show file list when files are added
    setShowFiles(true);
  };
  
  // Handle operation clicks from the file list
  const handleSplitClick = (fileId: string) => {
    setCurrentOperation('split');
    router.push('/split');
  };
  
  const handleMergeClick = (fileId: string) => {
    setCurrentOperation('merge');
    router.push('/merge');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <section className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 gradient-text">
            Easy PDF Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Split and merge your PDF files with our simple online tools. No installation required.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <UploadZone 
            onFilesAdded={handleFilesAdded}
            className="max-w-2xl mx-auto"
          />
        </motion.div>
        
        {showFiles && files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold mb-4">Your Files</h2>
            <FileList 
              onSplitClick={handleSplitClick}
              onMergeClick={handleMergeClick}
            />
          </motion.div>
        )}
      </section>
      
      <section className="grid md:grid-cols-2 gap-6 mb-12">
        {[
          {
            title: "Split PDF",
            description: "Extract specific pages or split a PDF into multiple files",
            icon: Scissors,
            color: "chart-1",
            route: "/split",
            operation: "split" as const,
          },
          {
            title: "Merge PDFs",
            description: "Combine multiple PDF files into a single document",
            icon: MergeIcon,
            color: "chart-2",
            route: "/merge",
            operation: "merge" as const,
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Card 
              className="h-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleNavigation(feature.route, feature.operation)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}/20 flex items-center justify-center mb-2`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  );
}