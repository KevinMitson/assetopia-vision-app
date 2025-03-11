
import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Shield, 
  Plus, 
  FileEdit, 
  UserCheck, 
  Database, 
  FolderOpen, 
  Settings,
  ServerCog,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

// Interface for roles data
interface Role {
  id: number;
  name: string;
  description: string;
  members: number;
  lastUpdated: string;
  editing?: boolean;
}

// Interface for users with permissions
interface UserWithPermissions {
  id: number;
  name: string;
  role: string;
  department: string;
  permissions: string[];
  editing?: boolean;
}

// Sample roles data
const initialRolesData: Role[] = [
  { id: 1, name: "System Administrator", description: "Full access to all systems and data", members: 2, lastUpdated: "2024-03-15" },
  { id: 2, name: "Asset Manager", description: "Manage asset inventory and assignments", members: 4, lastUpdated: "2024-04-10" },
  { id: 3, name: "Personnel Manager", description: "Manage personnel records", members: 3, lastUpdated: "2024-02-20" },
  { id: 4, name: "Finance User", description: "View and report on financial data", members: 5, lastUpdated: "2024-05-01" },
  { id: 5, name: "Station Manager", description: "Manage specific station operations", members: 5, lastUpdated: "2024-04-25" },
  { id: 6, name: "Read Only User", description: "View only access to reports and dashboards", members: 12, lastUpdated: "2024-03-30" },
];

// Sample users with permissions data
const initialUsersWithPermissions: UserWithPermissions[] = [
  { id: 1, name: "John Doe", role: "System Administrator", department: "IT", permissions: ["Asset Management", "Personnel Management", "System Configuration", "User Administration"] },
  { id: 2, name: "Jane Smith", role: "Asset Manager", department: "Finance", permissions: ["Asset Viewing", "Asset Editing", "Inventory Reports"] },
  { id: 3, name: "Michael Brown", role: "Personnel Manager", department: "HR", permissions: ["Personnel Viewing", "Personnel Editing", "Personnel Reports"] },
  { id: 4, name: "Sarah Wilson", role: "Finance User", department: "Marketing", permissions: ["Asset Viewing", "Financial Reports"] },
  { id: 5, name: "David Lee", role: "Station Manager", department: "Operations", permissions: ["Asset Viewing", "Station Management", "Personnel Viewing"] },
  { id: 6, name: "Robert Chen", role: "Read Only User", department: "Finance", permissions: ["Asset Viewing", "Personnel Viewing", "Report Viewing"] },
];

// All available permissions for the system
const allPermissions = [
  "Asset Management", "Personnel Management", "System Configuration", "User Administration",
  "Asset Viewing", "Asset Editing", "Inventory Reports", "Personnel Viewing", 
  "Personnel Editing", "Personnel Reports", "Financial Reports", "Station Management",
  "Report Viewing"
];

const Permissions = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const [rolesData, setRolesData] = useState<Role[]>(initialRolesData);
  const [usersWithPermissions, setUsersWithPermissions] = useState<UserWithPermissions[]>(initialUsersWithPermissions);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(initialRolesData);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPermissions[]>(initialUsersWithPermissions);
  const [editedRole, setEditedRole] = useState<Role | null>(null);
  const [editedUser, setEditedUser] = useState<UserWithPermissions | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<Omit<Role, 'id' | 'members' | 'lastUpdated'>>({
    name: '',
    description: ''
  });

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

  // Function to handle editing a role
  const handleEditRole = (role: Role) => {
    setEditedRole({...role});
    const updatedRoles = rolesData.map(r => ({
      ...r,
      editing: r.id === role.id
    }));
    setRolesData(updatedRoles);
    setFilteredRoles(updatedRoles);
  };

  // Function to save edited role
  const handleSaveRole = (role: Role) => {
    if (!editedRole) return;
    
    const updatedRoles = rolesData.map(r => {
      if (r.id === role.id) {
        return {
          ...r, 
          name: editedRole.name,
          description: editedRole.description,
          lastUpdated: new Date().toISOString().split('T')[0],
          editing: false
        };
      }
      return {...r, editing: false};
    });
    
    setRolesData(updatedRoles);
    setFilteredRoles(updatedRoles);
    setEditedRole(null);
    
    toast({
      title: "Role updated",
      description: `The role "${editedRole.name}" has been updated successfully.`,
    });
  };

  // Function to cancel editing a role
  const handleCancelEditRole = () => {
    const updatedRoles = rolesData.map(r => ({...r, editing: false}));
    setRolesData(updatedRoles);
    setFilteredRoles(updatedRoles);
    setEditedRole(null);
  };

  // Function to handle manage permissions dialog
  const handleManagePermissions = (userId: number) => {
    const user = usersWithPermissions.find(u => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setSelectedPermissions([...user.permissions]);
      setShowPermissionsDialog(true);
    }
  };

  // Function to toggle a permission
  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions(prevPermissions => {
      if (prevPermissions.includes(permission)) {
        return prevPermissions.filter(p => p !== permission);
      } else {
        return [...prevPermissions, permission];
      }
    });
  };

  // Function to save permissions
  const handleSavePermissions = () => {
    if (selectedUserId === null) return;
    
    const updatedUsers = usersWithPermissions.map(user => {
      if (user.id === selectedUserId) {
        return {...user, permissions: selectedPermissions};
      }
      return user;
    });
    
    setUsersWithPermissions(updatedUsers);
    setFilteredUsers(updatedUsers);
    setShowPermissionsDialog(false);
    setSelectedUserId(null);
    
    toast({
      title: "Permissions updated",
      description: "User permissions have been updated successfully.",
    });
  };

  // Function to handle adding a new role
  const handleAddRole = () => {
    if (!newRole.name) return;
    
    const newId = Math.max(...rolesData.map(r => r.id)) + 1;
    const roleToAdd: Role = {
      id: newId,
      name: newRole.name,
      description: newRole.description,
      members: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    const updatedRoles = [...rolesData, roleToAdd];
    setRolesData(updatedRoles);
    setFilteredRoles(updatedRoles);
    setNewRole({ name: '', description: '' });
    setShowAddRoleDialog(false);
    
    toast({
      title: "Role added",
      description: `The role "${roleToAdd.name}" has been added successfully.`,
    });
  };

  useEffect(() => {
    // Update filtered lists when underlying data changes
    if (searchTerm.trim() === "") {
      setFilteredRoles(rolesData);
      setFilteredUsers(usersWithPermissions);
    }
  }, [rolesData, usersWithPermissions, searchTerm]);

  return (
    <Layout>
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Permissions Control</h1>
          {isAdmin && (
            <Button className="flex gap-2 items-center">
              <Shield size={16} />
              <span>Manage Access</span>
            </Button>
          )}
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
                            <TableCell className="font-medium">
                              {role.editing && editedRole ? (
                                <Input 
                                  value={editedRole.name} 
                                  onChange={(e) => setEditedRole({...editedRole, name: e.target.value})}
                                />
                              ) : (
                                role.name
                              )}
                            </TableCell>
                            <TableCell>
                              {role.editing && editedRole ? (
                                <Textarea 
                                  value={editedRole.description} 
                                  onChange={(e) => setEditedRole({...editedRole, description: e.target.value})}
                                  rows={2}
                                />
                              ) : (
                                role.description
                              )}
                            </TableCell>
                            <TableCell>{role.members}</TableCell>
                            <TableCell>{role.lastUpdated}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {role.editing ? (
                                  <>
                                    <Button variant="outline" size="icon" title="Save" onClick={() => handleSaveRole(role)}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" title="Cancel" onClick={handleCancelEditRole}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      title="Edit Role" 
                                      onClick={() => handleEditRole(role)}
                                      disabled={!isAdmin}
                                    >
                                      <FileEdit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      title="Manage Members" 
                                      disabled={!isAdmin}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
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
                {isAdmin && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="flex gap-2"
                      onClick={() => setShowAddRoleDialog(true)}
                    >
                      <Plus size={16} />
                      <span>Create New Role</span>
                    </Button>
                  </div>
                )}
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Edit Permissions" 
                                onClick={() => handleManagePermissions(user.id)}
                                disabled={!isAdmin}
                              >
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

        {/* Add Role Dialog */}
        <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role to the system with a name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="role-name" className="text-sm font-medium">Role Name</label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRole} disabled={!newRole.name}>Add Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Permissions</DialogTitle>
              <DialogDescription>
                Select the permissions you want to assign to this user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 py-4 max-h-[60vh] overflow-y-auto pr-6 -mr-6">
              {allPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`perm-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handleTogglePermission(permission)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={`perm-${permission}`}
                    className="text-sm cursor-pointer"
                  >
                    {permission}
                  </label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
              <Button onClick={handleSavePermissions}>Save Permissions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
