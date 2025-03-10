import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const stationData = [
  {
    id: 'hq',
    name: 'HQ',
    location: 'Main Campus',
    assetCount: 1245,
    utilization: 78,
    lastInventoryCheck: '2024-10-05',
    nextInventoryCheck: '2025-01-05',
    assetsByType: [
      { name: 'Laptops', count: 490 },
      { name: 'Desktops', count: 320 },
      { name: 'Printers', count: 85 },
      { name: 'Contract Documents', count: 350 }
    ],
    assetsByStatus: [
      { name: 'Operational', count: 1065, color: '#4caf50' },
      { name: 'Maintenance', count: 105, color: '#ff9800' },
      { name: 'Issues', count: 75, color: '#f44336' }
    ],
    contactPerson: 'Marcus Chen',
    position: 'Station Manager',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 'kkia',
    name: 'KKIA',
    location: 'East Wing',
    assetCount: 983,
    utilization: 65,
    lastInventoryCheck: '2024-09-15',
    nextInventoryCheck: '2025-01-15',
    assetsByType: [
      { name: 'Laptops', count: 320 },
      { name: 'Desktops', count: 280 },
      { name: 'Printers', count: 65 },
      { name: 'Contract Documents', count: 318 }
    ],
    assetsByStatus: [
      { name: 'Operational', count: 865, color: '#4caf50' },
      { name: 'Maintenance', count: 78, color: '#ff9800' },
      { name: 'Issues', count: 40, color: '#f44336' }
    ],
    contactPerson: 'Sarah Johnson',
    position: 'Station Manager',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 'smkia',
    name: 'SMKIA',
    location: 'North Wing',
    assetCount: 1478,
    utilization: 85,
    lastInventoryCheck: '2024-09-28',
    nextInventoryCheck: '2025-01-28',
    assetsByType: [
      { name: 'Laptops', count: 580 },
      { name: 'Desktops', count: 420 },
      { name: 'Printers', count: 120 },
      { name: 'Contract Documents', count: 358 }
    ],
    assetsByStatus: [
      { name: 'Operational', count: 1295, color: '#4caf50' },
      { name: 'Maintenance', count: 123, color: '#ff9800' },
      { name: 'Issues', count: 60, color: '#f44336' }
    ],
    contactPerson: 'David Wong',
    position: 'Station Manager',
    email: 'david.wong@example.com',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 'hmnia',
    name: 'HMNIA',
    location: 'South Wing',
    assetCount: 742,
    utilization: 92,
    lastInventoryCheck: '2024-10-02',
    nextInventoryCheck: '2025-01-02',
    assetsByType: [
      { name: 'Laptops', count: 285 },
      { name: 'Desktops', count: 180 },
      { name: 'Printers', count: 62 },
      { name: 'Contract Documents', count: 215 }
    ],
    assetsByStatus: [
      { name: 'Operational', count: 623, color: '#4caf50' },
      { name: 'Maintenance', count: 85, color: '#ff9800' },
      { name: 'Issues', count: 34, color: '#f44336' }
    ],
    contactPerson: 'Lisa Park',
    position: 'Station Manager',
    email: 'lisa.park@example.com',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 'mia',
    name: 'MIA',
    location: 'West Wing',
    assetCount: 389,
    utilization: 54,
    lastInventoryCheck: '2024-09-20',
    nextInventoryCheck: '2025-01-20',
    assetsByType: [
      { name: 'Laptops', count: 145 },
      { name: 'Desktops', count: 90 },
      { name: 'Printers', count: 35 },
      { name: 'Contract Documents', count: 119 }
    ],
    assetsByStatus: [
      { name: 'Operational', count: 298, color: '#4caf50' },
      { name: 'Maintenance', count: 65, color: '#ff9800' },
      { name: 'Issues', count: 26, color: '#f44336' }
    ],
    contactPerson: 'Michael Torres',
    position: 'Station Manager',
    email: 'michael.torres@example.com',
    phone: '+1 (555) 567-8901'
  }
];

const assetDistributionByStation = [
  { name: 'HQ', laptops: 490, desktops: 320, printers: 85, contracts: 350 },
  { name: 'KKIA', laptops: 320, desktops: 280, printers: 65, contracts: 318 },
  { name: 'SMKIA', laptops: 580, desktops: 420, printers: 120, contracts: 358 },
  { name: 'HMNIA', laptops: 285, desktops: 180, printers: 62, contracts: 215 },
  { name: 'MIA', laptops: 145, desktops: 90, printers: 35, contracts: 119 }
];

const getStatusColor = (utilization: number) => {
  if (utilization >= 80) return 'bg-green-100 text-green-800';
  if (utilization >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const Stations = () => {
  const [selectedStation, setSelectedStation] = useState(stationData[0]);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Stations Overview</h1>
            <p className="text-muted-foreground">Monitor all stations and their asset distribution</p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Asset Distribution</TabsTrigger>
            <TabsTrigger value="details">Station Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Stations</CardTitle>
                <CardDescription>Current status of all stations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station</TableHead>
                        <TableHead>Asset Count</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Next Inventory Check</TableHead>
                        <TableHead>Contact Person</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stationData.map((station) => (
                        <TableRow key={station.id} onClick={() => setSelectedStation(station)} className="cursor-pointer">
                          <TableCell className="font-medium">{station.name}</TableCell>
                          <TableCell>{station.assetCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={station.utilization} className="h-2 w-24" />
                              <Badge className={getStatusColor(station.utilization)}>
                                {station.utilization}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{station.nextInventoryCheck}</TableCell>
                          <TableCell>{station.contactPerson}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution by Station</CardTitle>
                <CardDescription>Distribution of equipment types across all stations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assetDistributionByStation}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--card)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="laptops" name="Laptops" fill="#3b82f6" />
                      <Bar dataKey="desktops" name="Desktops" fill="#8b5cf6" />
                      <Bar dataKey="printers" name="Printers" fill="#10b981" />
                      <Bar dataKey="contracts" name="Contract Docs" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold">Station Details</h2>
              <div>
                <TabsList>
                  {stationData.map((station) => (
                    <TabsTrigger 
                      key={station.id}
                      value={station.id}
                      onClick={() => setSelectedStation(station)}
                      className={selectedStation.id === station.id ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {station.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedStation.name} - Station Information</CardTitle>
                  <CardDescription>Basic station information and contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                      <dd className="text-lg">{selectedStation.location}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">Asset Count</dt>
                      <dd className="text-lg">{selectedStation.assetCount}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">Utilization</dt>
                      <dd className="flex items-center gap-2">
                        <Progress value={selectedStation.utilization} className="h-2 w-32" />
                        <span>{selectedStation.utilization}%</span>
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">Last Inventory Check</dt>
                      <dd className="text-lg">{selectedStation.lastInventoryCheck}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-muted-foreground">Next Inventory Check</dt>
                      <dd className="text-lg">{selectedStation.nextInventoryCheck}</dd>
                    </div>
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                          <dd className="text-lg">{selectedStation.contactPerson}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-muted-foreground">Position</dt>
                          <dd className="text-lg">{selectedStation.position}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                          <dd className="text-lg">{selectedStation.email}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                          <dd className="text-lg">{selectedStation.phone}</dd>
                        </div>
                      </div>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Asset Status</CardTitle>
                  <CardDescription>Current status of assets at {selectedStation.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedStation.assetsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="count"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {selectedStation.assetsByStatus.map((entry, index) => (
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
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Asset Type Distribution</h3>
                    <div className="space-y-4">
                      {selectedStation.assetsByType.map((asset) => (
                        <div key={asset.name} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.count} {asset.count === 1 ? 'asset' : 'assets'}
                            </p>
                          </div>
                          <div className="ml-auto font-medium">
                            {(asset.count / selectedStation.assetCount * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
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

export default Stations;
