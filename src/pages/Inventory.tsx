
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Laptop, Monitor, FileText, Printer, Server } from 'lucide-react';
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

// Define types for asset data
interface AssignmentHistory {
  user: string | null;
  department: string | null;
  from: string;
  to: string | null;
  reason: string;
}

interface Asset {
  id: number;
  department: string;
  departmentSection: string;
  user: string | null;
  designation: string | null;
  equipment: string;
  model: string;
  serialNo: string;
  assetNo: string;
  oeTag?: string;
  pcName: string;
  os: string;
  ram: string;
  storage: string;
  purchaseDate: string;
  status: string;
  location: string;
  lastMaintenance: string;
  nextMaintenance: string | null;
  assignmentHistory: AssignmentHistory[];
}

// Enhanced asset data to match the sample format
const assetData: Asset[] = [
  { id: 1, department: "DMD", departmentSection: "Managing Director", user: "Ngoza Matakala", designation: "DMD", equipment: "Laptop", model: "HP ProBook 440G9", serialNo: "5CD249G1FK", assetNo: "AST001", pcName: "ZACLHQDMD", os: "Windows 11 Professional 64-bit", ram: "16GB", storage: "1TB", purchaseDate: "20/10/2023", status: "Serviceable", location: "Head Office", lastMaintenance: "2024-09-15", nextMaintenance: "2025-03-15", assignmentHistory: [
    { user: "Ngoza Matakala", department: "DMD", from: "2023-10-20", to: null, reason: "Primary work device" }
  ] },
  { id: 2, department: "MD", departmentSection: "Managing Director", user: "Elita Njovu", designation: "Personal Secretary Managing Director", equipment: "Desktop", model: "HP Elite SFF 600 G9", serialNo: "4CE30BF8X", assetNo: "AST002", oeTag: "OE-03024", pcName: "ZACLHQMD-SEC", os: "Windows 11 Professional 64-bit", ram: "8GB", storage: "512GB", purchaseDate: "23/08/2023", status: "Serviceable", location: "Head Office", lastMaintenance: "2024-02-15", nextMaintenance: "2025-02-15", assignmentHistory: [
    { user: "Elita Njovu", department: "MD", from: "2023-08-23", to: null, reason: "New hire equipment" }
  ] },
  { id: 3, department: "Internal Audit", departmentSection: "Managing Director", user: "Walker Nsemani", designation: "Manager Audit Services", equipment: "Laptop", model: "HP ProBook 440 G10", serialNo: "5CD333L34N", assetNo: "AST003", oeTag: "OE-3182", pcName: "", os: "Windows 11 Professional 64-bit", ram: "8GB", storage: "500GB", purchaseDate: "-", status: "Serviceable", location: "Head Office", lastMaintenance: "2024-09-10", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "Walker Nsemani", department: "Internal Audit", from: "2024-01-15", to: null, reason: "Department allocation" }
  ] },
  { id: 4, department: "Communications and Branding", departmentSection: "Managing Director", user: "Mweembe Sikaulu", designation: "Manager -Communications and Brand", equipment: "Laptop", model: "HP ProBook 440 G9", serialNo: "5CD249G1FW", assetNo: "AST004", pcName: "ZACLHQMDCBM", os: "Windows 11 Professional 64-bit", ram: "16GB", storage: "1TB", purchaseDate: "08/11/2023", status: "Serviceable", location: "KKIA", lastMaintenance: "2024-07-22", nextMaintenance: "2025-03-05", assignmentHistory: [
    { user: "Mweembe Sikaulu", department: "Communications and Branding", from: "2023-11-10", to: null, reason: "Department allocation" }
  ] },
  { id: 5, department: "Procurement", departmentSection: "Managing Director", user: "Twaambo Haambote", designation: "Procurement Officer", equipment: "Desktop", model: "HP ProDesk 600 G1 SFF", serialNo: "TRF4500M8G", assetNo: "AST005", pcName: "ZACLHQPROCURE1", os: "Windows 10 Profesional 64-bit", ram: "4GB", storage: "452 GB", purchaseDate: "-", status: "Serviceable", location: "Head Office", lastMaintenance: "2024-09-10", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "Twaambo Haambote", department: "Procurement", from: "2023-06-15", to: null, reason: "Primary work device" }
  ] },
  { id: 6, department: "Procurement", departmentSection: "Managing Director", user: "Emmanuel Zulu", designation: "Procurement Officer", equipment: "Laptop", model: "HP ProBook 650 G5", serialNo: "5CG02869HD", assetNo: "AST006", pcName: "ZACLHMMDPRO", os: "Windows 10 Professional 64-bit", ram: "4GB", storage: "500GB", purchaseDate: "-", status: "Serviceable", location: "MIA", lastMaintenance: "2024-08-18", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "Emmanuel Zulu", department: "Procurement", from: "2023-05-20", to: null, reason: "Field operations" }
  ] },
  { id: 7, department: "TSU", departmentSection: "Managing Director", user: "Simon Mulenga", designation: "Acting Manager - Civil Engineering", equipment: "Laptop", model: "HP ProBook 440 G9", serialNo: "5CD3060M3B", assetNo: "AST007", pcName: "ZACLHMDMCE1", os: "Windows 11 Professional 64-bit", ram: "16GB", storage: "1TB", purchaseDate: "15/03/2023", status: "Serviceable", location: "HMNIA", lastMaintenance: "2024-05-12", nextMaintenance: "2025-01-22", assignmentHistory: [
    { user: "Simon Mulenga", department: "TSU", from: "2023-03-20", to: null, reason: "Field operations" }
  ] },
  { id: 8, department: "IT", departmentSection: "Operations", user: "John Doe", designation: "IT Manager", equipment: "Laptop", model: "Dell XPS 15", serialNo: "SN12345", assetNo: "AST008", pcName: "IT-JD-001", os: "Windows 11", ram: "16GB", storage: "512GB SSD", purchaseDate: "15/05/2023", status: "Assigned", location: "Head Office", lastMaintenance: "2024-09-15", nextMaintenance: "2025-03-15", assignmentHistory: [
    { user: "Jane Smith", department: "Finance", from: "2023-05-20", to: "2023-08-15", reason: "Temporary assignment" },
    { user: "John Doe", department: "IT", from: "2023-08-16", to: null, reason: "Permanent assignment" }
  ] },
  { id: 9, department: "Finance", departmentSection: "Operations", user: "Jane Smith", designation: "Financial Analyst", equipment: "Desktop", model: "HP EliteDesk", serialNo: "SN67890", assetNo: "AST009", pcName: "FIN-JS-001", os: "Windows 10", ram: "8GB", storage: "1TB HDD", purchaseDate: "03/11/2022", status: "Assigned", location: "KKIA", lastMaintenance: "2024-10-05", nextMaintenance: "2025-04-05", assignmentHistory: [
    { user: "Jane Smith", department: "Finance", from: "2022-11-10", to: null, reason: "New hire equipment" }
  ] },
  { id: 10, department: "IT", departmentSection: "Operations", user: null, designation: null, equipment: "Server", model: "Dell PowerEdge", serialNo: "SN24680", assetNo: "AST010", pcName: "SRV-001", os: "Windows Server 2022", ram: "64GB", storage: "4TB RAID", purchaseDate: "18/06/2022", status: "In Storage", location: "Head Office - Server Room", lastMaintenance: "2024-08-18", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "IT Department", department: "IT", from: "2022-06-20", to: "2024-12-15", reason: "Production server" },
    { user: null, department: null, from: "2024-12-16", to: null, reason: "Replaced by newer model, kept as backup" }
  ] }
];

// Updated chart data
const statusData = [
  { name: 'Serviceable', value: 7, color: '#4caf50' },
  { name: 'Assigned', value: 2, color: '#2196f3' },
  { name: 'In Storage', value: 1, color: '#9e9e9e' }
];

const equipmentData = [
  { name: 'Laptop', value: 6, color: '#2196f3' },
  { name: 'Desktop', value: 3, color: '#03a9f4' },
  { name: 'Server', value: 1, color: '#009688' }
];

const locationData = [
  { name: 'Head Office', value: 6, color: '#3f51b5' },
  { name: 'KKIA', value: 1, color: '#673ab7' },
  { name: 'HMNIA', value: 1, color: '#9c27b0' },
  { name: 'MIA', value: 1, color: '#ff5722' },
  { name: 'Head Office - Server Room', value: 1, color: '#ff9800' }
];

const departmentData = [
  { name: 'DMD', count: 1 },
  { name: 'MD', count: 1 },
  { name: 'Internal Audit', count: 1 },
  { name: 'Communications and Branding', count: 1 },
  { name: 'Procurement', count: 2 },
  { name: 'TSU', count: 1 },
  { name: 'IT', count: 2 },
  { name: 'Finance', count: 1 }
];

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const styles = {
    'Serviceable': 'bg-green-100 text-green-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'In Storage': 'bg-gray-100 text-gray-800',
    'Unserviceable': 'bg-red-100 text-red-800',
    'Stolen': 'bg-purple-100 text-purple-800'
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

// Helper function to get equipment icon
const getEquipmentIcon = (equipment: string) => {
  switch (equipment) {
    case 'Laptop':
      return <Laptop className="mr-2" size={16} />;
    case 'Desktop':
      return <Monitor className="mr-2" size={16} />;
    case 'Printer':
      return <Printer className="mr-2" size={16} />;
    case 'Server':
      return <Server className="mr-2" size={16} />;
    case 'Contract Management':
      return <FileText className="mr-2" size={16} />;
    default:
      return null;
  }
};

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const navigate = useNavigate();
  
  // Filter assets based on search term and station filter
  const filteredAssets = assetData.filter(asset => {
    const matchesSearch = 
      asset.assetNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.user && asset.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNo && asset.serialNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStation = filterStation === 'All' || asset.location.includes(filterStation);
    
    return matchesSearch && matchesStation;
  });
  
  // List of stations for filtering
  const stations = [
    'All',
    'Head Office',
    'KKIA',
    'SMKIA',
    'HMNIA',
    'MIA',
    'Service Center',
    'Stores'
  ];
  
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
                  {stations.map((station) => (
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
                            <TableCell className="font-medium">{asset.serialNo}</TableCell>
                            <TableCell>{asset.departmentSection}</TableCell>
                            <TableCell>{asset.department}</TableCell>
                            <TableCell>{asset.user || '-'}</TableCell>
                            <TableCell>{asset.designation || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getEquipmentIcon(asset.equipment)}
                                {asset.equipment}
                              </div>
                            </TableCell>
                            <TableCell>{asset.model}</TableCell>
                            <TableCell>{asset.pcName || '-'}</TableCell>
                            <TableCell>{asset.os}</TableCell>
                            <TableCell>{asset.ram}</TableCell>
                            <TableCell>{asset.storage}</TableCell>
                            <TableCell>{asset.purchaseDate}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <AssetDistribution data={statusData} />
              
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
                        <div className="ml-auto font-medium">{(dept.count / assetData.length * 100).toFixed(0)}%</div>
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
