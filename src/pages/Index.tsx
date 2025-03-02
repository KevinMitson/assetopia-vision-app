
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { StationOverview } from '@/components/dashboard/StationOverview';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { InventoryTrends } from '@/components/dashboard/InventoryTrends';
import { Package, AlertTriangle, Truck, Users, Check, Wrench, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data
const assetDistributionData = [
  { name: 'IT Equipment', value: 1856, color: '#3b82f6' },
  { name: 'Vehicles', value: 342, color: '#8b5cf6' },
  { name: 'Security', value: 723, color: '#10b981' },
  { name: 'Signage', value: 529, color: '#f59e0b' },
  { name: 'Furniture', value: 984, color: '#ef4444' },
];

const stations = [
  { id: '1', name: 'Terminal 1', assetsCount: 1245, utilization: 78, status: 'operational', location: 'Main Building' },
  { id: '2', name: 'Terminal 2', assetsCount: 983, utilization: 65, status: 'operational', location: 'East Wing' },
  { id: '3', name: 'Terminal 3', assetsCount: 1478, utilization: 85, status: 'operational', location: 'North Wing' },
  { id: '4', name: 'Cargo Terminal', assetsCount: 742, utilization: 92, status: 'issue', location: 'South Wing' },
  { id: '5', name: 'Maintenance Hub', assetsCount: 389, utilization: 54, status: 'maintenance', location: 'West Wing' },
];

const activities = [
  {
    id: '1',
    user: { name: 'Marcus Chen', initials: 'MC' },
    action: 'transferred',
    target: '5 baggage scanners to Terminal 2',
    timestamp: '10 minutes ago',
    station: 'Terminal 1',
    type: 'transfer'
  },
  {
    id: '2',
    user: { name: 'Sarah Johnson', initials: 'SJ' },
    action: 'marked',
    target: 'security cameras for maintenance',
    timestamp: '45 minutes ago',
    station: 'Terminal 3',
    type: 'maintenance'
  },
  {
    id: '3',
    user: { name: 'David Wong', initials: 'DW' },
    action: 'added',
    target: '12 new information kiosks to inventory',
    timestamp: '2 hours ago',
    station: 'Terminal 2',
    type: 'create'
  },
  {
    id: '4',
    user: { name: 'Lisa Park', initials: 'LP' },
    action: 'updated',
    target: 'vehicle maintenance schedule',
    timestamp: '5 hours ago',
    station: 'Cargo Terminal',
    type: 'update'
  },
  {
    id: '5',
    user: { name: 'Michael Torres', initials: 'MT' },
    action: 'deleted',
    target: 'obsolete signage from inventory',
    timestamp: '1 day ago',
    station: 'Terminal 1',
    type: 'delete'
  },
];

// Chart data
const dailyData = [
  { date: 'Mon', acquisitions: 12, disposals: 5, transfers: 8 },
  { date: 'Tue', acquisitions: 19, disposals: 7, transfers: 13 },
  { date: 'Wed', acquisitions: 15, disposals: 8, transfers: 21 },
  { date: 'Thu', acquisitions: 22, disposals: 6, transfers: 17 },
  { date: 'Fri', acquisitions: 28, disposals: 9, transfers: 14 },
  { date: 'Sat', acquisitions: 10, disposals: 3, transfers: 5 },
  { date: 'Sun', acquisitions: 8, disposals: 2, transfers: 3 },
];

const weeklyData = [
  { date: 'Week 1', acquisitions: 45, disposals: 18, transfers: 37 },
  { date: 'Week 2', acquisitions: 62, disposals: 24, transfers: 53 },
  { date: 'Week 3', acquisitions: 58, disposals: 21, transfers: 49 },
  { date: 'Week 4', acquisitions: 71, disposals: 19, transfers: 62 },
];

const monthlyData = [
  { date: 'Jan', acquisitions: 165, disposals: 78, transfers: 142 },
  { date: 'Feb', acquisitions: 190, disposals: 85, transfers: 162 },
  { date: 'Mar', acquisitions: 210, disposals: 95, transfers: 185 },
  { date: 'Apr', acquisitions: 185, disposals: 80, transfers: 168 },
  { date: 'May', acquisitions: 195, disposals: 90, transfers: 173 },
  { date: 'Jun', acquisitions: 220, disposals: 105, transfers: 198 },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage airport assets across all stations</p>
          </div>
          <div className="flex items-center gap-4">
            <Tabs defaultValue="all">
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">All Stations</TabsTrigger>
                <TabsTrigger value="terminal1" className="text-xs">Terminal 1</TabsTrigger>
                <TabsTrigger value="terminal2" className="text-xs">Terminal 2</TabsTrigger>
                <TabsTrigger value="terminal3" className="text-xs">Terminal 3</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button>Generate Report</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Assets" 
            value="4,434" 
            icon={<Package size={16} />}
            description="Across all stations"
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard 
            title="Maintenance Required" 
            value="67" 
            icon={<Wrench size={16} />}
            description="Scheduled for next week"
            trend={{ value: 2.1, isPositive: false }}
          />
          <StatCard 
            title="Transfers in Progress" 
            value="23" 
            icon={<Truck size={16} />}
            description="Between stations"
          />
          <StatCard 
            title="Personnel Access" 
            value="318" 
            icon={<Users size={16} />}
            description="Active employees"
            trend={{ value: 1.8, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AssetDistribution data={assetDistributionData} />
          <InventoryTrends 
            dailyData={dailyData}
            weeklyData={weeklyData}
            monthlyData={monthlyData}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Asset Status Overview</CardTitle>
              <CardDescription>Current status of all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-700">
                      <Check size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Operational</p>
                      <p className="text-sm text-muted-foreground">Assets in use and functioning</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">3,842</div>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-2 text-yellow-700">
                      <Wrench size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Under Maintenance</p>
                      <p className="text-sm text-muted-foreground">Assets being serviced</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">478</div>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-2 text-red-700">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Issues Reported</p>
                      <p className="text-sm text-muted-foreground">Assets with known problems</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">114</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ActivityLog activities={activities} />
        </div>

        <StationOverview stations={stations} />
      </div>
    </Layout>
  );
};

export default Index;
