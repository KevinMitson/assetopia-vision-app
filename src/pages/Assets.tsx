import { useState, useEffect, useMemo } from 'react';
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
import { Plus, Upload, Download, Loader2, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImportAssetsDialog } from '@/components/assets/ImportAssetsDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { exportToCSV, prepareAssetsForExport } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterEquipment, setFilterEquipment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Lists for filter dropdowns
  const [stations, setStations] = useState<string[]>(['All']);
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(['All']);
  const [statusTypes, setStatusTypes] = useState<string[]>(['All']);
  
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
        
        // Extract unique values for filters
        const uniqueStations = ['All', ...new Set(assetsWithHistory.map(asset => asset.location))];
        const uniqueDepartments = ['All', ...new Set(assetsWithHistory.map(asset => asset.department))];
        const uniqueEquipment = ['All', ...new Set(assetsWithHistory.map(asset => asset.equipment))];
        const uniqueStatus = ['All', ...new Set(assetsWithHistory.map(asset => asset.status))];
        
        setStations(uniqueStations);
        setDepartments(uniqueDepartments);
        setEquipmentTypes(uniqueEquipment);
        setStatusTypes(uniqueStatus);
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
  const statusData = useMemo(() => {
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
  
  const departmentData = useMemo(() => {
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
  
  // Filter assets based on all criteria
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        asset.asset_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.user_name && asset.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Station filter
      const matchesStation = filterStation === 'All' || asset.location === filterStation;
      
      // Department filter
      const matchesDepartment = filterDepartment === 'All' || asset.department === filterDepartment;
      
      // Equipment filter
      const matchesEquipment = filterEquipment === 'All' || asset.equipment === filterEquipment;
      
      // Status filter
      const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
      
      return matchesSearch && matchesStation && matchesDepartment && matchesEquipment && matchesStatus;
    });
  }, [assets, searchTerm, filterStation, filterDepartment, filterEquipment, filterStatus]);
  
  const handleAddAsset = () => {
    navigate('/assets/add');
  };
  
  const handleImportSuccess = () => {
    // Reload data after successful import
    window.location.reload();
  };
  
  const handleExportToCSV = () => {
    try {
      // Prepare data for export
      const exportData = prepareAssetsForExport(filteredAssets);
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `assets_export_${date}`;
      
      // Export to CSV
      exportToCSV(exportData, filename);
      
      toast({
        title: "Export Successful",
        description: `${filteredAssets.length} assets exported to CSV`,
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export assets to CSV",
        variant: "destructive",
      });
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStation('All');
    setFilterDepartment('All');
    setFilterEquipment('All');
    setFilterStatus('All');
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
            <Button variant="outline" onClick={handleExportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Filter className="h-4 w-4" />
                      Filters
                      {(filterStation !== 'All' || filterDepartment !== 'All' || 
                        filterEquipment !== 'All' || filterStatus !== 'All') && (
                        <Badge className="ml-1 bg-primary text-primary-foreground">
                          {[
                            filterStation !== 'All' ? 1 : 0,
                            filterDepartment !== 'All' ? 1 : 0,
                            filterEquipment !== 'All' ? 1 : 0,
                            filterStatus !== 'All' ? 1 : 0
                          ].reduce((a, b) => a + b, 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Assets</h4>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Station</label>
                        <Select value={filterStation} onValueChange={setFilterStation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select station" />
                          </SelectTrigger>
                          <SelectContent>
                            {stations.map(station => (
                              <SelectItem key={station} value={station}>
                                {station}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Equipment Type</label>
                        <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipmentTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusTypes.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                        <Button size="sm" onClick={() => setShowFilters(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {(filterStation !== 'All' || filterDepartment !== 'All' || 
                  filterEquipment !== 'All' || filterStatus !== 'All') && (
                  <Button variant="ghost" size="icon" onClick={resetFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Active filters display */}
            {(filterStation !== 'All' || filterDepartment !== 'All' || 
              filterEquipment !== 'All' || filterStatus !== 'All') && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted-foreground">Active filters:</span>
                {filterStation !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Station: {filterStation}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterStation('All')} 
                    />
                  </Badge>
                )}
                {filterDepartment !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Department: {filterDepartment}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterDepartment('All')} 
                    />
                  </Badge>
                )}
                {filterEquipment !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Equipment: {filterEquipment}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterEquipment('All')} 
                    />
                  </Badge>
                )}
                {filterStatus !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filterStatus}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterStatus('All')} 
                    />
                  </Badge>
                )}
              </div>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Assets</CardTitle>
                <CardDescription>
                  {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
                  {(filterStation !== 'All' || filterDepartment !== 'All' || 
                    filterEquipment !== 'All' || filterStatus !== 'All') && ' matching your filters'}
                </CardDescription>
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
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No assets found. {assets.length > 0 ? 'Try adjusting your filters.' : 'Add your first asset or import from Excel.'}</p>
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
                        {filteredAssets.map((asset) => (
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