
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Laptop,
  Monitor,
  Printer,
  Server,
  Smartphone,
  Tablet,
  Network,
  Key,
  Package
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssetType, AssetStatus } from '@/components/dashboard/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Create schema for form validation
const assetFormSchema = z.object({
  assetNo: z.string().min(1, { message: "Asset number is required" }),
  equipment: z.string().min(1, { message: "Equipment type is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  serialNo: z.string().min(1, { message: "Serial number is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  purchaseDate: z.string().min(1, { message: "Purchase date is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  user: z.string().optional(),
  designation: z.string().optional(),
  pcName: z.string().optional(),
  os: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  licenseKey: z.string().optional(),
  expiryDate: z.string().optional(),
  warranty: z.string().optional(),
  cost: z.string().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

// Define what fields should be shown for each asset type
const assetTypeFields: Record<AssetType, string[]> = {
  'Laptop': ['pcName', 'os', 'ram', 'storage', 'user', 'designation', 'warranty', 'vendor'],
  'Desktop': ['pcName', 'os', 'ram', 'storage', 'user', 'designation', 'warranty', 'vendor'],
  'Printer': ['warranty', 'vendor'],
  'Switch': ['warranty', 'vendor'],
  'Server': ['pcName', 'os', 'ram', 'storage', 'warranty', 'vendor'],
  'License': ['licenseKey', 'expiryDate', 'user', 'designation'],
  'Phone': ['os', 'storage', 'user', 'designation', 'warranty', 'vendor'],
  'iPad': ['os', 'storage', 'user', 'designation', 'warranty', 'vendor'],
  'Other': ['warranty', 'vendor'],
};

// Icons for each asset type
const assetTypeIcons: Record<AssetType, React.ReactNode> = {
  'Laptop': <Laptop className="mr-2" size={16} />,
  'Desktop': <Monitor className="mr-2" size={16} />,
  'Printer': <Printer className="mr-2" size={16} />,
  'Switch': <Network className="mr-2" size={16} />,
  'Server': <Server className="mr-2" size={16} />,
  'License': <Key className="mr-2" size={16} />,
  'Phone': <Smartphone className="mr-2" size={16} />,
  'iPad': <Tablet className="mr-2" size={16} />,
  'Other': <Package className="mr-2" size={16} />,
};

const departments = [
  'IT', 'Finance', 'HR', 'Marketing', 'Operations', 'Legal', 'Administration', 'Procurement', 'Executive'
];

const locations = [
  'Head Office', 'KKIA', 'SMKIA', 'HMNIA', 'MIA', 'Service Center', 'Stores'
];

const statuses: AssetStatus[] = [
  'Assigned', 'Available', 'Under Maintenance', 'In Storage', 'Unserviceable', 'Stolen'
];

export function AssetForm() {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetNo: '',
      equipment: '',
      model: '',
      serialNo: '',
      department: '',
      location: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Available',
      user: '',
      designation: '',
      pcName: '',
      os: '',
      ram: '',
      storage: '',
      lastMaintenance: '',
      nextMaintenance: '',
      licenseKey: '',
      expiryDate: '',
      warranty: '',
      cost: '',
      vendor: '',
      notes: '',
    },
  });

  const assetType = form.watch('equipment') as AssetType;
  const shouldShowField = (fieldName: string) => {
    if (!assetType) return false;
    return assetTypeFields[assetType as AssetType]?.includes(fieldName) || false;
  };

  function onSubmit(data: AssetFormValues) {
    toast.success("Asset created successfully", {
      description: `Asset ${data.assetNo} has been added to inventory.`,
    });
    console.log(data);
    
    // Reset form after submission
    form.reset({
      assetNo: '',
      equipment: '',
      model: '',
      serialNo: '',
      department: '',
      location: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Available',
      user: '',
      designation: '',
      pcName: '',
      os: '',
      ram: '',
      storage: '',
      lastMaintenance: '',
      nextMaintenance: '',
      licenseKey: '',
      expiryDate: '',
      warranty: '',
      cost: '',
      vendor: '',
      notes: '',
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Asset</CardTitle>
        <CardDescription>Enter details to register a new asset in the inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Asset Information */}
              <FormField
                control={form.control}
                name="assetNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="AST001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Type *</FormLabel>
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
                        {Object.keys(assetTypeIcons).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center">
                              {assetTypeIcons[type as AssetType]}
                              {type}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of equipment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model/Make *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dell XPS 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="SN12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hardware-specific fields */}
              {shouldShowField('pcName') && (
                <FormField
                  control={form.control}
                  name="pcName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PC Name</FormLabel>
                      <FormControl>
                        <Input placeholder="IT-JD-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('os') && (
                <FormField
                  control={form.control}
                  name="os"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System</FormLabel>
                      <FormControl>
                        <Input placeholder="Windows 11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('ram') && (
                <FormField
                  control={form.control}
                  name="ram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM</FormLabel>
                      <FormControl>
                        <Input placeholder="16GB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('storage') && (
                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage</FormLabel>
                      <FormControl>
                        <Input placeholder="512GB SSD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* License-specific fields */}
              {shouldShowField('licenseKey') && (
                <FormField
                  control={form.control}
                  name="licenseKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Key</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXXX-XXXXX-XXXXX-XXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('expiryDate') && (
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* User assignment fields */}
              {shouldShowField('user') && (
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned User</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('designation') && (
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="IT Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Maintenance fields */}
              <FormField
                control={form.control}
                name="lastMaintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Maintenance Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextMaintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Maintenance Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional fields */}
              {shouldShowField('warranty') && (
                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Period</FormLabel>
                      <FormControl>
                        <Input placeholder="3 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Cost</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {shouldShowField('vendor') && (
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor/Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Dell Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Notes textarea - full width */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional information about this asset" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
