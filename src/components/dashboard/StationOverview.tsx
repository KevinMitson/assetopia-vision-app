
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
  location: string;
}

interface StationOverviewProps {
  stations: Station[];
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

export function StationOverview({ stations }: StationOverviewProps) {
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
            {stations.map((station) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
