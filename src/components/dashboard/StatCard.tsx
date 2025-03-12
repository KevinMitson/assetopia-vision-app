import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon, description, trend, className, loading = false }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:card-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <div className="h-8 w-24 bg-secondary animate-pulse rounded-md"></div>
            <div className="mt-1 h-4 w-32 bg-secondary/50 animate-pulse rounded-md"></div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold animate-fadeIn">{value}</div>
            {(description || trend) && (
              <div className="mt-1 flex items-center text-xs">
                {trend && (
                  <span className={cn(
                    "mr-1 text-xs font-medium",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                )}
                {description && (
                  <span className="text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
