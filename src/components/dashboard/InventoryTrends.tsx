import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ChartDataPoint } from './types';

interface InventoryTrendsProps {
  dailyData: ChartDataPoint[];
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
  loading?: boolean;
}

export function InventoryTrends({ dailyData, weeklyData, monthlyData, loading = false }: InventoryTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Trends</CardTitle>
        <CardDescription>Asset movement over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] w-full">
            <div className="h-8 w-48 mb-4 flex space-x-2">
              <div className="h-8 w-16 bg-secondary/50 animate-pulse rounded-md"></div>
              <div className="h-8 w-16 bg-secondary/50 animate-pulse rounded-md"></div>
              <div className="h-8 w-16 bg-secondary/50 animate-pulse rounded-md"></div>
            </div>
            <div className="h-[300px] w-full bg-secondary/30 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <Tabs defaultValue="monthly">
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <ChartContent data={dailyData} />
            </TabsContent>
            <TabsContent value="weekly">
              <ChartContent data={weeklyData} />
            </TabsContent>
            <TabsContent value="monthly">
              <ChartContent data={monthlyData} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function ChartContent({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="var(--muted-foreground)"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="var(--muted-foreground)"
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="acquisitions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="disposals" 
            stroke="#ef4444" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="transfers" 
            stroke="#8b5cf6" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
