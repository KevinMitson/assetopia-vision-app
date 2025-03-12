import { useState, useEffect } from 'react';
import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { fetchAssetMaintenanceRecords, MaintenanceRecord } from '@/lib/maintenanceService';
import { fetchAllUsers, User } from '@/lib/userService';

interface AssetMaintenanceTabProps {
  assetId: string;
}

export function AssetMaintenanceTab({ assetId }: AssetMaintenanceTabProps) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

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
    <div className="space-y-6">
      <MaintenanceList
        assetId={assetId}
        records={maintenanceRecords}
        isLoading={isLoading || isLoadingUsers}
        error={error}
        onRefresh={fetchRecords}
        users={users}
      />
    </div>
  );
} 