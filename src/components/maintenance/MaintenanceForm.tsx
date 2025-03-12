import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { fetchAssetByIdentifier, addMaintenanceRecord, NewMaintenanceRecord } from '@/lib/maintenanceService';
import { Loader2, Search } from 'lucide-react';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: { id: string; full_name: string }[];
}

// Form schema
const maintenanceFormSchema = z.object({
  // Equipment Information
  asset_id: z.string().min(1, 'Asset is required'),
  equipment_type: z.string().optional(),
  make_model: z.string().optional(),
  serial_number: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  assigned_user: z.string().optional(),

  // Maintenance Information
  maintenance_type: z.enum(['Scheduled', 'Preventive', 'Corrective', 'Emergency']),
  date_performed: z.date().transform(date => date.toISOString()),
  technician_name: z.string().min(1, 'Technician name is required'),
  technician_id: z.string().optional(),
  maintenance_interval: z.enum(['Monthly', 'Quarterly', 'Bi-annually', 'Annually', 'As needed']).optional(),

  // Hardware Inspection
  exterior_condition: z.enum(['Good', 'Fair', 'Poor', 'N/A']).optional(),
  exterior_action: z.enum(['Cleaned', 'Repaired', 'N/A']).optional(),
  exterior_notes: z.string().optional(),

  cooling_fans_condition: z.enum(['Good', 'Fair', 'Poor', 'N/A']).optional(),
  cooling_fans_action: z.enum(['Cleaned', 'Replaced', 'N/A']).optional(),
  cooling_fans_notes: z.string().optional(),

  power_supply_condition: z.enum(['Good', 'Fair', 'Poor', 'N/A']).optional(),
  power_supply_action: z.enum(['Tested', 'Replaced', 'N/A']).optional(),
  power_supply_notes: z.string().optional(),

  // Software Maintenance
  os_updates: z.boolean().optional(),
  os_updates_notes: z.string().optional(),
  antivirus_updates: z.boolean().optional(),
  antivirus_updates_notes: z.string().optional(),
  application_updates: z.boolean().optional(),
  application_updates_notes: z.string().optional(),
  driver_updates: z.boolean().optional(),
  driver_updates_notes: z.string().optional(),
  disk_cleanup: z.boolean().optional(),
  disk_cleanup_notes: z.string().optional(),

  // Performance Metrics
  boot_time_before: z.string().optional(),
  boot_time_after: z.string().optional(),
  memory_usage_before: z.string().optional(),
  memory_usage_after: z.string().optional(),
  disk_space_before: z.string().optional(),
  disk_space_after: z.string().optional(),
  cpu_temp_before: z.string().optional(),
  cpu_temp_after: z.string().optional(),

  // Issues and Summary
  issues_found: z.boolean(),
  issues_description: z.string().optional(),
  parts_replaced: z.string().optional(),
  software_updated: z.string().optional(),
  time_spent: z.number().min(0),
  followup_required: z.boolean(),
  next_maintenance_date: z.date().optional().transform(date => date?.toISOString()),
  additional_comments: z.string().optional(),

  // Sign-off
  technician_signature: z.string().min(1, 'Technician signature is required'),
  supervisor_id: z.string().optional(),
  supervisor_signature: z.string().optional()
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export function MaintenanceForm({ isOpen, onClose, onSuccess, users }: MaintenanceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      issues_found: false,
      followup_required: false,
      os_updates: false,
      antivirus_updates: false,
      application_updates: false,
      driver_updates: false,
      disk_cleanup: false,
    },
  });

  // Handle asset search and auto-population
  const handleAssetSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { asset, error } = await fetchAssetByIdentifier(searchQuery);
      
      if (error) {
        throw new Error(error);
      }
      
      if (asset) {
        // Auto-populate form fields with asset data
        form.setValue('asset_id', asset.id);
        form.setValue('equipment_type', asset.type);
        form.setValue('make_model', asset.make_model);
        form.setValue('serial_number', asset.serial_number);
        form.setValue('location', asset.location);
        form.setValue('department', asset.department);
        if (asset.assigned_user) {
          form.setValue('assigned_user', asset.assigned_user.id);
        }
        
        toast({
          title: 'Asset Found',
          description: 'Form has been populated with asset information.',
        });
      } else {
        toast({
          title: 'Asset Not Found',
          description: 'No asset found with the provided identifier.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error searching for asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to search for asset',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: MaintenanceFormValues) => {
    setIsLoading(true);
    try {
      // Ensure required fields are present
      const maintenanceRecord: NewMaintenanceRecord = {
        asset_id: data.asset_id,
        maintenance_type: data.maintenance_type,
        date_performed: data.date_performed,
        technician_name: data.technician_name,
        technician_signature: data.technician_signature,
        time_spent: data.time_spent,
        issues_found: data.issues_found,
        followup_required: data.followup_required,
        // Optional fields
        equipment_type: data.equipment_type,
        make_model: data.make_model,
        serial_number: data.serial_number,
        location: data.location,
        department: data.department,
        assigned_user: data.assigned_user,
        maintenance_interval: data.maintenance_interval,
        technician_id: data.technician_id,
        next_maintenance_date: data.next_maintenance_date,
        additional_comments: data.additional_comments,
        supervisor_id: data.supervisor_id,
        supervisor_signature: data.supervisor_signature,
        // Hardware inspection fields
        exterior_condition: data.exterior_condition,
        exterior_action: data.exterior_action,
        exterior_notes: data.exterior_notes,
        cooling_fans_condition: data.cooling_fans_condition,
        cooling_fans_action: data.cooling_fans_action,
        cooling_fans_notes: data.cooling_fans_notes,
        power_supply_condition: data.power_supply_condition,
        power_supply_action: data.power_supply_action,
        power_supply_notes: data.power_supply_notes,
        // Software maintenance fields
        os_updates: data.os_updates,
        os_updates_notes: data.os_updates_notes,
        antivirus_updates: data.antivirus_updates,
        antivirus_updates_notes: data.antivirus_updates_notes,
        application_updates: data.application_updates,
        application_updates_notes: data.application_updates_notes,
        driver_updates: data.driver_updates,
        driver_updates_notes: data.driver_updates_notes,
        disk_cleanup: data.disk_cleanup,
        disk_cleanup_notes: data.disk_cleanup_notes,
        // Performance metrics
        boot_time_before: data.boot_time_before,
        boot_time_after: data.boot_time_after,
        memory_usage_before: data.memory_usage_before,
        memory_usage_after: data.memory_usage_after,
        disk_space_before: data.disk_space_before,
        disk_space_after: data.disk_space_after,
        cpu_temp_before: data.cpu_temp_before,
        cpu_temp_after: data.cpu_temp_after,
        // Issues and summary
        issues_description: data.issues_description,
        parts_replaced: data.parts_replaced,
        software_updated: data.software_updated
      };

      const { record, error } = await addMaintenanceRecord(maintenanceRecord);
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: 'Success',
        description: 'Maintenance record has been saved.',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving maintenance record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save maintenance record',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search by serial number, asset tag, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAssetSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>

            <Tabs defaultValue="equipment" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="software">Software</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              {/* Equipment Information Tab */}
              <TabsContent value="equipment" className="space-y-4">
                <FormField
                  control={form.control}
                  name="equipment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Desktop">Desktop</SelectItem>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Printer">Printer</SelectItem>
                          <SelectItem value="Network Device">Network Device</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Add other equipment fields */}
              </TabsContent>

              {/* Maintenance Information Tab */}
              <TabsContent value="maintenance" className="space-y-4">
                <FormField
                  control={form.control}
                  name="maintenance_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select maintenance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Preventive">Preventive</SelectItem>
                          <SelectItem value="Corrective">Corrective</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Add other maintenance fields */}
              </TabsContent>

              {/* Hardware Inspection Tab */}
              <TabsContent value="hardware" className="space-y-4">
                {/* Add hardware inspection fields */}
              </TabsContent>

              {/* Software Maintenance Tab */}
              <TabsContent value="software" className="space-y-4">
                {/* Add software maintenance fields */}
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                {/* Add summary fields */}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Record'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 