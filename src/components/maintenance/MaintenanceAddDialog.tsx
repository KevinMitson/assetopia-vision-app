import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { addMaintenanceRecord, MaintenanceRecord } from '@/lib/maintenanceService';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MaintenanceAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assetId: string;
  users: { id: string; full_name: string }[];
}

const MAINTENANCE_TYPES = [
  'Scheduled',
  'Preventive',
  'Corrective',
  'Emergency'
];

export function MaintenanceAddDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  assetId,
  users 
}: MaintenanceAddDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    maintenance_type: 'Preventive' as MaintenanceRecord['maintenance_type'],
    description: '',
    technician_name: '',
    cost: '',
    date_performed: new Date(),
    next_maintenance_date: null as Date | null
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.maintenance_type || !formData.description || !formData.technician_name || !formData.date_performed) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format dates for API submission
      const formattedData = {
        asset_id: assetId,
        maintenance_type: formData.maintenance_type,
        description: formData.description,
        technician_name: formData.technician_name,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        date_performed: formData.date_performed ? format(formData.date_performed, "yyyy-MM-dd'T'HH:mm:ss'Z'") : '',
        next_maintenance_date: formData.next_maintenance_date ? format(formData.next_maintenance_date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : undefined,
      };
      
      console.log("Submitting maintenance record:", formattedData);
      
      const { record, error } = await addMaintenanceRecord(formattedData);
      
      console.log("Response:", { record, error });
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: "Maintenance record added",
        description: "The maintenance record has been added successfully.",
      });
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding maintenance record:", error);
      toast({
        title: "Failed to add maintenance record",
        description: error.message || "An error occurred while adding the maintenance record.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      maintenance_type: 'Preventive' as MaintenanceRecord['maintenance_type'],
      description: '',
      technician_name: '',
      cost: '',
      date_performed: new Date(),
      next_maintenance_date: null
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            Enter the details of the maintenance performed on this asset.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance_type">Maintenance Type <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.maintenance_type} 
                onValueChange={(value) => handleSelectChange('maintenance_type', value)}
              >
                <SelectTrigger id="maintenance_type">
                  <SelectValue placeholder="Select Maintenance Type" />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the maintenance performed"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technician_name">Technician Name <span className="text-red-500">*</span></Label>
                <Input
                  id="technician_name"
                  name="technician_name"
                  value={formData.technician_name}
                  onChange={handleChange}
                  placeholder="Enter technician name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="Enter cost"
                  type="number"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_performed">Date Performed <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date_performed && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_performed ? format(formData.date_performed, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_performed}
                      onSelect={(date) => handleDateChange('date_performed', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="next_maintenance_date">Next Maintenance Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.next_maintenance_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.next_maintenance_date ? format(formData.next_maintenance_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.next_maintenance_date}
                      onSelect={(date) => handleDateChange('next_maintenance_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Record'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 