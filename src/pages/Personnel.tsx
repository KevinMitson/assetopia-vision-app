import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, UserPlus, FileEdit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PersonnelDialog from '@/components/personnel/PersonnelDialog';

interface Personnel {
  id: string;
  full_name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  station: string;
  join_date: string;
  status: string;
}

const Personnel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      setPersonnel(data || []);
      setFilteredPersonnel(data || []);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast({
        title: "Error",
        description: "Could not load personnel data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredPersonnel(personnel);
    } else {
      const filtered = personnel.filter(person => 
        (person.full_name || '').toLowerCase().includes(value) ||
        (person.department || '').toLowerCase().includes(value) ||
        (person.designation || '').toLowerCase().includes(value) ||
        (person.email || '').toLowerCase().includes(value) ||
        (person.station || '').toLowerCase().includes(value)
      );
      setFilteredPersonnel(filtered);
    }
  };

  const handleAddClick = () => {
    setSelectedPersonnel(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this personnel record?")) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Personnel deleted successfully",
        });
        
        fetchPersonnel();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        toast({
          title: "Error",
          description: "Could not delete personnel",
          variant: "destructive"
        });
      }
    }
  };

  const handleDialogClose = (refreshData: boolean) => {
    setIsDialogOpen(false);
    if (refreshData) {
      fetchPersonnel();
    }
  };

  return (
    <Layout>
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Personnel Management</h1>
          <Button className="flex gap-2 items-center" onClick={handleAddClick}>
            <UserPlus size={16} />
            <span>Add Personnel</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Personnel Directory</CardTitle>
            <CardDescription>Manage employee records across all stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search personnel by name, department, station..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPersonnel.length > 0 ? (
                    filteredPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.full_name || 'N/A'}</TableCell>
                        <TableCell>{person.department || 'N/A'}</TableCell>
                        <TableCell>{person.designation || 'N/A'}</TableCell>
                        <TableCell>{person.station || 'N/A'}</TableCell>
                        <TableCell>{person.email || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            person.status === 'Active' ? 'bg-green-100 text-green-800' :
                            person.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {person.status || 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditClick(person)}>
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete" 
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(person.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No personnel found with the search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {isDialogOpen && (
        <PersonnelDialog 
          isOpen={isDialogOpen} 
          onClose={handleDialogClose}
          personnel={selectedPersonnel}
        />
      )}
    </Layout>
  );
};

export default Personnel;
