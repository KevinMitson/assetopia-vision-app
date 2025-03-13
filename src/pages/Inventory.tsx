import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Laptop, Monitor, FileText, Printer, Server, Smartphone, 
  Tablet, Network, Key, Package, Filter, X, Calendar, User, 
  Building, Info, Tag, HardDrive, Box, AlertCircle, MapPin, Search
} from 'lucide-react';
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
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AssetDistribution } from '@/components/dashboard/AssetDistribution';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Enhanced filter states
  const [filterStation, setFilterStation] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterEquipment, setFilterEquipment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Lists for filter dropdowns
  const [stations, setStations] = useState<string[]>(['All']);
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(['All']);
  const [statusTypes, setStatusTypes] = useState<string[]>(['All']);
  const [users, setUsers] = useState<string[]>(['All']);
  
  // Selected asset for details modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
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
          
          // Extract unique values for filters with proper typing
          const uniqueStations = ['All', ...new Set(data.map(asset => asset.location))].filter(Boolean) as string[];
          const uniqueDepartments = ['All', ...new Set(data.map(asset => asset.department))].filter(Boolean) as string[];
          const uniqueEquipment = ['All', ...new Set(data.map(asset => asset.equipment))].filter(Boolean) as string[];
          const uniqueStatuses = ['All', ...new Set(data.map(asset => asset.status))].filter(Boolean) as string[];
          const uniqueUsers = ['All', ...new Set(data.map(asset => asset.user_name || 'Unassigned'))].filter(Boolean) as string[];
          
          setStations(uniqueStations);
          setDepartments(uniqueDepartments);
          setEquipmentTypes(uniqueEquipment);
          setStatusTypes(uniqueStatuses);
          setUsers(uniqueUsers);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  // Function to generate chart data
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
    
    const departmentChartData = Object.keys(departmentCounts)
      .map(department => ({
      name: department,
      count: departmentCounts[department]
      }))
      .sort((a, b) => b.count - a.count);
    
    // Set state
    setStatusData(statusChartData);
    setEquipmentData(equipmentChartData);
    setLocationData(locationChartData);
    setDepartmentData(departmentChartData);
  };
  
  // Apply filters and search to assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        Object.values(asset).some(
          value => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Dropdown filters
      const matchesStation = filterStation === 'All' || asset.location === filterStation;
      const matchesDepartment = filterDepartment === 'All' || asset.department === filterDepartment;
      const matchesEquipment = filterEquipment === 'All' || asset.equipment === filterEquipment;
      const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
      const matchesUser = filterUser === 'All' || asset.user_name === filterUser || 
        (filterUser === 'Unassigned' && !asset.user_name);
      
      return matchesSearch && matchesStation && matchesDepartment && 
        matchesEquipment && matchesStatus && matchesUser;
    });
  }, [assets, searchTerm, filterStation, filterDepartment, filterEquipment, filterStatus, filterUser]);
  
  // Calculate active filter count
  const activeFilterCount = [
    filterStation !== 'All',
    filterDepartment !== 'All',
    filterEquipment !== 'All',
    filterStatus !== 'All',
    filterUser !== 'All'
  ].filter(Boolean).length;
  
  // Check if any filters are active
  const hasActiveFilters = 
    filterStation !== 'All' || 
    filterDepartment !== 'All' || 
    filterEquipment !== 'All' || 
    filterStatus !== 'All' || 
    filterUser !== 'All';
  
  // Function to reset all filters
  const resetFilters = () => {
    setFilterStation('All');
    setFilterDepartment('All');
    setFilterEquipment('All');
    setFilterStatus('All');
    setFilterUser('All');
  };
  
  // Function to handle row click and show details
  const handleRowClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailsDialogOpen(true);
  };
  
  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <Button onClick={() => navigate('/assets/add')}>Add New Asset</Button>
        </div>
        
        {/* Asset Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Asset Details</DialogTitle>
              <DialogDescription>
                {selectedAsset?.equipment} - {selectedAsset?.model}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAsset && (
              <ScrollArea className="flex-1 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Info className="mr-2 h-4 w-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{selectedAsset.serial_no}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Asset Number</p>
                        <p>{selectedAsset.asset_no || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Equipment Type</p>
                        <div className="flex items-center">
                          {getEquipmentIcon(selectedAsset.equipment)}
                          <span>{selectedAsset.equipment}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Model</p>
                        <p>{selectedAsset.model}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusBadge(selectedAsset.status)}>
                          {selectedAsset.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                        <p>{formatDate(selectedAsset.purchase_date)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Assignment Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Assignment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Department Section</p>
                        <p>{selectedAsset.department_section || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                        <p>{selectedAsset.department || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                        <p>{selectedAsset.user_name || 'Not Assigned'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Designation</p>
                        <p>{selectedAsset.designation || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="flex items-center">
                          <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {selectedAsset.location || '-'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Technical Specifications */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <HardDrive className="mr-2 h-4 w-4" />
                        Technical Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">PC Name</p>
                        <p>{selectedAsset.pc_name || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Operating System</p>
                        <p>{selectedAsset.os || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">RAM</p>
                        <p>{selectedAsset.ram || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Storage</p>
                        <p>{selectedAsset.storage || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">OE Tag</p>
                        <p>{selectedAsset.oe_tag || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Maintenance Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Maintenance Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                        <p>{formatDate(selectedAsset.last_maintenance)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Next Maintenance</p>
                        <p>{formatDate(selectedAsset.next_maintenance)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Assignment History */}
                  {selectedAsset.assignment_history && selectedAsset.assignment_history.length > 0 && (
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Assignment History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>From Date</TableHead>
                                <TableHead>To Date</TableHead>
                                <TableHead>Reason</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedAsset.assignment_history.map((history) => (
                                <TableRow key={history.id}>
                                  <TableCell>{history.user_name || '-'}</TableCell>
                                  <TableCell>{history.department || '-'}</TableCell>
                                  <TableCell>{formatDate(history.from_date)}</TableCell>
                                  <TableCell>{formatDate(history.to_date)}</TableCell>
                                  <TableCell>{history.reason || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => navigate(`/assets/${selectedAsset?.id}`)}
              >
                View Full Details
              </Button>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
          <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-3 flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {hasActiveFilters && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 px-1 rounded-full h-5 min-w-5 text-xs"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">
                        Narrow down assets by attributes
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="station" className="text-sm col-span-1">
                          Station
                        </label>
                        <Select
                  value={filterStation}
                          onValueChange={setFilterStation}
                        >
                          <SelectTrigger id="station" className="col-span-3">
                            <SelectValue placeholder="All Stations" />
                          </SelectTrigger>
                          <SelectContent>
                            {stations.map((station) => (
                              <SelectItem key={station} value={station}>
                      {station}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="department" className="text-sm col-span-1">
                          Department
                        </label>
                        <Select
                          value={filterDepartment}
                          onValueChange={setFilterDepartment}
                        >
                          <SelectTrigger id="department" className="col-span-3">
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="equipment" className="text-sm col-span-1">
                          Equipment
                        </label>
                        <Select
                          value={filterEquipment}
                          onValueChange={setFilterEquipment}
                        >
                          <SelectTrigger id="equipment" className="col-span-3">
                            <SelectValue placeholder="All Equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-sm col-span-1">
                          Status
                        </label>
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger id="status" className="col-span-3">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusTypes.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="user" className="text-sm col-span-1">
                          User
                        </label>
                        <Select
                          value={filterUser}
                          onValueChange={setFilterUser}
                        >
                          <SelectTrigger id="user" className="col-span-3">
                            <SelectValue placeholder="All Users" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user} value={user}>
                                {user}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              
                <Button variant="outline">Export</Button>
              </div>
            </div>
            
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 text-sm mb-4">
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
              {filterUser !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  User: {filterUser}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilterUser('All')} 
                  />
                </Badge>
              )}
            </div>
          )}
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Assets</CardTitle>
                <CardDescription>
                  {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
                  {hasActiveFilters && ' matching your filters'}
                </CardDescription>
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
                            <TableRow 
                              key={asset.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleRowClick(asset)}
                            >
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
                              <TableCell>{formatDate(asset.purchase_date)}</TableCell>
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
