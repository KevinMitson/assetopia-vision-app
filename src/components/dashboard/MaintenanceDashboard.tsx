import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MaintenanceRecord, fetchUpcomingMaintenance } from '@/lib/maintenanceService';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { CalendarClock, Wrench, AlertTriangle, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MaintenanceDashboard() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { records, error } = await fetchUpcomingMaintenance();
      
      if (error) {
        // Check if the error is related to the table not existing
        if (error.includes("relation") && error.includes("does not exist")) {
          console.warn("Maintenance records table does not exist yet");
          setMaintenanceRecords([]);
          return;
        }
        throw new Error(error);
      }
      
      setMaintenanceRecords(records);
    } catch (err: any) {
      console.error('Error fetching upcoming maintenance:', err);
      setError(err.message || 'Failed to load upcoming maintenance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Upcoming Maintenance</CardTitle>
          <CardDescription>
            {maintenanceRecords.length} {maintenanceRecords.length === 1 ? 'record' : 'records'} scheduled
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            // Check if the route exists in the application
            try {
              navigate('/maintenance');
            } catch (err) {
              console.warn('Maintenance page not available yet');
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
              onClick={fetchRecords}
            >
              Try Again
            </Button>
          </div>
        ) : maintenanceRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No upcoming maintenance scheduled.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords.slice(0, 5).map((record) => (
                  <TableRow 
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/assets/${record.asset_id}`)}
                  >
                    <TableCell className="font-medium">Asset #{record.asset_id}</TableCell>
                    <TableCell>{record.maintenance_type}</TableCell>
                    <TableCell>
                      {record.next_maintenance_date 
                        ? format(parseISO(record.next_maintenance_date), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getMaintenanceStatusBadge(record)}</TableCell>
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