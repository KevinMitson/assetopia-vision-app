import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Station {
  id: string;
  name: string;
  assetsCount: number;
  utilization: number;
  status: 'operational' | 'maintenance' | 'issue';
  location: string; // Keeping this in the interface for data structure consistency
}

interface StationOverviewProps {
  stations: Station[];
  loading?: boolean;
}

const getStatusStyles = (status: Station['status']) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'issue':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// Skeleton row component for loading state
const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <div className="h-4 w-24 bg-secondary animate-pulse rounded-md"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-12 bg-secondary animate-pulse rounded-md"></div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <div className="h-2 w-full bg-secondary animate-pulse rounded-md"></div>
        <div className="h-4 w-8 bg-secondary animate-pulse rounded-md"></div>
      </div>
    </TableCell>
    <TableCell className="text-right">
      <div className="h-6 w-24 bg-secondary animate-pulse rounded-md ml-auto"></div>
    </TableCell>
  </TableRow>
);

export function StationOverview({ stations, loading = false }: StationOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Station Overview</CardTitle>
        <CardDescription>Asset usage across all stations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station Name</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton rows when loading
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : stations.length > 0 ? (
              // Show station data when loaded
              stations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell>{station.assetsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={station.utilization} className="h-2" />
                      <span className="text-xs">{station.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getStatusStyles(station.status)}>
                      {station.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Show message when no stations
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No stations available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
