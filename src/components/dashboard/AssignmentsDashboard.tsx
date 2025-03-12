import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetAssignment, fetchActiveAssignments } from '@/lib/assignmentService';
import { fetchAllUsers, User } from '@/lib/userService';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { UserCheck, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AssignmentsDashboard() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: assignmentError } = await fetchActiveAssignments();
      
      if (assignmentError) {
        // Check if the error is related to the table not existing
        if (assignmentError.message && 
            (assignmentError.message.includes("relation") && 
             assignmentError.message.includes("does not exist"))) {
          console.warn("Asset assignments table does not exist yet");
          setAssignments([]);
          return;
        }
        throw new Error(assignmentError.message || "Failed to fetch assignments");
      }
      
      if (!data) {
        throw new Error("No assignment data returned");
      }
      
      setAssignments(data as AssetAssignment[]);
    } catch (err: any) {
      console.error('Error fetching active assignments:', err);
      setError(err.message || 'Failed to load active assignments');
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
    fetchAssignments();
    fetchUsers();
  }, []);

  const getAssignmentStatusBadge = (assignment: AssetAssignment) => {
    if (assignment.status === 'Overdue') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge variant="default">
          <UserCheck className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Active Assignments</CardTitle>
          <CardDescription>
            {assignments.length} {assignments.length === 1 ? 'asset' : 'assets'} currently assigned
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            // Check if the route exists in the application
            try {
              navigate('/assignments');
            } catch (err) {
              console.warn('Assignments page not available yet');
              // Fallback to assets page
              navigate('/assets');
            }
          }}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isLoadingUsers ? (
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
              onClick={fetchAssignments}
            >
              Try Again
            </Button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No active assignments found.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.slice(0, 5).map((assignment) => (
                  <TableRow 
                    key={assignment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/assets/${assignment.asset_id}`)}
                  >
                    <TableCell className="font-medium">Asset #{assignment.asset_id}</TableCell>
                    <TableCell>{getUserName(assignment.assigned_to)}</TableCell>
                    <TableCell>{format(parseISO(assignment.assignment_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {assignment.expected_return_date 
                        ? format(parseISO(assignment.expected_return_date), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getAssignmentStatusBadge(assignment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 