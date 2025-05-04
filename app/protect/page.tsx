"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  FileDown, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  FileQuestion,
  Eye,
  EyeOff
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProtectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { files, setCurrentOperation } = usePdfStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState("add");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { protectPdf, isProcessing, error } = usePdfProcessor();
  
  // Set current operation
  useEffect(() => {
    setCurrentOperation("protect");
  }, [setCurrentOperation]);
  
  // Get selected file
  const selectedFile = selectedFileId 
    ? files.find(f => f.id === selectedFileId) 
    : null;
  
  // Validate password
  useEffect(() => {
    if (tabValue === "add") {
      if (newPassword && newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters");
      } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
  }, [newPassword, confirmPassword, tabValue]);
  
  // Handle file selection from the list
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
    
    // Reset form
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
    setPasswordError(null);
    
    // Determine tab based on file protection status
    const file = files.find(f => f.id === fileId);
    if (file?.isPasswordProtected) {
      setTabValue("remove");
    } else {
      setTabValue("add");
    }
  };
  
  // Handle preview click
  const handlePreviewClick = (fileId: string) => {
    setPreviewFileId(fileId);
  };
  
  // Handle protect/unprotect button click
  const handleProtectClick = async () => {
    if (!selectedFileId) {
      return;
    }
    
    try {
      if (tabValue === "add") {
        // Validate password
        if (newPassword.length < 8) {
          setPasswordError("Password must be at least 8 characters");
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setPasswordError("Passwords do not match");
          return;
        }
        
        // Add password protection
        const result = await protectPdf(
          selectedFileId, 
          { newPassword }
        );
        
        if (result) {
          toast({
            title: "Password Protection Added",
            description: "Your PDF has been protected with a password",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Protection Failed",
            description: "Failed to add password protection",
          });
        }
      } else {
        // Remove password protection
        const result = await protectPdf(
          selectedFileId, 
          { currentPassword }
        );
        
        if (result) {
          toast({
            title: "Password Protection Removed",
            description: "Your PDF's password protection has been removed",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Protection Removal Failed",
            description: "Failed to remove password protection. Check your password.",
          });
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "Failed to process the PDF. Please try again.",
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
          <ShieldAlert className="h-6 w-6 mr-2 text-primary" />
          Protect PDF
        </h1>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column - File Selection */}
        <div className="md:col-span-5">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select PDF</CardTitle>
              <CardDescription>
                Choose a file to add or remove password protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <UploadZone />
              ) : (
                <FileList 
                  onProtectClick={handleFileSelect}
                  onPreviewClick={handlePreviewClick}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Protection Options */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Protection Options</CardTitle>
              <CardDescription>
                Add or remove password protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFile ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Selected File:</h3>
                    <div className="p-3 bg-muted rounded-md flex items-center">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                        <FileDown className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          {selectedFile.isPasswordProtected ? (
                            <>
                              <Lock className="h-3 w-3 text-amber-500 mr-1" />
                              <span>Password protected</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              <span>No password protection</span>
                            </>
                          )}
                        </div>
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
                  
                  <Tabs 
                    value={tabValue} 
                    onValueChange={setTabValue}
                    className="mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="add">Add Password</TabsTrigger>
                      <TabsTrigger 
                        value="remove"
                        disabled={!selectedFile.isPasswordProtected}
                      >
                        Remove Password
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="add" className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter a secure password"
                            className={passwordError ? "border-destructive" : ""}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className={passwordError ? "border-destructive" : ""}
                        />
                        {passwordError && (
                          <p className="text-xs text-destructive">
                            {passwordError}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="remove" className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    className="w-full"
                    disabled={
                      isProcessing || 
                      (tabValue === "add" && (!newPassword || !confirmPassword || !!passwordError)) ||
                      (tabValue === "remove" && !currentPassword)
                    }
                    onClick={handleProtectClick}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : tabValue === "add" ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Add Protection
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Remove Protection
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
                    <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No file selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Please select a PDF file to protect or unprotect
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