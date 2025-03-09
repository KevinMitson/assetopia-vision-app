
import { useState } from 'react';
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

// Mock data for each station
const stationAssetDistributions = {
  all: [
    { name: 'IT Equipment', value: 1856, color: '#3b82f6' },
    { name: 'Vehicles', value: 342, color: '#8b5cf6' },
    { name: 'Security', value: 723, color: '#10b981' },
    { name: 'Signage', value: 529, color: '#f59e0b' },
    { name: 'Furniture', value: 984, color: '#ef4444' },
  ],
  hq: [
    { name: 'IT Equipment', value: 490, color: '#3b82f6' },
    { name: 'Vehicles', value: 85, color: '#8b5cf6' },
    { name: 'Security', value: 220, color: '#10b981' },
    { name: 'Signage', value: 150, color: '#f59e0b' },
    { name: 'Furniture', value: 300, color: '#ef4444' },
  ],
  kkia: [
    { name: 'IT Equipment', value: 380, color: '#3b82f6' },
    { name: 'Vehicles', value: 72, color: '#8b5cf6' },
    { name: 'Security', value: 175, color: '#10b981' },
    { name: 'Signage', value: 115, color: '#f59e0b' },
    { name: 'Furniture', value: 241, color: '#ef4444' },
  ],
  smkia: [
    { name: 'IT Equipment', value: 550, color: '#3b82f6' },
    { name: 'Vehicles', value: 95, color: '#8b5cf6' },
    { name: 'Security', value: 210, color: '#10b981' },
    { name: 'Signage', value: 180, color: '#f59e0b' },
    { name: 'Furniture', value: 443, color: '#ef4444' },
  ],
  hmnia: [
    { name: 'IT Equipment', value: 256, color: '#3b82f6' },
    { name: 'Vehicles', value: 58, color: '#8b5cf6' },
    { name: 'Security', value: 78, color: '#10b981' },
    { name: 'Signage', value: 54, color: '#f59e0b' },
    { name: 'Furniture', value: 0, color: '#ef4444' },
  ],
  mia: [
    { name: 'IT Equipment', value: 180, color: '#3b82f6' },
    { name: 'Vehicles', value: 32, color: '#8b5cf6' },
    { name: 'Security', value: 40, color: '#10b981' },
    { name: 'Signage', value: 30, color: '#f59e0b' },
    { name: 'Furniture', value: 0, color: '#ef4444' },
  ],
};

// Updated station list with the specified stations
const stations = [
  { id: '1', name: 'HQ', assetsCount: 1245, utilization: 78, status: 'operational' as const, location: 'Main Campus' },
  { id: '2', name: 'KKIA', assetsCount: 983, utilization: 65, status: 'operational' as const, location: 'East Wing' },
  { id: '3', name: 'SMKIA', assetsCount: 1478, utilization: 85, status: 'operational' as const, location: 'North Wing' },
  { id: '4', name: 'HMNIA', assetsCount: 742, utilization: 92, status: 'issue' as const, location: 'South Wing' },
  { id: '5', name: 'MIA', assetsCount: 389, utilization: 54, status: 'maintenance' as const, location: 'West Wing' },
];

// Activities data for each station
const stationActivities = {
  all: [
    {
      id: '1',
      user: { name: 'Marcus Chen', initials: 'MC' },
      action: 'transferred',
      target: 'laptops to KKIA',
      timestamp: '10 minutes ago',
      station: 'HQ',
      type: 'transfer' as const
    },
    {
      id: '2',
      user: { name: 'Sarah Johnson', initials: 'SJ' },
      action: 'marked',
      target: 'printers for maintenance',
      timestamp: '45 minutes ago',
      station: 'SMKIA',
      type: 'maintenance' as const
    },
    {
      id: '3',
      user: { name: 'David Wong', initials: 'DW' },
      action: 'added',
      target: '12 new desktops to inventory',
      timestamp: '2 hours ago',
      station: 'KKIA',
      type: 'create' as const
    },
    {
      id: '4',
      user: { name: 'Lisa Park', initials: 'LP' },
      action: 'updated',
      target: 'contract management records',
      timestamp: '5 hours ago',
      station: 'HMNIA',
      type: 'update' as const
    },
    {
      id: '5',
      user: { name: 'Michael Torres', initials: 'MT' },
      action: 'deleted',
      target: 'obsolete laptop from inventory',
      timestamp: '1 day ago',
      station: 'MIA',
      type: 'delete' as const
    },
  ],
  hq: [
    {
      id: '1',
      user: { name: 'Marcus Chen', initials: 'MC' },
      action: 'transferred',
      target: 'laptops to KKIA',
      timestamp: '10 minutes ago',
      station: 'HQ',
      type: 'transfer' as const
    },
    {
      id: '6',
      user: { name: 'Aisha Rahman', initials: 'AR' },
      action: 'inventoried',
      target: 'server room equipment',
      timestamp: '3 days ago',
      station: 'HQ',
      type: 'update' as const
    },
  ],
  kkia: [
    {
      id: '3',
      user: { name: 'David Wong', initials: 'DW' },
      action: 'added',
      target: '12 new desktops to inventory',
      timestamp: '2 hours ago',
      station: 'KKIA',
      type: 'create' as const
    },
    {
      id: '7',
      user: { name: 'Carlos Mendez', initials: 'CM' },
      action: 'approved',
      target: 'network equipment maintenance',
      timestamp: '2 days ago',
      station: 'KKIA',
      type: 'update' as const
    },
  ],
  smkia: [
    {
      id: '2',
      user: { name: 'Sarah Johnson', initials: 'SJ' },
      action: 'marked',
      target: 'printers for maintenance',
      timestamp: '45 minutes ago',
      station: 'SMKIA',
      type: 'maintenance' as const
    },
    {
      id: '8',
      user: { name: 'Fatima Al-Sayed', initials: 'FA' },
      action: 'registered',
      target: 'new communication equipment',
      timestamp: '4 days ago',
      station: 'SMKIA',
      type: 'create' as const
    },
  ],
  hmnia: [
    {
      id: '4',
      user: { name: 'Lisa Park', initials: 'LP' },
      action: 'updated',
      target: 'contract management records',
      timestamp: '5 hours ago',
      station: 'HMNIA',
      type: 'update' as const
    },
    {
      id: '9',
      user: { name: 'Ibrahim Khan', initials: 'IK' },
      action: 'reported',
      target: 'IT security incident',
      timestamp: '1 week ago',
      station: 'HMNIA',
      type: 'issue' as const
    },
  ],
  mia: [
    {
      id: '5',
      user: { name: 'Michael Torres', initials: 'MT' },
      action: 'deleted',
      target: 'obsolete laptop from inventory',
      timestamp: '1 day ago',
      station: 'MIA',
      type: 'delete' as const
    },
    {
      id: '10',
      user: { name: 'Sophia Chen', initials: 'SC' },
      action: 'scheduled',
      target: 'asset maintenance review',
      timestamp: '5 days ago',
      station: 'MIA',
      type: 'maintenance' as const
    },
  ],
};

// Station-specific stats
const stationStats = {
  all: {
    totalAssets: '4,434',
    maintenance: '67',
    transfers: '23',
    personnel: '318',
    operational: 3842,
    underMaintenance: 478,
    issuesReported: 114,
  },
  hq: {
    totalAssets: '1,245',
    maintenance: '25',
    transfers: '8',
    personnel: '120',
    operational: 1132,
    underMaintenance: 89,
    issuesReported: 24,
  },
  kkia: {
    totalAssets: '983',
    maintenance: '14',
    transfers: '6',
    personnel: '78',
    operational: 915,
    underMaintenance: 45,
    issuesReported: 23,
  },
  smkia: {
    totalAssets: '1,478',
    maintenance: '18',
    transfers: '5',
    personnel: '65',
    operational: 1365,
    underMaintenance: 87,
    issuesReported: 26,
  },
  hmnia: {
    totalAssets: '742',
    maintenance: '7',
    transfers: '3',
    personnel: '35',
    operational: 668,
    underMaintenance: 54,
    issuesReported: 20,
  },
  mia: {
    totalAssets: '389',
    maintenance: '3',
    transfers: '1',
    personnel: '20',
    operational: 345,
    underMaintenance: 34,
    issuesReported: 10,
  },
};

// Chart data
const stationTrendsData = {
  all: {
    daily: [
      { date: 'Mon', acquisitions: 12, disposals: 5, transfers: 8 },
      { date: 'Tue', acquisitions: 19, disposals: 7, transfers: 13 },
      { date: 'Wed', acquisitions: 15, disposals: 8, transfers: 21 },
      { date: 'Thu', acquisitions: 22, disposals: 6, transfers: 17 },
      { date: 'Fri', acquisitions: 28, disposals: 9, transfers: 14 },
      { date: 'Sat', acquisitions: 10, disposals: 3, transfers: 5 },
      { date: 'Sun', acquisitions: 8, disposals: 2, transfers: 3 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 45, disposals: 18, transfers: 37 },
      { date: 'Week 2', acquisitions: 62, disposals: 24, transfers: 53 },
      { date: 'Week 3', acquisitions: 58, disposals: 21, transfers: 49 },
      { date: 'Week 4', acquisitions: 71, disposals: 19, transfers: 62 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 165, disposals: 78, transfers: 142 },
      { date: 'Feb', acquisitions: 190, disposals: 85, transfers: 162 },
      { date: 'Mar', acquisitions: 210, disposals: 95, transfers: 185 },
      { date: 'Apr', acquisitions: 185, disposals: 80, transfers: 168 },
      { date: 'May', acquisitions: 195, disposals: 90, transfers: 173 },
      { date: 'Jun', acquisitions: 220, disposals: 105, transfers: 198 },
    ],
  },
  hq: {
    daily: [
      { date: 'Mon', acquisitions: 5, disposals: 2, transfers: 3 },
      { date: 'Tue', acquisitions: 8, disposals: 3, transfers: 5 },
      { date: 'Wed', acquisitions: 6, disposals: 2, transfers: 7 },
      { date: 'Thu', acquisitions: 9, disposals: 2, transfers: 6 },
      { date: 'Fri', acquisitions: 10, disposals: 3, transfers: 5 },
      { date: 'Sat', acquisitions: 4, disposals: 1, transfers: 2 },
      { date: 'Sun', acquisitions: 3, disposals: 1, transfers: 1 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 18, disposals: 7, transfers: 12 },
      { date: 'Week 2', acquisitions: 25, disposals: 10, transfers: 18 },
      { date: 'Week 3', acquisitions: 22, disposals: 9, transfers: 16 },
      { date: 'Week 4', acquisitions: 28, disposals: 8, transfers: 20 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 55, disposals: 25, transfers: 48 },
      { date: 'Feb', acquisitions: 65, disposals: 28, transfers: 52 },
      { date: 'Mar', acquisitions: 75, disposals: 32, transfers: 60 },
      { date: 'Apr', acquisitions: 62, disposals: 26, transfers: 55 },
      { date: 'May', acquisitions: 68, disposals: 30, transfers: 58 },
      { date: 'Jun', acquisitions: 78, disposals: 35, transfers: 65 },
    ],
  },
  kkia: {
    daily: [
      { date: 'Mon', acquisitions: 3, disposals: 1, transfers: 2 },
      { date: 'Tue', acquisitions: 5, disposals: 2, transfers: 3 },
      { date: 'Wed', acquisitions: 4, disposals: 2, transfers: 5 },
      { date: 'Thu', acquisitions: 6, disposals: 1, transfers: 4 },
      { date: 'Fri', acquisitions: 7, disposals: 2, transfers: 3 },
      { date: 'Sat', acquisitions: 2, disposals: 1, transfers: 1 },
      { date: 'Sun', acquisitions: 2, disposals: 0, transfers: 1 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 12, disposals: 5, transfers: 9 },
      { date: 'Week 2', acquisitions: 16, disposals: 6, transfers: 13 },
      { date: 'Week 3', acquisitions: 15, disposals: 5, transfers: 12 },
      { date: 'Week 4', acquisitions: 18, disposals: 5, transfers: 15 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 40, disposals: 18, transfers: 35 },
      { date: 'Feb', acquisitions: 48, disposals: 21, transfers: 38 },
      { date: 'Mar', acquisitions: 55, disposals: 24, transfers: 45 },
      { date: 'Apr', acquisitions: 45, disposals: 20, transfers: 40 },
      { date: 'May', acquisitions: 50, disposals: 22, transfers: 42 },
      { date: 'Jun', acquisitions: 58, disposals: 26, transfers: 48 },
    ],
  },
  smkia: {
    daily: [
      { date: 'Mon', acquisitions: 4, disposals: 2, transfers: 3 },
      { date: 'Tue', acquisitions: 6, disposals: 2, transfers: 5 },
      { date: 'Wed', acquisitions: 5, disposals: 4, transfers: 9 },
      { date: 'Thu', acquisitions: 7, disposals: 3, transfers: 7 },
      { date: 'Fri', acquisitions: 11, disposals: 4, transfers: 6 },
      { date: 'Sat', acquisitions: 4, disposals: 1, transfers: 2 },
      { date: 'Sun', acquisitions: 3, disposals: 1, transfers: 1 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 15, disposals: 6, transfers: 16 },
      { date: 'Week 2', acquisitions: 21, disposals: 8, transfers: 22 },
      { date: 'Week 3', acquisitions: 21, disposals: 7, transfers: 21 },
      { date: 'Week 4', acquisitions: 25, disposals: 6, transfers: 27 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 70, disposals: 35, transfers: 59 },
      { date: 'Feb', acquisitions: 77, disposals: 36, transfers: 72 },
      { date: 'Mar', acquisitions: 80, disposals: 39, transfers: 80 },
      { date: 'Apr', acquisitions: 78, disposals: 34, transfers: 73 },
      { date: 'May', acquisitions: 77, disposals: 38, transfers: 73 },
      { date: 'Jun', acquisitions: 84, disposals: 44, transfers: 85 },
    ],
  },
  hmnia: {
    daily: [
      { date: 'Mon', acquisitions: 2, disposals: 1, transfers: 1 },
      { date: 'Tue', acquisitions: 3, disposals: 1, transfers: 2 },
      { date: 'Wed', acquisitions: 2, disposals: 1, transfers: 3 },
      { date: 'Thu', acquisitions: 4, disposals: 1, transfers: 2 },
      { date: 'Fri', acquisitions: 6, disposals: 2, transfers: 2 },
      { date: 'Sat', acquisitions: 1, disposals: 0, transfers: 1 },
      { date: 'Sun', acquisitions: 1, disposals: 0, transfers: 0 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 8, disposals: 3, transfers: 8 },
      { date: 'Week 2', acquisitions: 13, disposals: 4, transfers: 11 },
      { date: 'Week 3', acquisitions: 11, disposals: 3, transfers: 10 },
      { date: 'Week 4', acquisitions: 14, disposals: 3, transfers: 13 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 35, disposals: 12, transfers: 28 },
      { date: 'Feb', acquisitions: 38, disposals: 15, transfers: 32 },
      { date: 'Mar', acquisitions: 43, disposals: 18, transfers: 37 },
      { date: 'Apr', acquisitions: 37, disposals: 14, transfers: 33 },
      { date: 'May', acquisitions: 39, disposals: 16, transfers: 35 },
      { date: 'Jun', acquisitions: 45, disposals: 20, transfers: 40 },
    ],
  },
  mia: {
    daily: [
      { date: 'Mon', acquisitions: 1, disposals: 0, transfers: 0 },
      { date: 'Tue', acquisitions: 2, disposals: 0, transfers: 1 },
      { date: 'Wed', acquisitions: 1, disposals: 0, transfers: 1 },
      { date: 'Thu', acquisitions: 2, disposals: 0, transfers: 1 },
      { date: 'Fri', acquisitions: 3, disposals: 1, transfers: 1 },
      { date: 'Sat', acquisitions: 0, disposals: 0, transfers: 0 },
      { date: 'Sun', acquisitions: 0, disposals: 0, transfers: 0 },
    ],
    weekly: [
      { date: 'Week 1', acquisitions: 5, disposals: 1, transfers: 3 },
      { date: 'Week 2', acquisitions: 7, disposals: 2, transfers: 4 },
      { date: 'Week 3', acquisitions: 6, disposals: 1, transfers: 3 },
      { date: 'Week 4', acquisitions: 8, disposals: 1, transfers: 4 },
    ],
    monthly: [
      { date: 'Jan', acquisitions: 20, disposals: 6, transfers: 12 },
      { date: 'Feb', acquisitions: 22, disposals: 7, transfers: 13 },
      { date: 'Mar', acquisitions: 25, disposals: 8, transfers: 15 },
      { date: 'Apr', acquisitions: 21, disposals: 6, transfers: 13 },
      { date: 'May', acquisitions: 23, disposals: 7, transfers: 14 },
      { date: 'Jun', acquisitions: 26, disposals: 9, transfers: 16 },
    ],
  },
};

// Filter stations based on selection
const getFilteredStations = (selectedStation: string) => {
  if (selectedStation === 'all') {
    return stations;
  }
  
  // Convert station name to lowercase for comparison
  const stationCode = selectedStation.toLowerCase();
  return stations.filter(station => station.name.toLowerCase() === stationCode.toUpperCase());
};

const Index = () => {
  const [selectedStation, setSelectedStation] = useState('all');

  // Get data for the selected station
  const assetDistribution = stationAssetDistributions[selectedStation as keyof typeof stationAssetDistributions];
  const activities = stationActivities[selectedStation as keyof typeof stationActivities];
  const stats = stationStats[selectedStation as keyof typeof stationStats];
  const trendsData = stationTrendsData[selectedStation as keyof typeof stationTrendsData];
  const filteredStations = getFilteredStations(selectedStation);

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage airport assets across all stations</p>
          </div>
          <div className="flex items-center gap-4">
            <Tabs 
              defaultValue="all" 
              value={selectedStation}
              onValueChange={setSelectedStation}
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">All Stations</TabsTrigger>
                <TabsTrigger value="hq" className="text-xs">HQ</TabsTrigger>
                <TabsTrigger value="kkia" className="text-xs">KKIA</TabsTrigger>
                <TabsTrigger value="smkia" className="text-xs">SMKIA</TabsTrigger>
                <TabsTrigger value="hmnia" className="text-xs">HMNIA</TabsTrigger>
                <TabsTrigger value="mia" className="text-xs">MIA</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button>Generate Report</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Assets" 
            value={stats.totalAssets} 
            icon={<Package size={16} />}
            description={`Assets in ${selectedStation === 'all' ? 'all stations' : selectedStation.toUpperCase()}`}
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard 
            title="Maintenance Required" 
            value={stats.maintenance} 
            icon={<Wrench size={16} />}
            description="Scheduled for next week"
            trend={{ value: 2.1, isPositive: false }}
          />
          <StatCard 
            title="Transfers in Progress" 
            value={stats.transfers} 
            icon={<Truck size={16} />}
            description="Between stations"
          />
          <StatCard 
            title="Personnel Access" 
            value={stats.personnel} 
            icon={<Users size={16} />}
            description="Active employees"
            trend={{ value: 1.8, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AssetDistribution data={assetDistribution} />
          <InventoryTrends 
            dailyData={trendsData.daily}
            weeklyData={trendsData.weekly}
            monthlyData={trendsData.monthly}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Asset Status Overview</CardTitle>
              <CardDescription>Current status of all assets in {selectedStation === 'all' ? 'all stations' : selectedStation.toUpperCase()}</CardDescription>
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
                  <div className="text-2xl font-bold">{stats.operational.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{stats.underMaintenance.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{stats.issuesReported.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ActivityLog activities={activities} />
        </div>

        <StationOverview stations={filteredStations} />
      </div>
    </Layout>
  );
};

export default Index;

