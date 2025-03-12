import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { importUsers } from '@/lib/userService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserImportDialog({ isOpen, onClose, onSuccess }: UserImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an Excel or CSV file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Read the file and process the data
      const users = await readExcelFile(file);
      
      // Import the users
      const results = await importUsers(users);

      if (results.success > 0) {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${results.success} users. Failed: ${results.failed}`,
          variant: 'default',
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: 'Import failed',
          description: `Failed to import users: ${results.errors[0]}`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload an Excel or CSV file with user data. The file should have columns for Full Name, Email, Department, Designation, and Station.
            </p>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <input
                type="file"
                id="user-import"
                accept=".xlsx,.xls,.csv"
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:mr-4 file:rounded-md hover:file:bg-primary/90"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 