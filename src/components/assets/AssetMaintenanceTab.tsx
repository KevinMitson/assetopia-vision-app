import { useState, useEffect } from 'react';
import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { MaintenanceAddDialog } from '@/components/maintenance/MaintenanceAddDialog';
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm';
import { Button } from '@/components/ui/button';
import { fetchAssetMaintenanceRecords, MaintenanceRecord } from '@/lib/maintenanceService';
import { fetchAllUsers } from '@/lib/userService';
import { User } from '@/types';
import { PlusCircle, Wrench } from 'lucide-react';

interface AssetMaintenanceTabProps {
  assetId: string;
}

export function AssetMaintenanceTab({ assetId }: AssetMaintenanceTabProps) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFullFormOpen, setIsFullFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { records, error } = await fetchAssetMaintenanceRecords(assetId);
      
      if (error) {
        throw new Error(error);
      }
      
      setMaintenanceRecords(records);
    } catch (err: any) {
      console.error('Error fetching maintenance records:', err);
      setError(err.message || 'Failed to load maintenance records');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      const { users, error } = await fetchAllUsers();
      
      if (error) {
        throw new Error(error);
      }
      
      setUsers(users);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      // We don't set an error state here as it's not critical for the UI
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchUsers();
  }, [assetId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Maintenance History</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFullFormOpen(true)}
            className="flex items-center gap-1"
          >
            <Wrench className="h-4 w-4" />
            Conduct Full Maintenance
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>
      
      <MaintenanceList
        records={maintenanceRecords}
        isLoading={isLoading || isLoadingUsers}
        error={error}
        onRefresh={fetchRecords}
        users={users}
        currentPage={currentPage}
        totalPages={1} // Replace with actual calculation if you have pagination
        onPageChange={setCurrentPage}
        assetId={assetId}
      />
      
      {isAddDialogOpen && (
        <MaintenanceAddDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={fetchRecords}
          assetId={assetId}
          users={users}
        />
      )}
      
      {isFullFormOpen && (
        <MaintenanceForm
          isOpen={isFullFormOpen}
          onClose={() => setIsFullFormOpen(false)}
          onSuccess={fetchRecords}
          users={users}
        />
      )}
    </div>
  );
} 