
import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { stationsData, Station } from '@/components/assets/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ManageStations = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>(stationsData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newStation, setNewStation] = useState<Omit<Station, 'id'>>({
    name: '',
    code: '',
    location: '',
    status: 'Active'
  });
  
  const [editingValues, setEditingValues] = useState<Station>({
    id: '',
    name: '',
    code: '',
    location: '',
    status: 'Active'
  });
  
  // Get unique locations for dropdown options
  const uniqueLocations = Array.from(new Set(stations.map(station => station.location))).sort();
  
  const handleEdit = (station: Station) => {
    setEditingId(station.id);
    setEditingValues(station);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = () => {
    setStations(prev => 
      prev.map(station => 
        station.id === editingId ? editingValues : station
      )
    );
    setEditingId(null);
    toast({
      title: "Station updated",
      description: "Station has been successfully updated.",
    });
  };
  
  const handleDelete = (id: string) => {
    setStations(prev => prev.filter(station => station.id !== id));
    toast({
      title: "Station deleted",
      description: "Station has been successfully removed.",
    });
  };
  
  const handleAdd = () => {
    const newId = `station-${Date.now()}`;
    setStations(prev => [...prev, { id: newId, ...newStation }]);
    setNewStation({ name: '', code: '', location: '', status: 'Active' });
    setDialogOpen(false);
    toast({
      title: "Station added",
      description: "New station has been successfully added.",
    });
  };
  
  return (
    <ManagementLayout 
      title="Manage Stations" 
      description="Add, edit, and delete stations in the system"
      onAddNew={() => setDialogOpen(true)}
      addNewLabel="Add Station"
    >
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>
                    {editingId === station.id ? (
                      <Input 
                        value={editingValues.name} 
                        onChange={(e) => setEditingValues({...editingValues, name: e.target.value})}
                      />
                    ) : (
                      station.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === station.id ? (
                      <Input 
                        value={editingValues.code} 
                        onChange={(e) => setEditingValues({...editingValues, code: e.target.value})}
                      />
                    ) : (
                      station.code
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === station.id ? (
                      <Select 
                        value={editingValues.location}
                        onValueChange={(value) => setEditingValues({...editingValues, location: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">+ Add New Location</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      station.location
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === station.id ? (
                      <Select 
                        value={editingValues.status}
                        onValueChange={(value) => setEditingValues({
                          ...editingValues, 
                          status: value as 'Active' | 'Inactive' | 'Under Maintenance'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        className={
                          station.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          station.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {station.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === station.id ? (
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
                          <Button variant="outline" size="sm" onClick={() => handleEdit(station)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(station.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No stations found. Add a new station to get started.
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
            <DialogTitle>Add New Station</DialogTitle>
            <DialogDescription>
              Enter the details for the new station.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Station Name</label>
              <Input
                id="name"
                value={newStation.name}
                onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                placeholder="Enter station name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">Station Code</label>
              <Input
                id="code"
                value={newStation.code}
                onChange={(e) => setNewStation({...newStation, code: e.target.value})}
                placeholder="Enter station code"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Select 
                value={newStation.location}
                onValueChange={(value) => setNewStation({...newStation, location: value})}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add New Location</SelectItem>
                </SelectContent>
              </Select>
              
              {newStation.location === 'new' && (
                <Input
                  className="mt-2"
                  value=""
                  onChange={(e) => setNewStation({...newStation, location: e.target.value})}
                  placeholder="Enter new location"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select 
                value={newStation.status}
                onValueChange={(value) => setNewStation({
                  ...newStation, 
                  status: value as 'Active' | 'Inactive' | 'Under Maintenance'
                })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newStation.name || !newStation.code || !newStation.location}
            >
              Add Station
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
};

export default ManageStations;
