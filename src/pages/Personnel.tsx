
import { useState } from 'react';
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
import { Search, UserPlus, FileEdit, Trash2 } from 'lucide-react';

// Sample personnel data
const personnelData = [
  { id: 1, name: "John Doe", department: "IT", designation: "IT Manager", email: "john.doe@example.com", phone: "+1234567890", station: "Head Office", joinDate: "2022-05-15", status: "Active" },
  { id: 2, name: "Jane Smith", department: "Finance", designation: "Financial Analyst", email: "jane.smith@example.com", phone: "+1234567891", station: "KKIA", joinDate: "2022-11-10", status: "Active" },
  { id: 3, name: "Michael Brown", department: "HR", designation: "HR Director", email: "michael.brown@example.com", phone: "+1234567892", station: "Head Office", joinDate: "2023-01-25", status: "Active" },
  { id: 4, name: "Sarah Wilson", department: "Marketing", designation: "Marketing Manager", email: "sarah.wilson@example.com", phone: "+1234567893", station: "HMNIA", joinDate: "2022-12-11", status: "On Leave" },
  { id: 5, name: "David Lee", department: "Operations", designation: "Operations Director", email: "david.lee@example.com", phone: "+1234567894", station: "SMKIA", joinDate: "2023-03-10", status: "Active" },
  { id: 6, name: "Emma Davis", department: "Marketing", designation: "Content Specialist", email: "emma.davis@example.com", phone: "+1234567895", station: "MIA", joinDate: "2022-09-25", status: "Inactive" },
  { id: 7, name: "Robert Chen", department: "Finance", designation: "Procurement Officer", email: "robert.chen@example.com", phone: "+1234567896", station: "Head Office", joinDate: "2023-07-21", status: "Active" },
  { id: 8, name: "Tom Harris", department: "Finance", designation: "Accountant", email: "tom.harris@example.com", phone: "+1234567897", station: "KKIA", joinDate: "2021-12-05", status: "Active" },
  { id: 9, name: "Alice Johnson", department: "Sales", designation: "Sales Representative", email: "alice.johnson@example.com", phone: "+1234567898", station: "HMNIA", joinDate: "2023-04-15", status: "Active" },
  { id: 10, name: "William Zhang", department: "IT", designation: "Network Administrator", email: "william.zhang@example.com", phone: "+1234567899", station: "Head Office", joinDate: "2023-02-10", status: "Active" },
];

const Personnel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPersonnel, setFilteredPersonnel] = useState(personnelData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredPersonnel(personnelData);
    } else {
      const filtered = personnelData.filter(person => 
        person.name.toLowerCase().includes(value) ||
        person.department.toLowerCase().includes(value) ||
        person.designation.toLowerCase().includes(value) ||
        person.email.toLowerCase().includes(value) ||
        person.station.toLowerCase().includes(value)
      );
      setFilteredPersonnel(filtered);
    }
  };

  return (
    <Layout>
      <div className="animate-fadeIn space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Personnel Management</h1>
          <Button className="flex gap-2 items-center">
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
                  {filteredPersonnel.length > 0 ? (
                    filteredPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>{person.designation}</TableCell>
                        <TableCell>{person.station}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            person.status === 'Active' ? 'bg-green-100 text-green-800' :
                            person.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {person.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
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
    </Layout>
  );
};

export default Personnel;
