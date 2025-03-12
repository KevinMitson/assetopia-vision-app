import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { readExcelFile, mapExcelToDbFields, importAssetsToDb } from '@/utils/importUtils';

interface ImportAssetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportAssetsDialog({ isOpen, onClose, onSuccess }: ImportAssetsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    imported?: number;
    errors?: number;
    errorDetails?: any[];
    previewData?: any[];
  }>({});
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if it's an Excel file
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setImportStatus({});
      
      // Preview the data
      handlePreviewData(selectedFile);
    }
  };

  const handlePreviewData = async (selectedFile: File) => {
    try {
      setIsLoading(true);
      
      // Read the Excel file
      const excelData = await readExcelFile(selectedFile);
      
      // Show preview of first 5 rows
      setImportStatus({
        ...importStatus,
        previewData: excelData.slice(0, 5)
      });
    } catch (error) {
      console.error('Error previewing data:', error);
      toast({
        title: "Error previewing data",
        description: "Could not read the Excel file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      setProgress(10);
      
      // Read the Excel file
      const excelData = await readExcelFile(file);
      setProgress(30);
      
      // Map Excel data to database fields
      const mappedData = mapExcelToDbFields(excelData);
      setProgress(50);
      
      // Import data into database
      const result = await importAssetsToDb(mappedData);
      setProgress(100);
      
      // Update status
      setImportStatus({
        ...importStatus,
        success: result.success,
        imported: result.imported,
        errors: result.errors,
        errorDetails: result.errorDetails
      });
      
      // Show toast notification
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.imported} assets with ${result.errors} errors.`,
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import assets. Please check the error details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Error",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setImportStatus({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Assets from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file with your asset data. The system will map the columns to the appropriate fields.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!importStatus.success && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel-file">Excel File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload an Excel file (.xlsx or .xls) with your asset data
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {progress < 100 ? 'Processing...' : 'Completed'}
              </p>
            </div>
          )}
          
          {importStatus.previewData && importStatus.previewData.length > 0 && !importStatus.success && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Data Preview (First 5 rows):</h3>
              <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(importStatus.previewData[0]).slice(0, 5).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {importStatus.previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.keys(row).slice(0, 5).map((key) => (
                          <td key={key} className="px-3 py-2 text-xs">
                            {String(row[key]).substring(0, 30)}
                            {String(row[key]).length > 30 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Only showing first 5 columns for preview
              </p>
            </div>
          )}
          
          {importStatus.success !== undefined && (
            <Alert variant={importStatus.success ? "default" : "destructive"}>
              {importStatus.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {importStatus.success ? "Import Successful" : "Import Failed"}
              </AlertTitle>
              <AlertDescription>
                {importStatus.success ? (
                  <p>Successfully imported {importStatus.imported} assets with {importStatus.errors} errors.</p>
                ) : (
                  <p>Failed to import assets. Please check the error details.</p>
                )}
                
                {importStatus.errorDetails && importStatus.errorDetails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Error Details:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {importStatus.errorDetails.slice(0, 5).map((error, index) => (
                        <li key={index}>
                          {error.asset ? `Asset ${error.asset}: ` : ''}{error.error}
                        </li>
                      ))}
                      {importStatus.errorDetails.length > 5 && (
                        <li>...and {importStatus.errorDetails.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-2">
          <Button variant="outline" onClick={handleClose}>
            {importStatus.success ? 'Close' : 'Cancel'}
          </Button>
          
          {!importStatus.success && file && (
            <Button onClick={handleImport} disabled={isLoading || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Importing...' : 'Import Data'}
            </Button>
          )}
          
          {importStatus.success && (
            <Button onClick={resetForm}>
              Import Another File
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 