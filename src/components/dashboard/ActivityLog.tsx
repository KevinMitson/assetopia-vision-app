
import { ActivityItem } from './types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface ActivityLogProps {
  activities: ActivityItem[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  // Helper function to get activity type color
  const getActivityTypeColor = (type: string) => {
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
      case 'issue':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across stations</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-auto">
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="relative mr-4 flex h-11 w-11 flex-none items-center justify-center rounded-full bg-muted">
                <span className="font-medium">
                  {activity.user.initials}
                </span>
                <span className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background p-1 ${getActivityTypeColor(activity.type)}`}></span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  <span className="font-semibold">{activity.user.name}</span> {activity.action} {activity.target}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.timestamp}</span>
                  <span>•</span>
                  <span>{activity.station}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
