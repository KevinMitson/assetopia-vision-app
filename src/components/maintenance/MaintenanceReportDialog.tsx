import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { generateMaintenanceReport } from '@/lib/maintenanceService';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaintenanceReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: { id: string; full_name: string }[];
}

export function MaintenanceReportDialog({
  isOpen,
  onClose,
  users,
}: MaintenanceReportDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maintenanceType, setMaintenanceType] = useState<string>();
  const [technicianId, setTechnicianId] = useState<string>();

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const { records, error } = await generateMaintenanceReport({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        maintenanceType: maintenanceType as any,
        technicianId,
      });

      if (error) {
        throw new Error(error);
      }

      // Transform records for Excel export
      const excelData = records.map(record => ({
        'Asset Type': record.equipment_type,
        'Serial Number': record.serial_number,
        'Maintenance Type': record.maintenance_type,
        'Technician': record.technician_name,
        'Date Performed': new Date(record.date_performed).toLocaleDateString(),
        'Next Maintenance': record.next_maintenance_date 
          ? new Date(record.next_maintenance_date).toLocaleDateString()
          : 'Not Scheduled',
        'Issues Found': record.issues_found ? 'Yes' : 'No',
        'Issues Description': record.issues_description || '',
        'Parts Replaced': record.parts_replaced || '',
        'Software Updated': record.software_updated || '',
        'Time Spent (hours)': record.time_spent || 0,
        'Follow-up Required': record.followup_required ? 'Yes' : 'No',
        'Additional Comments': record.additional_comments || '',
      }));

      // Create workbook and add data
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add column widths
      const colWidths = [
        { wch: 15 }, // Asset Type
        { wch: 15 }, // Serial Number
        { wch: 15 }, // Maintenance Type
        { wch: 20 }, // Technician
        { wch: 15 }, // Date Performed
        { wch: 15 }, // Next Maintenance
        { wch: 10 }, // Issues Found
        { wch: 30 }, // Issues Description
        { wch: 20 }, // Parts Replaced
        { wch: 20 }, // Software Updated
        { wch: 15 }, // Time Spent
        { wch: 15 }, // Follow-up Required
        { wch: 30 }, // Additional Comments
      ];
      ws['!cols'] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Records');

      // Generate filename with date range
      const startStr = startDate ? startDate.toISOString().split('T')[0] : 'all';
      const endStr = endDate ? endDate.toISOString().split('T')[0] : 'current';
      const filename = `maintenance_report_${startStr}_to_${endStr}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);

      toast({
        title: 'Success',
        description: 'Report has been generated and downloaded.',
      });

      onClose();
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Maintenance Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Select start date"
            />
          </div>
          <div className="grid gap-2">
            <Label>End Date</Label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="Select end date"
            />
          </div>
          <div className="grid gap-2">
            <Label>Maintenance Type</Label>
            <Select
              value={maintenanceType}
              onValueChange={setMaintenanceType}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Preventive">Preventive</SelectItem>
                <SelectItem value="Corrective">Corrective</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Technician</Label>
            <Select
              value={technicianId}
              onValueChange={setTechnicianId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Technicians</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={generateReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 