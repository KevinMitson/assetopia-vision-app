
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface Station {
  id: string;
  name: string;
  code: string;
}

interface PersonnelDialogProps {
  isOpen: boolean;
  onClose: (refreshData: boolean) => void;
  personnel: Personnel | null;
}

export function PersonnelDialog({ isOpen, onClose, personnel }: PersonnelDialogProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({
    full_name: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    station: '',
    join_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const { toast } = useToast();

  // Departments and statuses for dropdowns
  const departments = ['IT', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales', 'Legal', 'Security'];
  const statuses = ['Active', 'On Leave', 'Inactive'];

  useEffect(() => {
    if (personnel) {
      setFormData({
        full_name: personnel.full_name || '',
        department: personnel.department || '',
        designation: personnel.designation || '',
        email: personnel.email || '',
        phone: personnel.phone || '',
        station: personnel.station || '',
        join_date: personnel.join_date ? new Date(personnel.join_date).toISOString().split('T')[0] : '',
        status: personnel.status || 'Active',
      });
    }
    
    fetchStations();
  }, [personnel]);

  const fetchStations = async () => {
    try {
      setIsLoadingStations(true);
      const { data, error } = await supabase
        .from('stations')
        .select('id, name, code');
      
      if (error) throw error;
      
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast({
        title: "Error",
        description: "Could not load stations data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStations(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (personnel) {
        // Update existing personnel
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', personnel.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Personnel updated successfully"
        });
      } else {
        // Create new personnel (this would typically involve user creation in auth)
        // For demo purposes, we'll create a new profile directly
        const { error } = await supabase
          .from('profiles')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Personnel added successfully"
        });
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast({
        title: "Error",
        description: personnel ? "Could not update personnel" : "Could not add personnel",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{personnel ? 'Edit Personnel' : 'Add New Personnel'}</DialogTitle>
          <DialogDescription>
            {personnel ? 'Update personnel information in the system.' : 'Add a new personnel to the system.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name" 
                name="full_name" 
                value={formData.full_name || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department || ''} 
                onValueChange={(value) => handleSelectChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input 
                id="designation" 
                name="designation" 
                value={formData.designation || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="station">Station</Label>
              <Select 
                value={formData.station || ''} 
                onValueChange={(value) => handleSelectChange('station', value)}
                disabled={isLoadingStations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingStations ? "Loading..." : "Select station"} />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.name}>{station.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date</Label>
              <Input 
                id="join_date" 
                name="join_date" 
                type="date" 
                value={formData.join_date || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'Active'} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                personnel ? 'Update' : 'Add Personnel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
