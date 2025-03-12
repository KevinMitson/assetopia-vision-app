import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetAssignment } from '@/lib/assignmentService';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { UserCheck, Users, AlertTriangle, CheckCircle, Plus, ArrowLeftRight, Calendar } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAssignmentStatus, returnAsset } from '@/lib/assignmentService';
import { AssignAssetDialog } from './AssignAssetDialog';

interface AssignmentListProps {
  assetId?: string;
  userId?: string;
  assignments: AssetAssignment[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  users: { id: string; full_name: string }[];
  assets?: { id: string; name: string; asset_tag: string }[];
  showAssetInfo?: boolean;
}

export function AssignmentList({ 
  assetId,
  userId,
  assignments, 
  isLoading, 
  error, 
  onRefresh,
  users,
  assets,
  showAssetInfo = false
}: AssignmentListProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<AssetAssignment['status']>('Active');
  const [returnNotes, setReturnNotes] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (!selectedAssignment) return;
    
    try {
      setIsUpdating(true);
      
      const { success, error } = await updateAssignmentStatus(
        selectedAssignment.id,
        newStatus,
        returnNotes || undefined
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Assignment status updated to ${newStatus}`,
      });
      
      onRefresh();
      setShowStatusDialog(false);
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedAssignment) return;
    
    try {
      setIsUpdating(true);
      
      const { success, error } = await returnAsset(
        selectedAssignment.id,
        new Date().toISOString(),
        returnNotes || undefined
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Asset returned successfully",
      });
      
      onRefresh();
      setShowReturnDialog(false);
    } catch (error: any) {
      console.error('Error returning asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to return asset",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getAssignmentStatusBadge = (status: AssetAssignment['status']) => {
    switch (status) {
      case 'Active':
        return (
          <Badge variant="default">
            <UserCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'Returned':
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Returned
          </Badge>
        );
      case 'Overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'Lost':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Lost
          </Badge>
        );
      case 'Damaged':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Damaged
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getUserName = (userId: string) => {
    // First check if the assignment has the user name from the join
    const assignment = assignments.find(a => a.assigned_to === userId);
    if (assignment && assignment.assigned_to_name) {
      return assignment.assigned_to_name;
    }
    
    // Fall back to the users array
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown';
  };

  const getAssetName = (assetId: string) => {
    if (!assets) return 'Unknown';
    const asset = assets.find(a => a.id === assetId);
    return asset ? `${asset.name} (${asset.asset_tag})` : 'Unknown';
  };

  const canUpdateStatus = (assignment: AssetAssignment) => {
    return assignment.status !== 'Returned';
  };

  const canReturn = (assignment: AssetAssignment) => {
    return assignment.status === 'Active' || assignment.status === 'Overdue';
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>
              {userId ? 'User Assignments' : 'Asset Assignments'}
            </CardTitle>
            <CardDescription>
              {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'} found
            </CardDescription>
          </div>
          {assetId && (
            <Button onClick={() => setShowAssignDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Asset
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={onRefresh}
              >
                Try Again
              </Button>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>No assignments found.</p>
              {assetId && (
                <p className="text-sm">Click "Assign Asset" to assign this asset to a user.</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {showAssetInfo && <TableHead>Asset</TableHead>}
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Date Assigned</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      {showAssetInfo && (
                        <TableCell className="font-medium">
                          {getAssetName(assignment.asset_id)}
                        </TableCell>
                      )}
                      <TableCell>{getUserName(assignment.assigned_to)}</TableCell>
                      <TableCell>{getUserName(assignment.assigned_by)}</TableCell>
                      <TableCell>
                        {format(parseISO(assignment.assignment_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {assignment.expected_return_date 
                          ? format(parseISO(assignment.expected_return_date), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{getAssignmentStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          {canReturn(assignment) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setReturnNotes('');
                                    setShowReturnDialog(true);
                                  }}
                                  className="mr-1"
                                >
                                  <ArrowLeftRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Return Asset</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {canUpdateStatus(assignment) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setNewStatus(assignment.status === 'Active' ? 'Overdue' : 'Active');
                                    setReturnNotes('');
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Update Status</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {assetId && (
        <AssignAssetDialog
          isOpen={showAssignDialog}
          onClose={() => setShowAssignDialog(false)}
          onSuccess={onRefresh}
          assetId={assetId}
          users={users}
        />
      )}
      
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assignment Status</DialogTitle>
            <DialogDescription>
              Change the status of this assignment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as AssetAssignment['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Mark this asset as returned.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="return-notes">Return Notes</Label>
              <Textarea
                id="return-notes"
                placeholder="Add notes about the condition of the returned asset"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={isUpdating}>
              {isUpdating ? 'Processing...' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 