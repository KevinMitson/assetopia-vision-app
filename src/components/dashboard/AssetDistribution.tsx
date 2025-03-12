import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AssetCategory } from './types';

interface AssetDistributionProps {
  data: AssetCategory[];
  loading?: boolean;
}

export function AssetDistribution({ data, loading = false }: AssetDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Distribution</CardTitle>
        <CardDescription>Breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-[180px] h-[180px] rounded-full bg-secondary/50 animate-pulse flex items-center justify-center">
                <div className="w-[90px] h-[90px] rounded-full bg-background"></div>
              </div>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} assets`, 'Count']}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No asset data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
