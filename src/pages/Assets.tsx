
import { useState } from 'react';
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

// Enhanced asset data as provided
const assetData = [
  { id: 1, department: "IT", user: "John Doe", designation: "IT Manager", equipment: "Laptop", model: "Dell XPS 15", serialNo: "SN12345", assetNo: "AST001", pcName: "IT-JD-001", os: "Windows 11", ram: "16GB", storage: "512GB SSD", purchaseDate: "2023-05-15", status: "Assigned", location: "Head Office", lastMaintenance: "2024-09-15", nextMaintenance: "2025-03-15", assignmentHistory: [
    { user: "Jane Smith", department: "Finance", from: "2023-05-20", to: "2023-08-15", reason: "Temporary assignment" },
    { user: "John Doe", department: "IT", from: "2023-08-16", to: null, reason: "Permanent assignment" }
  ] },
  { id: 2, department: "Finance", user: "Jane Smith", designation: "Financial Analyst", equipment: "Desktop", model: "HP EliteDesk", serialNo: "SN67890", assetNo: "AST002", pcName: "FIN-JS-001", os: "Windows 10", ram: "8GB", storage: "1TB HDD", purchaseDate: "2022-11-03", status: "Assigned", location: "KKIA", lastMaintenance: "2024-10-05", nextMaintenance: "2025-04-05", assignmentHistory: [
    { user: "Jane Smith", department: "Finance", from: "2022-11-10", to: null, reason: "New hire equipment" }
  ] },
  { id: 3, department: "HR", user: "Michael Brown", designation: "HR Director", equipment: "Laptop", model: "MacBook Pro", serialNo: "SN24680", assetNo: "AST003", pcName: "HR-MB-001", os: "macOS Ventura", ram: "32GB", storage: "1TB SSD", purchaseDate: "2023-01-20", status: "Under Maintenance", location: "Service Center", lastMaintenance: "2024-02-15", nextMaintenance: "2025-02-15", assignmentHistory: [
    { user: "Michael Brown", department: "HR", from: "2023-01-25", to: "2025-02-25", reason: "Primary work device" }
  ] },
  { id: 4, department: "Marketing", user: "Sarah Wilson", designation: "Marketing Manager", equipment: "Laptop", model: "Lenovo ThinkPad", serialNo: "SN13579", assetNo: "AST004", pcName: "MKT-SW-001", os: "Windows 11", ram: "16GB", storage: "512GB SSD", purchaseDate: "2022-08-12", status: "Assigned", location: "HMNIA", lastMaintenance: "2024-07-22", nextMaintenance: "2025-03-05", assignmentHistory: [
    { user: "Robert Chen", department: "IT", from: "2022-08-15", to: "2022-12-10", reason: "Testing and configuration" },
    { user: "Sarah Wilson", department: "Marketing", from: "2022-12-11", to: null, reason: "Department allocation" }
  ] },
  { id: 5, department: "Operations", user: "David Lee", designation: "Operations Director", equipment: "iPad", model: "iPad Pro", serialNo: "SN97531", assetNo: "AST005", pcName: "N/A", os: "iOS 16", ram: "8GB", storage: "256GB", purchaseDate: "2023-03-05", status: "Assigned", location: "SMKIA", lastMaintenance: "2024-09-10", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "David Lee", department: "Operations", from: "2023-03-10", to: null, reason: "Field operations" }
  ] },
  { id: 6, department: "IT", user: null, designation: null, equipment: "Server", model: "Dell PowerEdge", serialNo: "SN24680", assetNo: "AST006", pcName: "SRV-001", os: "Windows Server 2022", ram: "64GB", storage: "4TB RAID", purchaseDate: "2022-06-18", status: "In Storage", location: "Head Office - Server Room", lastMaintenance: "2024-08-18", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "IT Department", department: "IT", from: "2022-06-20", to: "2024-12-15", reason: "Production server" },
    { user: null, department: null, from: "2024-12-16", to: null, reason: "Replaced by newer model, kept as backup" }
  ] },
  { id: 7, department: "Finance", user: null, designation: null, equipment: "Desktop", model: "Dell OptiPlex", serialNo: "SN75319", assetNo: "AST007", pcName: "FIN-TH-001", os: "Windows 10", ram: "8GB", storage: "500GB SSD", purchaseDate: "2021-11-30", status: "Unserviceable", location: "Stores", lastMaintenance: "2024-05-12", nextMaintenance: null, assignmentHistory: [
    { user: "Tom Harris", department: "Finance", from: "2021-12-05", to: "2024-10-25", reason: "Primary work device" },
    { user: null, department: null, from: "2024-10-26", to: null, reason: "Motherboard failure, deemed not worth repairing" }
  ] },
  { id: 8, department: "Marketing", user: null, designation: null, equipment: "Laptop", model: "MacBook Air", serialNo: "SN86420", assetNo: "AST008", pcName: "MKT-ED-001", os: "macOS Monterey", ram: "16GB", storage: "512GB SSD", purchaseDate: "2022-09-22", status: "Stolen", location: "Unknown", lastMaintenance: "2024-06-22", nextMaintenance: null, assignmentHistory: [
    { user: "Emma Davis", department: "Marketing", from: "2022-09-25", to: "2024-10-15", reason: "Content creation" },
    { user: null, department: null, from: "2024-10-16", to: null, reason: "Reported stolen during business trip" }
  ] },
  { id: 9, department: "IT", user: null, designation: null, equipment: "Laptop", model: "HP EliteBook", serialNo: "SN54321", assetNo: "AST009", pcName: "IT-SPARE-001", os: "Windows 11", ram: "16GB", storage: "512GB SSD", purchaseDate: "2023-04-10", status: "Available", location: "Stores", lastMaintenance: "2024-09-10", nextMaintenance: "2025-03-10", assignmentHistory: [
    { user: "Alice Johnson", department: "Sales", from: "2023-04-15", to: "2024-09-30", reason: "Temporary project" },
    { user: null, department: null, from: "2024-10-01", to: null, reason: "Returned after project completion" }
  ] },
  { id: 10, department: "Finance", user: "Robert Chen", designation: "Procurement Officer", equipment: "Desktop", model: "Dell OptiPlex", serialNo: "SN11223", assetNo: "AST010", pcName: "FIN-RC-001", os: "Windows 10", ram: "16GB", storage: "1TB SSD", purchaseDate: "2023-07-12", status: "Assigned", location: "Head Office", lastMaintenance: "2024-06-12", nextMaintenance: "2025-06-12", assignmentHistory: [
    { user: "IT Team", department: "IT", from: "2023-07-15", to: "2023-07-20", reason: "Configuration" },
    { user: "Robert Chen", department: "Finance", from: "2023-07-21", to: null, reason: "New employee equipment" }
  ] },
];

// Chart data
const statusData = [
  { name: 'Assigned', value: 5, color: '#4caf50' },
  { name: 'Available', value: 1, color: '#2196f3' },
  { name: 'Under Maintenance', value: 1, color: '#ff9800' },
  { name: 'In Storage', value: 1, color: '#9e9e9e' },
  { name: 'Unserviceable', value: 1, color: '#f44336' },
  { name: 'Stolen', value: 1, color: '#9c27b0' }
];

const equipmentData = [
  { name: 'Laptop', value: 4, color: '#2196f3' },
  { name: 'Desktop', value: 3, color: '#03a9f4' },
  { name: 'iPad', value: 1, color: '#00bcd4' },
  { name: 'Server', value: 2, color: '#009688' }
];

const locationData = [
  { name: 'Head Office', value: 3, color: '#3f51b5' },
  { name: 'Stores', value: 2, color: '#9e9e9e' },
  { name: 'KKIA', value: 2, color: '#673ab7' },
  { name: 'HMNIA', value: 1, color: '#9c27b0' },
  { name: 'SMKIA', value: 1, color: '#e91e63' },
  { name: 'Service Center', value: 1, color: '#ff9800' }
];

const departmentData = [
  { name: 'IT', count: 3 },
  { name: 'Finance', count: 3 },
  { name: 'Marketing', count: 2 },
  { name: 'HR', count: 1 },
  { name: 'Operations', count: 1 }
];

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const styles = {
    'Assigned': 'bg-green-100 text-green-800',
    'Available': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'In Storage': 'bg-gray-100 text-gray-800',
    'Unserviceable': 'bg-red-100 text-red-800',
    'Stolen': 'bg-purple-100 text-purple-800'
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

const Assets = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Assets Management</h1>
            <p className="text-muted-foreground">Manage and track all company equipment</p>
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
                      {assetData.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.assetNo}</TableCell>
                          <TableCell>{asset.equipment}</TableCell>
                          <TableCell>{asset.model}</TableCell>
                          <TableCell>{asset.department}</TableCell>
                          <TableCell>{asset.user || '-'}</TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(asset.status)}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.nextMaintenance || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

export default Assets;
