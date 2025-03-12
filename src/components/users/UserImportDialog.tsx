import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { importUsers } from '@/lib/userService';

interface UserImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserImportDialog({ isOpen, onClose, onSuccess }: UserImportDialogProps) {
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
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel or CSV file (.xlsx, .xls, .csv)",
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
        description: "Could not read the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('No data found in file');
          }

          let workbook;
          if (file.name.endsWith('.csv')) {
            // Handle CSV files
            workbook = XLSX.read(data, { type: 'binary', raw: true });
          } else {
            // Handle Excel files
            workbook = XLSX.read(data, { type: 'binary' });
          }

          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error('No sheets found in workbook');
          }

          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            throw new Error('Sheet is empty');
          }

          // First, get the raw JSON data with header row
          const rawData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: ''
          });

          if (!Array.isArray(rawData) || rawData.length === 0) {
            throw new Error('No valid data found in file');
          }

          console.log('Raw data from Excel:', rawData[0]); // Log first row to see column names

          // Define column name mappings (case-insensitive)
          const columnMappings: Record<string, string[]> = {
            full_name: ['Full Name', 'Name', 'User Name', 'User', 'Employee Name', 'FullName', 'Employee'],
            email: ['Email', 'Email Address', 'Mail', 'E-mail'],
            department: ['Department', 'Dept', 'Department Name', 'DepartmentName'],
            designation: ['Designation', 'Position', 'Title', 'Job Title', 'Role'],
            station: ['Station', 'Location', 'Site', 'Branch'],
            phone: ['Phone', 'Contact', 'Phone Number', 'Mobile', 'Tel']
          };

          // Map the data to our expected format
          const mappedData = rawData.map((row: any) => {
            const mappedRow: Record<string, string> = {};
            
            // Convert all keys to lowercase for case-insensitive matching
            const rowLowerCase: Record<string, any> = {};
            Object.keys(row).forEach(key => {
              rowLowerCase[key.toLowerCase()] = row[key];
            });

            // For each field we want to capture
            Object.entries(columnMappings).forEach(([field, possibleNames]) => {
              // Try each possible column name (case-insensitive)
              for (const name of possibleNames) {
                const value = rowLowerCase[name.toLowerCase()];
                if (value !== undefined && value !== '') {
                  mappedRow[field] = String(value).trim();
                  break;
                }
              }
            });

            console.log('Mapped row:', mappedRow); // Log mapped data for debugging

            return mappedRow;
          });

          // Filter out rows without a full name
          const validData = mappedData.filter(row => {
            const isValid = !!row.full_name;
            if (!isValid) {
              console.log('Invalid row (no full name):', row);
            }
            return isValid;
          });

          if (validData.length === 0) {
            throw new Error('No valid users found. Each row must have a full name.');
          }

          resolve(validData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      setProgress(10);
      
      // Read the Excel file
      const excelData = await readExcelFile(file);
      setProgress(30);
      
      // Convert the file to ArrayBuffer for the importUsers function
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error('Failed to read file');
          }

          setProgress(50);
          
          // Import users into database using our service function
          const result = await importUsers(arrayBuffer);
          setProgress(100);
          
          // Update status
          setImportStatus({
            ...importStatus,
            success: result.success,
            imported: result.results?.successful || 0,
            errors: result.results?.failed || 0,
            errorDetails: result.results?.errors || [],
            previewData: excelData.slice(0, 5)
          });
          
          // Show toast notification
          if (result.success) {
            toast({
              title: "Import Successful",
              description: `Successfully imported ${result.results?.successful} users with ${result.results?.failed} errors.`,
            });
            
            // Call onSuccess callback if provided
            if (onSuccess) {
              onSuccess();
            }
          } else {
            toast({
              title: "Import Failed",
              description: result.error || "Failed to import users. Please check the error details.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error processing file:', error);
          toast({
            title: "Import Error",
            description: error.message || "An unexpected error occurred during import.",
            variant: "destructive",
          });
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          title: "Import Error",
          description: "Failed to read the file.",
          variant: "destructive",
        });
      };
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Error",
        description: error.message || "An unexpected error occurred during import.",
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
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with your user data. The system will map the columns to the appropriate fields.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!importStatus.success && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel-file">Excel/CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload an Excel or CSV file with columns for User, Designation, Department, etc.
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
                  <p>Successfully imported {importStatus.imported} users with {importStatus.errors} errors.</p>
                ) : (
                  <p>Failed to import users. Please check the error details.</p>
                )}
                
                {importStatus.errorDetails && importStatus.errorDetails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Error Details:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {importStatus.errorDetails.slice(0, 5).map((error, index) => (
                        <li key={index}>
                          {error.user ? `User ${error.user}: ` : ''}{error.error}
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
        
        <DialogFooter>
          {!importStatus.success ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || isLoading}>
                {isLoading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Users
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 