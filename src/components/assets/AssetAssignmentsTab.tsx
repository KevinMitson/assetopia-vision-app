import { useState, useEffect } from 'react';
import { AssignmentList } from '@/components/assignments/AssignmentList';
import { fetchAssetAssignments } from '@/lib/assignmentService';
import { fetchAllUsers } from '@/lib/userService';

interface AssetAssignmentsTabProps {
  assetId: string;
}

export function AssetAssignmentsTab({ assetId }: AssetAssignmentsTabProps) {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchAssignmentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { assignments: assignmentData, error: assignmentError } = await fetchAssetAssignments(assetId);
      
      if (assignmentError) {
        throw new Error(assignmentError);
      }
      
      setAssignments(assignmentData);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to load assignment history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      const { users: userData, error: userError } = await fetchAllUsers();
      
      if (userError) {
        throw new Error(userError);
      }
      
      setUsers(userData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      // We don't set an error state here as it's not critical for the UI
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
    fetchUsers();
  }, [assetId]);

  return (
    <div className="space-y-6">
      <AssignmentList
        assetId={assetId}
        assignments={assignments}
        isLoading={isLoading || isLoadingUsers}
        error={error}
        onRefresh={fetchAssignmentData}
        users={users}
      />
    </div>
  );
} 