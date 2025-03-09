
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
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Shield, 
  Plus, 
  FileEdit, 
  UserCheck, 
  Database, 
  FolderOpen, 
  Settings,
  ServerCog
} from 'lucide-react';

// Sample roles data
const rolesData = [
  { id: 1, name: "System Administrator", description: "Full access to all systems and data", members: 2, lastUpdated: "2024-03-15" },
  { id: 2, name: "Asset Manager", description: "Manage asset inventory and assignments", members: 4, lastUpdated: "2024-04-10" },
  { id: 3, name: "Personnel Manager", description: "Manage personnel records", members: 3, lastUpdated: "2024-02-20" },
  { id: 4, name: "Finance User", description: "View and report on financial data", members: 5, lastUpdated: "2024-05-01" },
  { id: 5, name: "Station Manager", description: "Manage specific station operations", members: 5, lastUpdated: "2024-04-25" },
  { id: 6, name: "Read Only User", description: "View only access to reports and dashboards", members: 12, lastUpdated: "2024-03-30" },
];

// Sample users with permissions data
const usersWithPermissions = [
  { id: 1, name: "John Doe", role: "System Administrator", department: "IT", permissions: ["Asset Management", "Personnel Management", "System Configuration", "User Administration"] },
  { id: 2, name: "Jane Smith", role: "Asset Manager", department: "Finance", permissions: ["Asset Viewing", "Asset Editing", "Inventory Reports"] },
  { id: 3, name: "Michael Brown", role: "Personnel Manager", department: "HR", permissions: ["Personnel Viewing", "Personnel Editing", "Personnel Reports"] },
  { id: 4, name: "Sarah Wilson", role: "Finance User", department: "Marketing", permissions: ["Asset Viewing", "Financial Reports"] },
  { id: 5, name: "David Lee", role: "Station Manager", department: "Operations", permissions: ["Asset Viewing", "Station Management", "Personnel Viewing"] },
  { id: 6, name: "Robert Chen", role: "Read Only User", department: "Finance", permissions: ["Asset Viewing", "Personnel Viewing", "Report Viewing"] },
];

const Permissions = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState(rolesData);
  const [filteredUsers, setFilteredUsers] = useState(usersWithPermissions);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredRoles(rolesData);
      setFilteredUsers(usersWithPermissions);
    } else {
      if (activeTab === "roles") {
        const filtered = rolesData.filter(role => 
          role.name.toLowerCase().includes(value) ||
          role.description.toLowerCase().includes(value)
        );
        setFilteredRoles(filtered);
      } else {
        const filtered = usersWithPermissions.filter(user => 
          user.name.toLowerCase().includes(value) ||
          user.role.toLowerCase().includes(value) ||
          user.department.toLowerCase().includes(value) ||
          user.permissions.some(p => p.toLowerCase().includes(value))
        );
        setFilteredUsers(filtered);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
    setFilteredRoles(rolesData);
    setFilteredUsers(usersWithPermissions);
  };

  return (
    <Layout>
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Permissions Control</h1>
          <Button className="flex gap-2 items-center">
            <Shield size={16} />
            <span>Manage Access</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Manage user roles and permissions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="roles" className="w-full" onValueChange={handleTabChange}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="users">Users & Permissions</TabsTrigger>
                </TabsList>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab === "roles" ? "roles" : "users"}...`}
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <TabsContent value="roles" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>{role.members}</TableCell>
                            <TableCell>{role.lastUpdated}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" title="Edit Role">
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Manage Members">
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No roles found with the search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="flex gap-2">
                    <Plus size={16} />
                    <span>Create New Role</span>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.permissions.map((permission, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {getPermissionIcon(permission)}
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" title="Edit Permissions">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No users found with the search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Helper function to get icon for permission type
const getPermissionIcon = (permission: string) => {
  const iconSize = 12;
  const iconClass = "mr-1";
  
  if (permission.includes("Asset")) {
    return <Database className={iconClass} size={iconSize} />;
  } else if (permission.includes("Personnel")) {
    return <UserCheck className={iconClass} size={iconSize} />;
  } else if (permission.includes("System")) {
    return <ServerCog className={iconClass} size={iconSize} />;
  } else if (permission.includes("Report")) {
    return <FolderOpen className={iconClass} size={iconSize} />;
  } else if (permission.includes("Station")) {
    return <Shield className={iconClass} size={iconSize} />;
  } else if (permission.includes("User")) {
    return <UserCheck className={iconClass} size={iconSize} />;
  } else {
    return <Settings className={iconClass} size={iconSize} />;
  }
};

export default Permissions;
