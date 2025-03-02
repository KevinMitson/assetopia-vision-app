
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpDown, Calendar, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Activity data
const activityData = [
  {
    id: '1',
    type: 'assignment',
    user: { name: 'Marcus Chen', initials: 'MC', department: 'IT' },
    action: 'assigned',
    asset: { name: 'Laptop - Dell XPS 15', id: 'AST001' },
    target: 'John Doe',
    timestamp: '2024-10-12 14:35',
    station: 'HQ',
    notes: 'Primary work device for new IT Manager'
  },
  {
    id: '2',
    type: 'maintenance',
    user: { name: 'Sarah Johnson', initials: 'SJ', department: 'IT Support' },
    action: 'scheduled maintenance',
    asset: { name: 'Server - Dell PowerEdge', id: 'AST006' },
    target: null,
    timestamp: '2024-10-12 11:22',
    station: 'HQ',
    notes: 'Quarterly maintenance - OS updates and security patches'
  },
  {
    id: '3',
    type: 'transfer',
    user: { name: 'David Wong', initials: 'DW', department: 'Operations' },
    action: 'transferred',
    asset: { name: 'Printer - HP LaserJet', id: 'AST023' },
    target: 'KKIA from HQ',
    timestamp: '2024-10-11 16:45',
    station: 'KKIA',
    notes: 'Needed for the finance department at KKIA'
  },
  {
    id: '4',
    type: 'issue',
    user: { name: 'Lisa Park', initials: 'LP', department: 'Marketing' },
    action: 'reported issue',
    asset: { name: 'Laptop - MacBook Air', id: 'AST008' },
    target: null,
    timestamp: '2024-10-11 09:18',
    station: 'HMNIA',
    notes: 'Battery not holding charge, needs replacement'
  },
  {
    id: '5',
    type: 'acquisition',
    user: { name: 'Robert Chen', initials: 'RC', department: 'Procurement' },
    action: 'added',
    asset: { name: '5 Desktop - Dell OptiPlex', id: 'Multiple' },
    target: null,
    timestamp: '2024-10-10 14:30',
    station: 'HQ',
    notes: 'New computers for the finance department expansion'
  },
  {
    id: '6',
    type: 'disposal',
    user: { name: 'Michael Torres', initials: 'MT', department: 'IT' },
    action: 'disposed',
    asset: { name: 'Desktop - Dell OptiPlex', id: 'AST007' },
    target: null,
    timestamp: '2024-10-10 11:50',
    station: 'MIA',
    notes: 'Motherboard failure, deemed not worth repairing'
  },
  {
    id: '7',
    type: 'return',
    user: { name: 'Alice Johnson', initials: 'AJ', department: 'Sales' },
    action: 'returned',
    asset: { name: 'Laptop - HP EliteBook', id: 'AST009' },
    target: 'IT Department',
    timestamp: '2024-10-09 16:25',
    station: 'SMKIA',
    notes: 'Project completed, laptop returned to IT inventory'
  },
  {
    id: '8',
    type: 'audit',
    user: { name: 'Emma Davis', initials: 'ED', department: 'Compliance' },
    action: 'completed audit',
    asset: { name: 'All assets', id: 'N/A' },
    target: null,
    timestamp: '2024-10-09 14:10',
    station: 'KKIA',
    notes: 'Quarterly asset audit - all assets accounted for'
  },
  {
    id: '9',
    type: 'maintenance',
    user: { name: 'Sarah Johnson', initials: 'SJ', department: 'IT Support' },
    action: 'completed maintenance',
    asset: { name: 'Laptop - MacBook Pro', id: 'AST003' },
    target: null,
    timestamp: '2024-10-08 15:35',
    station: 'Service Center',
    notes: 'Annual maintenance - OS updates and hardware checks'
  },
  {
    id: '10',
    type: 'theft',
    user: { name: 'Emma Davis', initials: 'ED', department: 'Marketing' },
    action: 'reported stolen',
    asset: { name: 'Laptop - MacBook Air', id: 'AST008' },
    target: null,
    timestamp: '2024-10-15 09:30',
    station: 'Unknown',
    notes: 'Laptop reported stolen during business trip to New York'
  }
];

// Activity trend data
const activityTrend = [
  { date: '2024-10-06', assignments: 3, transfers: 1, maintenance: 2, issues: 0, acquisitions: 0, disposals: 0 },
  { date: '2024-10-07', assignments: 1, transfers: 2, maintenance: 1, issues: 1, acquisitions: 3, disposals: 0 },
  { date: '2024-10-08', assignments: 2, transfers: 0, maintenance: 3, issues: 1, acquisitions: 0, disposals: 1 },
  { date: '2024-10-09', assignments: 1, transfers: 1, maintenance: 0, issues: 0, acquisitions: 0, disposals: 0 },
  { date: '2024-10-10', assignments: 0, transfers: 0, maintenance: 0, issues: 0, acquisitions: 5, disposals: 1 },
  { date: '2024-10-11', assignments: 0, transfers: 1, maintenance: 0, issues: 1, acquisitions: 0, disposals: 0 },
  { date: '2024-10-12', assignments: 1, transfers: 0, maintenance: 1, issues: 0, acquisitions: 0, disposals: 0 },
];

// Activity counts by type
const activityCountsByType = [
  { name: 'Assignments', count: 8 },
  { name: 'Transfers', count: 5 },
  { name: 'Maintenance', count: 7 },
  { name: 'Issues', count: 3 },
  { name: 'Acquisitions', count: 8 },
  { name: 'Disposals', count: 2 },
  { name: 'Returns', count: 1 },
  { name: 'Audits', count: 1 },
  { name: 'Thefts', count: 1 },
];

// Activity counts by station
const activityCountsByStation = [
  { name: 'HQ', count: 15 },
  { name: 'KKIA', count: 8 },
  { name: 'SMKIA', count: 5 },
  { name: 'HMNIA', count: 4 },
  { name: 'MIA', count: 3 },
  { name: 'Service Center', count: 1 },
];

// Function to get badge color based on activity type
const getActivityBadgeColor = (type: string) => {
  const colors = {
    assignment: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    transfer: 'bg-purple-100 text-purple-800',
    issue: 'bg-red-100 text-red-800',
    acquisition: 'bg-green-100 text-green-800',
    disposal: 'bg-gray-100 text-gray-800',
    return: 'bg-indigo-100 text-indigo-800',
    audit: 'bg-cyan-100 text-cyan-800',
    theft: 'bg-rose-100 text-rose-800'
  };
  
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const Activity = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Activity Tracking</h1>
            <p className="text-muted-foreground">Monitor all asset-related activities across stations</p>
          </div>
        </div>
        
        <Tabs defaultValue="log" className="space-y-4">
          <TabsList>
            <TabsTrigger value="log">Activity Log</TabsTrigger>
            <TabsTrigger value="analytics">Activity Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>All asset-related activities across stations</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-60">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search activities..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityData
                        .filter(activity => 
                          activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (activity.notes && activity.notes.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.timestamp}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{activity.user.name}</span>
                              <span className="text-xs text-muted-foreground">{activity.user.department}</span>
                            </div>
                          </TableCell>
                          <TableCell>{activity.action}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{activity.asset.name}</span>
                              <span className="text-xs text-muted-foreground">ID: {activity.asset.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>{activity.station}</TableCell>
                          <TableCell>
                            <Badge className={getActivityBadgeColor(activity.type)}>
                              {activity.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{activity.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>Activity trends over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityTrend}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--card)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="assignments" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="transfers" stroke="#8b5cf6" />
                      <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="issues" stroke="#ef4444" />
                      <Line type="monotone" dataKey="acquisitions" stroke="#10b981" />
                      <Line type="monotone" dataKey="disposals" stroke="#6b7280" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Type</CardTitle>
                  <CardDescription>Distribution of activities by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityCountsByType.map((item) => (
                      <div key={item.name} className="flex items-center">
                        <div className="mr-4 flex-1">
                          <div className="font-medium">{item.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${(item.count / Math.max(...activityCountsByType.map(i => i.count)) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="font-medium">{item.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Station</CardTitle>
                  <CardDescription>Distribution of activities by station</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityCountsByStation.map((item) => (
                      <div key={item.name} className="flex items-center">
                        <div className="mr-4 flex-1">
                          <div className="font-medium">{item.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${(item.count / Math.max(...activityCountsByStation.map(i => i.count)) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="font-medium">{item.count}</div>
                        </div>
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

export default Activity;
