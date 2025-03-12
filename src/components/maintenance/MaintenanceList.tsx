import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MaintenanceRecord } from '@/lib/maintenanceService';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { CalendarClock, Wrench, AlertTriangle, CheckCircle, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { MaintenanceAddDialog } from './MaintenanceAddDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMaintenanceRecord } from '@/lib/maintenanceService';
import { cn } from '@/lib/utils';

interface MaintenanceListProps {
  assetId: string;
  records: MaintenanceRecord[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  users: { id: string; full_name: string }[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
}

export function MaintenanceList({ 
  assetId, 
  records, 
  isLoading, 
  error, 
  onRefresh,
  users,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = 'No maintenance records found'
}: MaintenanceListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { success, error } = await deleteMaintenanceRecord(recordToDelete);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete maintenance record",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null);
    }
  };

  const getMaintenanceStatusBadge = (record: MaintenanceRecord) => {
    if (!record.next_maintenance_date) {
      return (
        <Badge variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    const nextDate = parseISO(record.next_maintenance_date);
    const today = new Date();
    const warningDate = addDays(today, 14); // 2 weeks from now
    
    if (isBefore(nextDate, today)) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    } else if (isBefore(nextDate, warningDate)) {
      return (
        <Badge variant="secondary">
          <Calendar className="h-3 w-3 mr-1" />
          Due Soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <CalendarClock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown';
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'destructive';
      case 'Corrective':
        return 'secondary';
      case 'Preventive':
        return 'outline';
      case 'Scheduled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Maintenance History</CardTitle>
            <CardDescription>
              {records.length} {records.length === 1 ? 'record' : 'records'} found
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Date Performed</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.equipment_type} - {record.serial_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMaintenanceTypeColor(record.maintenance_type) as any}>
                            {record.maintenance_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.technician_name}</TableCell>
                        <TableCell>{format(new Date(record.date_performed), 'PPP')}</TableCell>
                        <TableCell>
                          {record.next_maintenance_date
                            ? format(new Date(record.next_maintenance_date), 'PPP')
                            : 'Not scheduled'}
                        </TableCell>
                        <TableCell>
                          {record.next_maintenance_date && new Date(record.next_maintenance_date) < new Date() ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : record.next_maintenance_date ? (
                            <Badge variant="outline">Scheduled</Badge>
                          ) : (
                            <Badge>Completed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showAddDialog && (
        <MaintenanceAddDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={onRefresh}
          assetId={assetId}
          users={users}
        />
      )}
      
      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 