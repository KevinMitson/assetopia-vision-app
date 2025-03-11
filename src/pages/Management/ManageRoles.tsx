
import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, X, Check, Plus, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with ability to manage users, roles, and system settings',
    permissions: ['create_asset', 'view_asset', 'edit_asset', 'delete_asset', 'manage_users', 'manage_roles', 'manage_departments', 'manage_stations']
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage assets and view reports, but cannot manage system settings',
    permissions: ['create_asset', 'view_asset', 'edit_asset', 'delete_asset', 'view_reports']
  },
  {
    id: 'user',
    name: 'User',
    description: 'Basic access to view assets and submit requests',
    permissions: ['view_asset', 'request_asset']
  }
];

const allPermissions = [
  { id: 'create_asset', name: 'Create Asset', category: 'Assets' },
  { id: 'view_asset', name: 'View Asset', category: 'Assets' },
  { id: 'edit_asset', name: 'Edit Asset', category: 'Assets' },
  { id: 'delete_asset', name: 'Delete Asset', category: 'Assets' },
  { id: 'manage_users', name: 'Manage Users', category: 'Administration' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Administration' },
  { id: 'manage_departments', name: 'Manage Departments', category: 'Administration' },
  { id: 'manage_stations', name: 'Manage Stations', category: 'Administration' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'generate_reports', name: 'Generate Reports', category: 'Reports' },
  { id: 'request_asset', name: 'Request Asset', category: 'Assets' },
  { id: 'approve_request', name: 'Approve Requests', category: 'Requests' }
];

// Group permissions by category
const permissionsByCategory = allPermissions.reduce((acc, permission) => {
  if (!acc[permission.category]) {
    acc[permission.category] = [];
  }
  acc[permission.category].push(permission);
  return acc;
}, {} as Record<string, typeof allPermissions>);

const ManageRoles = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  
  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({
    name: '',
    description: '',
    permissions: []
  });
  
  const [editingValues, setEditingValues] = useState<Role>({
    id: '',
    name: '',
    description: '',
    permissions: []
  });
  
  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    setEditingValues(role);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = () => {
    setRoles(prev => 
      prev.map(role => 
        role.id === editingId ? editingValues : role
      )
    );
    setEditingId(null);
    toast({
      title: "Role updated",
      description: "Role has been successfully updated.",
    });
  };
  
  const handleDelete = (id: string) => {
    setRoles(prev => prev.filter(role => role.id !== id));
    toast({
      title: "Role deleted",
      description: "Role has been successfully removed.",
    });
  };
  
  const handleAdd = () => {
    const newId = newRole.name.toLowerCase().replace(/\s+/g, '-');
    setRoles(prev => [...prev, { id: newId, ...newRole }]);
    setNewRole({ name: '', description: '', permissions: [] });
    setDialogOpen(false);
    toast({
      title: "Role added",
      description: "New role has been successfully added.",
    });
  };
  
  const handleManagePermissions = (roleId: string) => {
    setActiveRoleId(roleId);
    setPermissionDialogOpen(true);
  };
  
  const handleTogglePermission = (permissionId: string) => {
    if (!activeRoleId) return;
    
    setRoles(prev => 
      prev.map(role => {
        if (role.id === activeRoleId) {
          const permissions = [...role.permissions];
          if (permissions.includes(permissionId)) {
            return { ...role, permissions: permissions.filter(p => p !== permissionId) };
          } else {
            return { ...role, permissions: [...permissions, permissionId] };
          }
        }
        return role;
      })
    );
  };
  
  return (
    <ManagementLayout 
      title="Manage Roles" 
      description="Create and manage user roles and their permissions"
      onAddNew={() => setDialogOpen(true)}
      addNewLabel="Add Role"
    >
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {editingId === role.id ? (
                      <Input 
                        value={editingValues.name} 
                        onChange={(e) => setEditingValues({...editingValues, name: e.target.value})}
                      />
                    ) : (
                      role.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === role.id ? (
                      <Textarea 
                        value={editingValues.description} 
                        onChange={(e) => setEditingValues({...editingValues, description: e.target.value})}
                        rows={2}
                      />
                    ) : (
                      role.description
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length > 0 ? (
                        <>
                          {role.permissions.slice(0, 2).map(permission => (
                            <Badge key={permission} variant="outline" className="mr-1">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="outline">+{role.permissions.length - 2} more</Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">No permissions assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === role.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleManagePermissions(role.id)}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(role.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No roles found. Add a new role to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Enter the details for the new role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Role Name</label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="Enter role name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newRole.name}
            >
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Select which permissions should be assigned to this role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-6 -mr-6">
            {activeRoleId && (
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map(permission => {
                        const rolePermissions = roles.find(r => r.id === activeRoleId)?.permissions || [];
                        const isSelected = rolePermissions.includes(permission.id);
                        
                        return (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`perm-${permission.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                            <label 
                              htmlFor={`perm-${permission.id}`} 
                              className="text-sm cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button onClick={() => setPermissionDialogOpen(false)}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
};

export default ManageRoles;
