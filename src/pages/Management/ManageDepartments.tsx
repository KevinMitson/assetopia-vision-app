
import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X, Check, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { departmentsData, Department } from '@/components/assets/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ManageDepartments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>(departmentsData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newDepartment, setNewDepartment] = useState<Omit<Department, 'id'>>({
    name: '',
    section: ''
  });
  
  const [editingValues, setEditingValues] = useState<Department>({
    id: '',
    name: '',
    section: ''
  });
  
  // Get unique sections for dropdown options
  const uniqueSections = Array.from(new Set(departments.map(dept => dept.section))).sort();
  
  const handleEdit = (department: Department) => {
    setEditingId(department.id);
    setEditingValues(department);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = () => {
    setDepartments(prev => 
      prev.map(dept => 
        dept.id === editingId ? editingValues : dept
      )
    );
    setEditingId(null);
    toast({
      title: "Department updated",
      description: "Department has been successfully updated.",
    });
  };
  
  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
    toast({
      title: "Department deleted",
      description: "Department has been successfully removed.",
    });
  };
  
  const handleAdd = () => {
    const newId = `dept-${Date.now()}`;
    setDepartments(prev => [...prev, { id: newId, ...newDepartment }]);
    setNewDepartment({ name: '', section: '' });
    setDialogOpen(false);
    toast({
      title: "Department added",
      description: "New department has been successfully added.",
    });
  };
  
  return (
    <ManagementLayout 
      title="Manage Departments" 
      description="Add, edit, and delete departments in the system"
      onAddNew={() => setDialogOpen(true)}
      addNewLabel="Add Department"
    >
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    {editingId === department.id ? (
                      <Input 
                        value={editingValues.name} 
                        onChange={(e) => setEditingValues({...editingValues, name: e.target.value})}
                      />
                    ) : (
                      department.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === department.id ? (
                      <Select 
                        value={editingValues.section}
                        onValueChange={(value) => setEditingValues({...editingValues, section: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueSections.map(section => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">+ Add New Section</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      department.section
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === department.id ? (
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
                          <Button variant="outline" size="sm" onClick={() => handleEdit(department)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(department.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No departments found. Add a new department to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Enter the details for the new department.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Department Name</label>
              <Input
                id="name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="section" className="text-sm font-medium">Department Section</label>
              <Select 
                value={newDepartment.section}
                onValueChange={(value) => setNewDepartment({...newDepartment, section: value})}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSections.map(section => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add New Section</SelectItem>
                </SelectContent>
              </Select>
              
              {newDepartment.section === 'new' && (
                <Input
                  className="mt-2"
                  value=""
                  onChange={(e) => setNewDepartment({...newDepartment, section: e.target.value})}
                  placeholder="Enter new section name"
                />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newDepartment.name || !newDepartment.section}>
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
};

export default ManageDepartments;
