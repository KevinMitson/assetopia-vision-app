import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { StationOverview } from '@/components/dashboard/StationOverview';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { InventoryTrends } from '@/components/dashboard/InventoryTrends';
import { ReportDialog } from '@/components/dashboard/ReportDialog';
import { MaintenanceDashboard } from '@/components/dashboard/MaintenanceDashboard';
import { AssignmentsDashboard } from '@/components/dashboard/AssignmentsDashboard';
import { Package, AlertTriangle, Truck, Users, Check, Wrench, Activity, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityItem, Station, AssetCategory, StationStats, ChartDataPoint } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Filter stations based on selection
const getFilteredStations = (selectedStation: string, stations: Station[]) => {
  if (selectedStation === 'all') {
    return stations;
  }
  
  // Convert station name to lowercase for comparison
  const stationCode = selectedStation.toLowerCase();
  return stations.filter(station => station.name.toLowerCase() === stationCode);
};

const Index = () => {
  const { toast } = useToast();
  const [selectedStation, setSelectedStation] = useState('all');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for dashboard data
  const [stations, setStations] = useState<Station[]>([]);
  const [assetDistributions, setAssetDistributions] = useState<{[key: string]: AssetCategory[]}>({
    all: []
  });
  const [activities, setActivities] = useState<{[key: string]: ActivityItem[]}>({
    all: []
  });
  const [stats, setStats] = useState<{[key: string]: StationStats}>({
    all: {
      totalAssets: '0',
      maintenance: '0',
      transfers: '0',
      personnel: '0',
      operational: 0,
      underMaintenance: 0,
      issuesReported: 0
    }
  });
  const [trendsData, setTrendsData] = useState<{[key: string]: { daily: ChartDataPoint[], weekly: ChartDataPoint[], monthly: ChartDataPoint[] }}>({
    all: {
      daily: [],
      weekly: [],
      monthly: []
    }
  });

  // Fetch stations data
  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Ensure we have all required stations
        const requiredStations = ['HQ', 'KKIA', 'HMNIA', 'SMKIA', 'MIA'];
        const existingStationCodes = data.map(station => station.code);
        
        // Check if all required stations exist
        const missingStations = requiredStations.filter(code => 
          !existingStationCodes.includes(code)
        );
        
        // If there are missing stations, we'll log a warning
        // In a production app, you might want to handle this differently
        if (missingStations.length > 0) {
          console.warn(`Missing stations in database: ${missingStations.join(', ')}`);
        }
        
        const formattedStations: Station[] = data.map(station => ({
          id: station.id,
          name: station.code,
          assetsCount: 0, // Will be updated with asset count
          utilization: 0, // Will be calculated
          status: (station.status as 'operational' | 'maintenance' | 'issue') || 'operational',
          location: station.location || '',
        }));
        
        setStations(formattedStations);
        
        // Fetch asset counts for each station
        await fetchAssetCountsByStation(formattedStations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stations data',
        variant: 'destructive',
      });
    }
  };

  // Fetch asset counts by station
  const fetchAssetCountsByStation = async (stationsList: Station[]) => {
    try {
      const stationsWithCounts = [...stationsList];
      let totalAssets = 0;
      
      // For each station, get the count of assets
      for (let i = 0; i < stationsWithCounts.length; i++) {
        const station = stationsWithCounts[i];
        const { count, error } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('location', station.name);
        
        if (error) throw error;
        
        stationsWithCounts[i] = {
          ...station,
          assetsCount: count || 0,
        };
        
        totalAssets += count || 0;
      }
      
      // Calculate utilization (simplified example - could be based on more complex metrics)
      stationsWithCounts.forEach((station, index) => {
        stationsWithCounts[index] = {
          ...station,
          utilization: Math.round((station.assetsCount / (totalAssets || 1)) * 100),
        };
      });
      
      setStations(stationsWithCounts);
    } catch (error) {
      console.error('Error fetching asset counts:', error);
    }
  };

  // Fetch asset distribution data
  const fetchAssetDistribution = async () => {
    try {
      // Get asset types and counts
      const { data, error } = await supabase
        .from('assets')
        .select('equipment, location');
      
      if (error) throw error;
      
      if (data) {
        // Process for all stations
        const allDistribution = processAssetDistribution(data);
        
        // Process for each station
        const stationDistributions: {[key: string]: AssetCategory[]} = {
          all: allDistribution
        };
        
        // Get unique stations
        const uniqueStations = [...new Set(data.map(asset => 
          asset.location.toLowerCase()
        ))];
        
        // For each station, filter and process
        uniqueStations.forEach(station => {
          const stationData = data.filter(asset => 
            asset.location.toLowerCase() === station
          );
          stationDistributions[station] = processAssetDistribution(stationData);
        });
        
        setAssetDistributions(stationDistributions);
      }
    } catch (error) {
      console.error('Error fetching asset distribution:', error);
    }
  };

  // Process asset distribution data
  const processAssetDistribution = (assets: any[]): AssetCategory[] => {
    const equipmentCounts: {[key: string]: number} = {};
    
    // Count assets by equipment type
    assets.forEach(asset => {
      const equipment = asset.equipment;
      equipmentCounts[equipment] = (equipmentCounts[equipment] || 0) + 1;
    });
    
    // Define colors for each category
    const colors: {[key: string]: string} = {
      'Laptop': '#3b82f6',
      'Desktop': '#8b5cf6',
      'Printer': '#10b981',
      'Switch': '#f59e0b',
      'Server': '#ef4444',
      'License': '#6366f1',
      'Phone': '#ec4899',
      'iPad': '#14b8a6',
      'Other': '#64748b'
    };
    
    // Convert to array format
    return Object.entries(equipmentCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#64748b'
    }));
  };

  // Fetch activities data
  const fetchActivities = async () => {
    try {
      // Get recent activities (using assignment_history as a proxy for activities)
      const { data, error } = await supabase
        .from('assignment_history')
        .select('*, assets!inner(*)')
        .order('from_date', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      if (data) {
        // Process for all stations
        const allActivities = processActivities(data);
        
        // Process for each station
        const stationActivities: {[key: string]: ActivityItem[]} = {
          all: allActivities
        };
        
        // Get unique stations
        const uniqueStations = [...new Set(data.map(item => 
          item.assets?.location?.toLowerCase() || 'unknown'
        ))];
        
        // For each station, filter and process
        uniqueStations.forEach(station => {
          if (station !== 'unknown') {
            const stationData = data.filter(item => 
              item.assets?.location?.toLowerCase() === station
            );
            stationActivities[station] = processActivities(stationData);
          }
        });
        
        setActivities(stationActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Process activities data
  const processActivities = (data: any[]): ActivityItem[] => {
    return data.map(item => {
      // Get initials from user name
      const userName = item.user_name || 'Unknown User';
      const initials = userName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      // Determine activity type
      let type: ActivityItem['type'] = 'update';
      if (item.to_date === null) {
        type = 'create'; // Still assigned, so it was a new assignment
      } else {
        type = 'transfer'; // Has end date, so it was a transfer
      }
      
      // Format timestamp
      const fromDate = new Date(item.from_date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - fromDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let timestamp = '';
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          timestamp = `${diffMinutes} minutes ago`;
        } else {
          timestamp = `${diffHours} hours ago`;
        }
      } else if (diffDays === 1) {
        timestamp = '1 day ago';
      } else if (diffDays < 7) {
        timestamp = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        timestamp = `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        timestamp = fromDate.toLocaleDateString();
      }
      
      return {
        id: item.id,
        user: {
          name: userName,
          initials
        },
        action: item.to_date === null ? 'assigned' : 'transferred',
        target: `${item.assets?.equipment || 'asset'} to ${item.department || 'department'}`,
        timestamp,
        station: item.assets?.location || 'Unknown',
        type
      };
    });
  };

  // Fetch stats data
  const fetchStats = async () => {
    try {
      // Get counts for different asset statuses
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('status, location');
      
      if (assetsError) throw assetsError;
      
      // Get count of personnel (profiles)
      const { count: personnelCount, error: personnelError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (personnelError) throw personnelError;
      
      if (assets) {
        // Process for all stations
        const allStats = processStats(assets, personnelCount || 0);
        
        // Process for each station
        const stationStats: {[key: string]: StationStats} = {
          all: allStats
        };
        
        // Get unique stations
        const uniqueStations = [...new Set(assets.map(asset => 
          asset.location.toLowerCase()
        ))];
        
        // For each station, filter and process
        uniqueStations.forEach(station => {
          const stationData = assets.filter(asset => 
            asset.location.toLowerCase() === station
          );
          
          // Get personnel count for this station (simplified - assuming equal distribution)
          const stationPersonnelCount = Math.round((personnelCount || 0) / uniqueStations.length);
          
          stationStats[station] = processStats(stationData, stationPersonnelCount);
        });
        
        setStats(stationStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Process stats data
  const processStats = (assets: any[], personnelCount: number): StationStats => {
    // Count assets by status
    let operational = 0;
    let underMaintenance = 0;
    let issuesReported = 0;
    
    assets.forEach(asset => {
      if (asset.status === 'Available' || asset.status === 'Assigned') {
        operational++;
      } else if (asset.status === 'Under Maintenance') {
        underMaintenance++;
      } else {
        // Unserviceable, Stolen, etc.
        issuesReported++;
      }
    });
    
    // Count transfers (simplified - using 10% of total assets as a proxy)
    const transfers = Math.round(assets.length * 0.1);
    
    return {
      totalAssets: assets.length.toLocaleString(),
      maintenance: underMaintenance.toString(),
      transfers: transfers.toString(),
      personnel: personnelCount.toString(),
      operational,
      underMaintenance,
      issuesReported
    };
  };

  // Generate trends data (simplified - using random data as a proxy)
  // In a real implementation, this would query historical data
  const generateTrendsData = () => {
    // Days of the week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate daily data
    const generateDailyData = (multiplier = 1) => days.map(day => ({
      date: day,
      acquisitions: Math.round(Math.random() * 10 * multiplier),
      disposals: Math.round(Math.random() * 5 * multiplier),
      transfers: Math.round(Math.random() * 8 * multiplier)
    }));
    
    // Generate weekly data
    const generateWeeklyData = (multiplier = 1) => Array.from({ length: 4 }, (_, i) => ({
      date: `Week ${i + 1}`,
      acquisitions: Math.round(Math.random() * 30 * multiplier),
      disposals: Math.round(Math.random() * 15 * multiplier),
      transfers: Math.round(Math.random() * 25 * multiplier)
    }));
    
    // Generate monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const generateMonthlyData = (multiplier = 1) => months.map(month => ({
      date: month,
      acquisitions: Math.round(Math.random() * 100 * multiplier),
      disposals: Math.round(Math.random() * 50 * multiplier),
      transfers: Math.round(Math.random() * 80 * multiplier)
    }));
    
    // Generate for all stations
    const allTrendsData = {
      daily: generateDailyData(4),
      weekly: generateWeeklyData(4),
      monthly: generateMonthlyData(4)
    };
    
    // Generate for each station
    const stationTrendsData: {[key: string]: { daily: ChartDataPoint[], weekly: ChartDataPoint[], monthly: ChartDataPoint[] }} = {
      all: allTrendsData
    };
    
    // For each station in our stations list
    stations.forEach(station => {
      const stationName = station.name.toLowerCase();
      const multiplier = station.assetsCount / 1000 || 0.5; // Scale based on asset count
      
      stationTrendsData[stationName] = {
        daily: generateDailyData(multiplier),
        weekly: generateWeeklyData(multiplier),
        monthly: generateMonthlyData(multiplier)
      };
    });
    
    setTrendsData(stationTrendsData);
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await fetchStations();
      await fetchAssetDistribution();
      await fetchActivities();
      await fetchStats();
      // Generate trends data after other data is loaded
      setTimeout(() => {
        generateTrendsData();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to load some dashboard data',
        variant: 'destructive',
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get data for the selected station
  const assetDistribution = assetDistributions[selectedStation] || [];
  const stationActivities = activities[selectedStation] || [];
  const stationStats = stats[selectedStation] || {
    totalAssets: '0',
    maintenance: '0',
    transfers: '0',
    personnel: '0',
    operational: 0,
    underMaintenance: 0,
    issuesReported: 0
  };
  const stationTrendsData = trendsData[selectedStation] || {
    daily: [],
    weekly: [],
    monthly: []
  };
  const filteredStations = getFilteredStations(selectedStation, stations);

  // Get the display name for the selected station
  const getSelectedStationDisplayName = () => {
    if (selectedStation === 'all') return 'All Stations';
    
    // Find the station by code (case-insensitive)
    const station = stations.find(s => 
      s.name.toLowerCase() === selectedStation.toLowerCase()
    );
    
    return station?.name || 'All Stations';
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage airport assets across all stations</p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {getSelectedStationDisplayName()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedStation('all')}>
                  All Stations
                </DropdownMenuItem>
                {stations.map(station => (
                  <DropdownMenuItem 
                    key={station.id} 
                    onClick={() => setSelectedStation(station.name.toLowerCase())}
                  >
                    {station.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setReportDialogOpen(true)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Assets" 
            value={stationStats.totalAssets} 
            icon={<Package size={16} />}
            description={`Assets in ${selectedStation === 'all' ? 'all stations' : getSelectedStationDisplayName()}`}
            trend={{ value: 5.2, isPositive: true }}
            loading={loading}
          />
          <StatCard 
            title="Maintenance Required" 
            value={stationStats.maintenance} 
            icon={<Wrench size={16} />}
            description="Scheduled for next week"
            trend={{ value: 2.1, isPositive: false }}
            loading={loading}
          />
          <StatCard 
            title="Transfers in Progress" 
            value={stationStats.transfers} 
            icon={<Truck size={16} />}
            description="Between stations"
            loading={loading}
          />
          <StatCard 
            title="Personnel Access" 
            value={stationStats.personnel} 
            icon={<Users size={16} />}
            description="Active employees"
            trend={{ value: 1.8, isPositive: true }}
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AssetDistribution data={assetDistribution} loading={loading} />
          <InventoryTrends 
            dailyData={stationTrendsData.daily}
            weeklyData={stationTrendsData.weekly}
            monthlyData={stationTrendsData.monthly}
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Asset Status Overview</CardTitle>
              <CardDescription>Current status of all assets in {selectedStation === 'all' ? 'all stations' : getSelectedStationDisplayName()}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-16 bg-secondary/50 animate-pulse rounded-md"></div>
                  <div className="h-16 bg-secondary/50 animate-pulse rounded-md"></div>
                  <div className="h-16 bg-secondary/50 animate-pulse rounded-md"></div>
                </div>
              ) : (
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
                    <div className="text-2xl font-bold">{stationStats.operational.toLocaleString()}</div>
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
                    <div className="text-2xl font-bold">{stationStats.underMaintenance.toLocaleString()}</div>
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
                    <div className="text-2xl font-bold">{stationStats.issuesReported.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <ActivityLog activities={stationActivities} loading={loading} />
        </div>

        <StationOverview stations={filteredStations} loading={loading} />
        
        {/* Maintenance and Assignments Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <MaintenanceDashboard />
          <AssignmentsDashboard />
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        selectedStation={selectedStation}
        stations={filteredStations}
        assetDistribution={assetDistribution}
        stats={stationStats}
        trendsData={stationTrendsData}
      />
    </Layout>
  );
};

export default Index;

