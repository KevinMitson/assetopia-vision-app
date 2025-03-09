
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Laptop, Monitor, FileText, Printer, Server, Smartphone, Tablet, Network, Key, Package } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define types for asset data
interface AssignmentHistory {
  id: string;
  asset_id: string;
  user_name: string | null;
  department: string | null;
  from_date: string;
  to_date: string | null;
  reason: string;
}

interface Asset {
  id: string;
  department: string;
  department_section: string;
  user_name: string | null;
  designation: string | null;
  equipment: string;
  model: string;
  serial_no: string;
  asset_no: string;
  oe_tag?: string;
  pc_name: string;
  os: string;
  ram: string;
  storage: string;
  purchase_date: string;
  status: string;
  location: string;
  last_maintenance: string;
  next_maintenance: string | null;
  assignment_history?: AssignmentHistory[];
}

// Define asset type Icons
const assetTypeIcons: Record<string, React.ReactNode> = {
  'Laptop': <Laptop className="mr-2" size={16} />,
  'Desktop': <Monitor className="mr-2" size={16} />,
  'Printer': <Printer className="mr-2" size={16} />,
  'Switch': <Network className="mr-2" size={16} />,
  'Server': <Server className="mr-2" size={16} />,
  'License': <Key className="mr-2" size={16} />,
  'Phone': <Smartphone className="mr-2" size={16} />,
  'iPad': <Tablet className="mr-2" size={16} />,
  'Other': <Package className="mr-2" size={16} />,
};

const locations = [
  'All',
  'Head Office',
  'KKIA',
  'SMKIA',
  'HMNIA',
  'MIA',
  'Service Center',
  'Stores'
];

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const styles = {
    'Serviceable': 'bg-green-100 text-green-800',
    'Unserviceable': 'bg-red-100 text-red-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'Available': 'bg-purple-100 text-purple-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'In Storage': 'bg-gray-100 text-gray-800',
    'Stolen': 'bg-purple-100 text-purple-800'
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

// Helper function to get equipment icon
const getEquipmentIcon = (equipment: string) => {
  return assetTypeIcons[equipment] || <Package className="mr-2" size={16} />;
};

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Fetch assets from Supabase
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            assignment_history:assignment_history(*)
          `);
        
        if (error) throw error;
        
        if (data) {
          setAssets(data as Asset[]);
          
          // Generate chart data
          generateChartData(data as Asset[]);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  // Generate chart data
  const generateChartData = (assetData: Asset[]) => {
    // Status data
    const statusCounts: Record<string, number> = {};
    const statusColors: Record<string, string> = {
      'Serviceable': '#4caf50',
      'Unserviceable': '#f44336',
      'Assigned': '#2196f3',
      'Available': '#9c27b0',
      'Under Maintenance': '#ff9800',
      'In Storage': '#9e9e9e',
      'Stolen': '#9c27b0'
    };
    
    // Equipment data
    const equipmentCounts: Record<string, number> = {};
    const equipmentColors: Record<string, string> = {
      'Laptop': '#2196f3',
      'Desktop': '#03a9f4',
      'Printer': '#00bcd4',
      'Server': '#009688',
      'Switch': '#4caf50',
      'License': '#8bc34a',
      'Phone': '#cddc39',
      'iPad': '#ffeb3b',
      'Other': '#ffc107'
    };
    
    // Location data
    const locationCounts: Record<string, number> = {};
    const locationColors: Record<string, string> = {
      'Head Office': '#3f51b5',
      'KKIA': '#673ab7',
      'SMKIA': '#e91e63',
      'HMNIA': '#9c27b0',
      'MIA': '#ff5722',
      'Service Center': '#ff9800',
      'Stores': '#9e9e9e'
    };
    
    // Department data
    const departmentCounts: Record<string, number> = {};
    
    // Count occurrences
    assetData.forEach(asset => {
      // Status
      statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
      
      // Equipment
      equipmentCounts[asset.equipment] = (equipmentCounts[asset.equipment] || 0) + 1;
      
      // Location
      locationCounts[asset.location] = (locationCounts[asset.location] || 0) + 1;
      
      // Department
      departmentCounts[asset.department] = (departmentCounts[asset.department] || 0) + 1;
    });
    
    // Convert to chart data format
    const statusChartData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      color: statusColors[status] || '#9e9e9e'
    }));
    
    const equipmentChartData = Object.keys(equipmentCounts).map(equipment => ({
      name: equipment,
      value: equipmentCounts[equipment],
      color: equipmentColors[equipment] || '#9e9e9e'
    }));
    
    const locationChartData = Object.keys(locationCounts).map(location => ({
      name: location,
      value: locationCounts[location],
      color: locationColors[location] || '#9e9e9e'
    }));
    
    const departmentChartData = Object.keys(departmentCounts).map(department => ({
      name: department,
      count: departmentCounts[department]
    }));
    
    // Set state
    setStatusData(statusChartData);
    setEquipmentData(equipmentChartData);
    setLocationData(locationChartData);
    setDepartmentData(departmentChartData);
  };
  
  // Filter assets based on search term and station filter
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.user_name && asset.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serial_no && asset.serial_no.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStation = filterStation === 'All' || asset.location.includes(filterStation);
    
    return matchesSearch && matchesStation;
  });
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Inventory Management</h1>
            <p className="text-muted-foreground">Manage and track all company equipment across stations</p>
          </div>
          <Button onClick={() => navigate('/assets/add')}>Add New Asset</Button>
        </div>
        
        <Tabs defaultValue="list" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Asset List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-3 py-2 bg-background"
                  value={filterStation}
                  onChange={(e) => setFilterStation(e.target.value)}
                >
                  {locations.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
                <Button variant="outline">Export</Button>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Assets</CardTitle>
                <CardDescription>Complete inventory of all company equipment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading assets...</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial No.</TableHead>
                          <TableHead>Dept. Section</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Designation</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>PC Name</TableHead>
                          <TableHead>OS</TableHead>
                          <TableHead>RAM</TableHead>
                          <TableHead>Storage</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={13} className="text-center py-8">
                              No assets found matching your search criteria
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAssets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.serial_no}</TableCell>
                              <TableCell>{asset.department_section}</TableCell>
                              <TableCell>{asset.department}</TableCell>
                              <TableCell>{asset.user_name || '-'}</TableCell>
                              <TableCell>{asset.designation || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {getEquipmentIcon(asset.equipment)}
                                  {asset.equipment}
                                </div>
                              </TableCell>
                              <TableCell>{asset.model}</TableCell>
                              <TableCell>{asset.pc_name || '-'}</TableCell>
                              <TableCell>{asset.os}</TableCell>
                              <TableCell>{asset.ram}</TableCell>
                              <TableCell>{asset.storage}</TableCell>
                              <TableCell>{asset.purchase_date}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadge(asset.status)}>
                                  {asset.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Status Distribution</CardTitle>
                  <CardDescription>Breakdown by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
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
                          {statusData.map((entry, index) => (
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Type Distribution</CardTitle>
                  <CardDescription>Breakdown by equipment category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={equipmentData}
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
                          {equipmentData.map((entry, index) => (
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                  <CardDescription>Breakdown by current location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
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
                          {locationData.map((entry, index) => (
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Allocation</CardTitle>
                  <CardDescription>Assets by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentData.map((dept) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dept.count} {dept.count === 1 ? 'asset' : 'assets'}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{(dept.count / assets.length * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Inventory;
