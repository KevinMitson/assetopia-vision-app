
import { ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
  station: string;
  type: 'create' | 'update' | 'delete' | 'transfer' | 'maintenance';
}

const getActivityTypeStyles = (type: ActivityItem['type']) => {
  switch (type) {
    case 'create':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'transfer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

interface ActivityLogProps {
  activities: ActivityItem[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across all stations</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 px-6 py-2 hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-muted-foreground text-sm">{activity.action}</span>
                  <span className="font-medium">{activity.target}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.timestamp}</span>
                  <span>•</span>
                  <span>{activity.station}</span>
                </div>
              </div>
              
              <Badge 
                className={getActivityTypeStyles(activity.type)}
                variant="outline"
              >
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
