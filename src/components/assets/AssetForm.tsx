
import React, { useState, useEffect } from 'react';
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
  Package,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
import { Checkbox } from '@/components/ui/checkbox';

// Create schema for form validation
const assetFormSchema = z.object({
  assetNo: z.string().optional(),
  equipment: z.string().min(1, { message: "Equipment type is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  serialNo: z.string().min(1, { message: "Serial number is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  departmentSection: z.string().min(1, { message: "Department section is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  purchaseDate: z.string().optional(),
  status: z.string().min(1, { message: "Status is required" }),
  user: z.string().optional(),
  designation: z.string().optional(),
  pcName: z.string().optional(),
  oeTag: z.string().optional(),
  os: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  notes: z.string().optional(),
  useCurrentUser: z.boolean().default(false),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

// Define what fields should be shown for each asset type
const assetTypeFields: Record<AssetType, string[]> = {
  'Laptop': ['pcName', 'oeTag', 'os', 'ram', 'storage', 'user', 'designation'],
  'Desktop': ['pcName', 'oeTag', 'os', 'ram', 'storage', 'user', 'designation'],
  'Printer': [],
  'Switch': [],
  'Server': ['pcName', 'os', 'ram', 'storage'],
  'License': [],
  'Phone': ['os', 'storage', 'user', 'designation'],
  'iPad': ['os', 'storage', 'user', 'designation'],
  'Other': [],
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

// Department data structure based on provided image
const departmentSections = [
  'Managing Director',
  'DMD',
  'MD',
  'Internal Audit',
  'Communications and Branding',
  'Procurement',
  'TSU',
  'Finance',
  'IT',
  'HR',
  'Operations',
  'Marketing',
  'Legal',
  'Administration'
];

const departments = [
  'DMD',
  'MD',
  'Internal Audit',
  'Communications and Branding',
  'Procurement',
  'TSU',
  'Finance',
  'IT',
  'HR',
  'Operations',
  'Marketing',
  'Legal',
  'Administration'
];

const locations = [
  'Head Office', 'KKIA', 'SMKIA', 'HMNIA', 'MIA', 'Service Center', 'Stores'
];

const statuses = [
  'Serviceable', 'Unserviceable', 'Assigned', 'Available', 'Under Maintenance', 'In Storage', 'Stolen'
];

// Sample users from the image data
const sampleUsers = [
  { name: 'Ngoza Matakala', designation: 'DMD', department: 'DMD', departmentSection: 'Managing Director' },
  { name: 'Elita Njovu', designation: 'Personal Secretary Managing Director', department: 'MD', departmentSection: 'Managing Director' },
  { name: 'Walker Nsemani', designation: 'Manager Audit Services', department: 'Internal Audit', departmentSection: 'Managing Director' },
  { name: 'Mweembe Sikaulu', designation: 'Manager -Communications and Brand', department: 'Communications and Branding', departmentSection: 'Managing Director' },
  { name: 'Twaambo Haambote', designation: 'Procurement Officer', department: 'Procurement', departmentSection: 'Managing Director' },
  { name: 'Emmanuel Zulu', designation: 'Procurement Officer', department: 'Procurement', departmentSection: 'Managing Director' },
  { name: 'Simon Mulenga', designation: 'Acting Manager - Civil Engineering', department: 'TSU', departmentSection: 'Managing Director' },
];

interface AssignmentHistory {
  user: string | null;
  department: string | null;
  from: string;
  to: string | null;
  reason: string;
}

export function AssetForm() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetNo: '',
      equipment: '',
      model: '',
      serialNo: '',
      department: '',
      departmentSection: 'Managing Director',
      location: 'Head Office',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Serviceable',
      user: '',
      designation: '',
      pcName: '',
      oeTag: '',
      os: '',
      ram: '',
      storage: '',
      lastMaintenance: '',
      nextMaintenance: '',
      notes: '',
      useCurrentUser: false,
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Watch for changes to determine which fields to show
  const assetType = form.watch('equipment') as AssetType;
  const useCurrentUser = form.watch('useCurrentUser');
  const selectedDepartment = form.watch('department');
  
  // Update user and designation fields when useCurrentUser changes
  useEffect(() => {
    if (useCurrentUser && userProfile) {
      form.setValue('user', userProfile.full_name || '');
      form.setValue('designation', userProfile.designation || '');
      form.setValue('department', userProfile.department || form.getValues('department'));
    } else if (!useCurrentUser && form.getValues('user') === userProfile?.full_name) {
      form.setValue('user', '');
      form.setValue('designation', '');
    }
  }, [useCurrentUser, userProfile, form]);

  // Update designation when a sample user is selected
  useEffect(() => {
    if (selectedUser) {
      const user = sampleUsers.find(u => u.name === selectedUser);
      if (user) {
        form.setValue('designation', user.designation);
        form.setValue('department', user.department);
        form.setValue('departmentSection', user.departmentSection);
      }
    }
  }, [selectedUser, form]);

  const shouldShowField = (fieldName: string) => {
    if (!assetType) return false;
    return assetTypeFields[assetType as AssetType]?.includes(fieldName) || false;
  };

  async function onSubmit(data: AssetFormValues) {
    setIsLoading(true);
    
    try {
      // Generate asset number if not provided
      const assetNo = data.assetNo || `AST${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create assignment history entry
      const assignmentHistory: AssignmentHistory[] = [];
      
      if (data.status === 'Assigned' && data.user) {
        assignmentHistory.push({
          user: data.user,
          department: data.department,
          from: format(new Date(), 'yyyy-MM-dd'),
          to: null,
          reason: data.notes ? `Initial assignment: ${data.notes}` : 'Initial assignment'
        });
      }
      
      // Insert asset into Supabase
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert({
          department: data.department,
          department_section: data.departmentSection,
          user_name: data.user || null,
          designation: data.designation || null,
          equipment: data.equipment,
          model: data.model,
          serial_no: data.serialNo,
          asset_no: assetNo,
          oe_tag: data.oeTag || null,
          pc_name: data.pcName || null,
          os: data.os || null,
          ram: data.ram || null,
          storage: data.storage || null,
          purchase_date: data.purchaseDate || null,
          status: data.status,
          location: data.location,
          last_maintenance: data.lastMaintenance || format(new Date(), 'yyyy-MM-dd'),
          next_maintenance: data.nextMaintenance || null
        })
        .select('id')
        .single();
      
      if (assetError) throw assetError;
      
      // Insert assignment history if there's a user assigned
      if (assignmentHistory.length > 0 && assetData) {
        const history = assignmentHistory[0];
        
        const { error: historyError } = await supabase
          .from('assignment_history')
          .insert({
            asset_id: assetData.id,
            user_name: history.user,
            department: history.department,
            from_date: history.from,
            to_date: history.to,
            reason: history.reason
          });
        
        if (historyError) throw historyError;
      }
      
      // Show success message
      toast.success("Asset created successfully", {
        description: `Asset ${data.serialNo} has been added to inventory.`,
      });
      
      // Navigate to inventory page
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast.error("Failed to save asset", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
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
              {/* Department Information */}
              <FormField
                control={form.control}
                name="departmentSection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Section *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentSections.map((section) => (
                          <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              {/* User Assignment Section */}
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedUser(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">-- No user assigned --</SelectItem>
                        {sampleUsers.map((user) => (
                          <SelectItem key={user.name} value={user.name}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Asset Information */}
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
                      <Input placeholder="HP ProBook 440 G9" {...field} />
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
                      <Input placeholder="5CD249G1FK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {shouldShowField('oeTag') && (
                <FormField
                  control={form.control}
                  name="oeTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="OE-03024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('pcName') && (
                <FormField
                  control={form.control}
                  name="pcName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PC Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ZACLHQMD-SEC" {...field} />
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
                        <Input placeholder="Windows 11 Professional 64-bit" {...field} />
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
                        <Input placeholder="1TB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty if unknown
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/assets')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
