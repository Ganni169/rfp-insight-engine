"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isLoading) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    [isLoading]
  );

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative overflow-hidden group w-full p-8 md:p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isDragActive ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(172,130,255,0.2)]" : "border-muted bg-card hover:bg-muted/50 hover:border-primary/50"
      } ${isLoading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ minHeight: "300px" }}
    >
      <input {...getInputProps()} />
      
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary/60" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold tracking-tight text-primary">Processing RFP...</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
              Shredding document into chunks and mapping compliance limits.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4 w-full"
        >
          <div className={`p-4 rounded-full transition-all duration-300 ${selectedFile ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20'}`}>
            {selectedFile ? <CheckCircle2 className="w-12 h-12" /> : <UploadCloud className="w-12 h-12" />}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-center">
            {selectedFile ? "Document Ready" : "Select RFP PDF"}
          </h3>
          <p className="text-muted-foreground text-center text-sm px-4">
            {selectedFile ? (
              <span className="font-medium text-foreground">{selectedFile.name}</span>
            ) : (
              "Drag & drop a file here, or click to browse files."
            )}
          </p>
          
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 w-full"
              >
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full font-bold text-md shadow-lg shadow-primary/20"
                  size="lg"
                >
                  Start Analysis Engine
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
