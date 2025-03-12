import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserImportDialog } from '@/components/users/UserImportDialog';
import { UserAddDialog } from '@/components/users/UserAddDialog';
import { Download, FileSpreadsheet, Plus, Search, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fetchAllUsers, debugUserData } from '@/lib/userService';
import { User } from '@/types';

export default function Users() {
  const [activeTab, setActiveTab] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStation, setFilterStation] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [stations, setStations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use our service function to fetch users
      const { users, error } = await fetchAllUsers();

      if (error) {
        throw error;
      }

      // Set users from data
      setUsers(users || []);

      // Extract unique values for filters
      if (users && users.length > 0) {
        const uniqueStations = [...new Set(users.map(user => user.station).filter(Boolean))];
        const uniqueDepartments = [...new Set(users.map(user => user.department).filter(Boolean))];
        const uniqueRoles = [...new Set(users.map(user => user.role_name).filter(Boolean))];
        
        setStations(uniqueStations);
        setDepartments(uniqueDepartments);
        setRoles(uniqueRoles);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.department?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStation = filterStation === '' || user.station === filterStation;
      const matchesDepartment = filterDepartment === '' || user.department === filterDepartment;
      const matchesRole = filterRole === '' || user.role_name === filterRole;
      
      return matchesSearch && matchesStation && matchesDepartment && matchesRole;
    });
  }, [users, searchTerm, filterStation, filterDepartment, filterRole]);

  // Handle export to Excel
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredUsers.map(user => ({
        'Name': user.full_name || '',
        'Email': user.email || '',
        'Role': user.role_name || '',
        'Department': user.department || '',
        'Station': user.station || '',
        'Created At': new Date(user.created_at).toLocaleDateString()
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Generate Excel file
      XLSX.writeFile(workbook, 'Users_Export.xlsx');

      toast({
        title: 'Export Successful',
        description: `Successfully exported ${exportData.length} users to Excel.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export users to Excel.',
        variant: 'destructive',
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStation('');
    setFilterDepartment('');
    setFilterRole('');
    setShowFilters(false);
  };

  // Count active filters
  const activeFiltersCount = [
    filterStation, 
    filterDepartment, 
    filterRole
  ].filter(Boolean).length;

  const handleDebug = async () => {
    try {
      await debugUserData();
      toast({
        title: "Debug Complete",
        description: "Check the browser console for debug information",
      });
      // Force refresh the users data
      fetchUsers();
    } catch (error) {
      console.error("Debug error:", error);
      toast({
        title: "Debug Error",
        description: "An error occurred during debugging",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Users
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <Button variant="outline" onClick={handleDebug} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800">
            Debug Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">User List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} in the system
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Popover open={showFilters} onOpenChange={setShowFilters}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="relative">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 h-5">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Users</h4>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger id="role">
                              <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All Roles</SelectItem>
                              {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="station">Station</Label>
                          <Select value={filterStation} onValueChange={setFilterStation}>
                            <SelectTrigger id="station">
                              <SelectValue placeholder="All Stations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All Stations</SelectItem>
                              {stations.map((station) => (
                                <SelectItem key={station} value={station}>
                                  {station}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                            <SelectTrigger id="department">
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All Departments</SelectItem>
                              {departments.map((department) => (
                                <SelectItem key={department} value={department}>
                                  {department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExport}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export to Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* Active filters display */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filterRole && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Role: {filterRole}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilterRole('')}
                      />
                    </Badge>
                  )}
                  {filterStation && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Station: {filterStation}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilterStation('')}
                      />
                    </Badge>
                  )}
                  {filterDepartment && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Department: {filterDepartment}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilterDepartment('')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={fetchUsers}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No users found matching your criteria.</p>
                  {(searchTerm || activeFiltersCount > 0) && (
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Station</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role_name || 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{user.station}</TableCell>
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
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>
                Overview of user distribution across roles, departments and stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Role Distribution</h3>
                  {/* Role distribution chart would go here */}
                  <div className="space-y-2">
                    {roles.map(role => {
                      const count = users.filter(user => user.role_name === role).length;
                      const percentage = Math.round((count / users.length) * 100);
                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{role}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Department Distribution</h3>
                  {/* Department distribution chart would go here */}
                  <div className="space-y-2">
                    {departments.map(dept => {
                      const count = users.filter(user => user.department === dept).length;
                      const percentage = Math.round((count / users.length) * 100);
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{dept}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Station Distribution</h3>
                  {/* Station distribution chart would go here */}
                  <div className="space-y-2">
                    {stations.map(station => {
                      const count = users.filter(user => user.station === station).length;
                      const percentage = Math.round((count / users.length) * 100);
                      return (
                        <div key={station} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{station}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <UserImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onSuccess={fetchUsers}
      />

      {/* Add User Dialog */}
      <UserAddDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={fetchUsers}
        stations={stations}
        departments={departments}
      />
    </div>
  );
} 