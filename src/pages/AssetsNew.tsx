import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImportAssetsDialog } from '@/components/assets/ImportAssetsDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Define types for our asset data
interface Asset extends Tables<'assets'> {
  assignmentHistory?: {
    id: string;
    user_name: string | null;
    department: string | null;
    from_date: string;
    to_date: string | null;
    reason: string | null;
  }[];
}

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const styles = {
    'Assigned': 'bg-green-100 text-green-800',
    'Available': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'In Storage': 'bg-gray-100 text-gray-800',
    'Unserviceable': 'bg-red-100 text-red-800',
    'Stolen': 'bg-purple-100 text-purple-800',
    'Serviceable': 'bg-green-100 text-green-800',
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

// Sample data for fallback
const sampleStatusData = [
  { name: 'Assigned', value: 3, color: '#10b981' },
  { name: 'Under Maintenance', value: 1, color: '#f59e0b' },
  { name: 'In Storage', value: 1, color: '#6b7280' },
  { name: 'Unserviceable', value: 1, color: '#ef4444' },
  { name: 'Stolen', value: 1, color: '#8b5cf6' },
];

const sampleDepartmentData = [
  { name: 'IT', count: 2 },
  { name: 'Finance', count: 2 },
  { name: 'Marketing', count: 1 },
  { name: 'HR', count: 1 },
  { name: 'Operations', count: 1 },
];

const Assets = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch assets from Supabase
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch assets
        const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (assetsError) throw assetsError;
        
        // Fetch assignment history for each asset
        const assetsWithHistory = await Promise.all(
          assetsData.map(async (asset) => {
            const { data: historyData, error: historyError } = await supabase
              .from('assignment_history')
              .select('*')
              .eq('asset_id', asset.id)
              .order('from_date', { ascending: false });
            
            if (historyError) {
              console.error('Error fetching assignment history:', historyError);
              return { ...asset, assignmentHistory: [] };
            }
            
            return { ...asset, assignmentHistory: historyData || [] };
          })
        );
        
        setAssets(assetsWithHistory);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Failed to load assets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  // Calculate statistics for analytics tab
  const statusData = React.useMemo(() => {
    if (!assets.length) return sampleStatusData;
    
    const statusCounts: Record<string, number> = {};
    assets.forEach(asset => {
      const status = asset.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusColors: Record<string, string> = {
      'Serviceable': '#10b981',
      'Assigned': '#10b981',
      'Available': '#3b82f6',
      'Under Maintenance': '#f59e0b',
      'In Storage': '#6b7280',
      'Unserviceable': '#ef4444',
      'Stolen': '#8b5cf6',
      'Unknown': '#9ca3af',
    };
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || '#9ca3af',
    }));
  }, [assets]);
  
  const departmentData = React.useMemo(() => {
    if (!assets.length) return sampleDepartmentData;
    
    const deptCounts: Record<string, number> = {};
    assets.forEach(asset => {
      const dept = asset.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    return Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [assets]);
  
  const handleAddAsset = () => {
    navigate('/add-asset');
  };
  
  const handleImportSuccess = () => {
    // Reload data after successful import
    window.location.reload();
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Assets Management</h1>
            <p className="text-muted-foreground">Manage and track all company equipment</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="list" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Asset List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Assets</CardTitle>
                <CardDescription>Complete inventory of all company equipment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Loading assets...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                ) : assets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No assets found. Add your first asset or import from Excel.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset #</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Next Maintenance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets.map((asset) => (
                          <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/assets/${asset.id}`)}>
                            <TableCell className="font-medium">{asset.asset_no}</TableCell>
                            <TableCell>{asset.equipment}</TableCell>
                            <TableCell>{asset.model}</TableCell>
                            <TableCell>{asset.department}</TableCell>
                            <TableCell>{asset.user_name || '-'}</TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(asset.status)}>
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{asset.next_maintenance || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
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
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Allocation</CardTitle>
                  <CardDescription>Assets by department</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Import Assets Dialog */}
      <ImportAssetsDialog 
        isOpen={showImportDialog} 
        onClose={() => setShowImportDialog(false)} 
        onSuccess={handleImportSuccess}
      />
    </Layout>
  );
};

export default Assets; 