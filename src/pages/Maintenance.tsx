import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm';
import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileSpreadsheet, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchMaintenanceRecords, MaintenanceRecord } from '@/lib/maintenanceService';
import { fetchAllUsers } from '@/lib/userService';
import { User } from '@/types';
import { MaintenanceReportDialog } from '@/components/maintenance/MaintenanceReportDialog';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format, subMonths } from 'date-fns';

const Maintenance = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('all');
  
  const recordsPerPage = 10;

  // Fetch maintenance records with filters
  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const offset = (page - 1) * recordsPerPage;
      
      const { records, count, error } = await fetchMaintenanceRecords({
        assetId: selectedAssetId,
        technicianId: selectedTechnicianId === 'all' ? undefined : selectedTechnicianId,
        maintenanceType: maintenanceType === 'all' ? undefined : maintenanceType as any,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        searchQuery: searchQuery.trim() !== '' ? searchQuery : undefined,
        limit: recordsPerPage,
        offset
      });
      
      if (error) {
        throw new Error(error);
      }
      
      setMaintenanceRecords(records);
      setTotalRecords(count);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching maintenance records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load maintenance records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for technician selection
  const fetchUsers = async () => {
    try {
      const { users: userData, error } = await fetchAllUsers();
      
      if (error) {
        throw new Error(error);
      }
      
      setUsers(userData);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    }
  };

  // Initial data load
  useEffect(() => {
    fetchRecords();
    fetchUsers();
  }, []);

  // Refetch when filters change, but not when search query changes
  // (we want to trigger search only when the button is clicked)
  useEffect(() => {
    fetchRecords(1); // Reset to first page when filters change
  }, [selectedAssetId, selectedTechnicianId, maintenanceType, startDate, endDate]);

  // Handle search
  const handleSearch = () => {
    fetchRecords(1); // Reset to first page when searching
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setMaintenanceType('all');
    setStartDate(subMonths(new Date(), 3));
    setEndDate(undefined);
    setSelectedAssetId(undefined);
    setSelectedTechnicianId('all');
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchRecords(); // Refresh the list
    toast({
      title: 'Success',
      description: 'Maintenance record saved successfully',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Records</h1>
            <p className="text-muted-foreground">
              Track and manage equipment maintenance activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsReportOpen(true)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Maintenance Record
            </Button>
          </div>
        </div>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">All Records</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Maintenance</TabsTrigger>
            <TabsTrigger value="completed">Completed Maintenance</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex">
                  <Input
                    placeholder="Search by asset tag, serial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="secondary" 
                    className="rounded-l-none"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Type</label>
                <Select 
                  value={maintenanceType} 
                  onValueChange={setMaintenanceType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Technician</label>
                <Select 
                  value={selectedTechnicianId} 
                  onValueChange={setSelectedTechnicianId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Technicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  placeholder="From"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  placeholder="To"
                />
              </div>
            </div>
            
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
          
          <TabsContent value="records" className="space-y-4">
            <MaintenanceList
              records={maintenanceRecords}
              isLoading={loading}
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecords / recordsPerPage)}
              onPageChange={fetchRecords}
              onRefresh={() => fetchRecords(currentPage)}
              users={users}
              error={null}
              assetId={selectedAssetId || ''}
            />
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <MaintenanceList
              records={maintenanceRecords.filter(record => 
                record.next_maintenance_date && new Date(record.next_maintenance_date) > new Date()
              )}
              isLoading={loading}
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecords / recordsPerPage)}
              onPageChange={fetchRecords}
              onRefresh={() => fetchRecords(currentPage)}
              emptyMessage="No upcoming maintenance scheduled"
              users={users}
              error={null}
              assetId={selectedAssetId || ''}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <MaintenanceList
              records={maintenanceRecords.filter(record => 
                !record.next_maintenance_date || new Date(record.next_maintenance_date) <= new Date()
              )}
              isLoading={loading}
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecords / recordsPerPage)}
              onPageChange={fetchRecords}
              onRefresh={() => fetchRecords(currentPage)}
              emptyMessage="No completed maintenance records found"
              users={users}
              error={null}
              assetId={selectedAssetId || ''}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Maintenance Form Dialog */}
      {isFormOpen && (
        <MaintenanceForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          users={users}
        />
      )}

      {/* Report Dialog */}
      {isReportOpen && (
        <MaintenanceReportDialog
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          users={users}
        />
      )}
    </Layout>
  );
};

export default Maintenance; 