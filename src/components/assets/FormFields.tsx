import React, { useState } from 'react';
import { AssetType } from '@/components/dashboard/types';
import { assetTypeIcons, assetTypeFields, departments, departmentSections, locations, statuses, sampleUsers, departmentsData, stationsData } from './constants';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { AssetFormValues } from './types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps {
  form: UseFormReturn<AssetFormValues>;
  setSelectedUser?: (value: string) => void;
}

export const DepartmentSectionField: React.FC<FieldProps> = ({ form }) => (
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
);

export const DepartmentField: React.FC<FieldProps> = ({ form }) => (
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
);

export const UserField: React.FC<FieldProps> = ({ form, setSelectedUser }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = searchQuery === "" 
    ? sampleUsers 
    : sampleUsers.filter((user) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <FormField
      control={form.control}
      name="user"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>User</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <div
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? field.value === "unassigned" ? "-- No user assigned --" : field.value : "Select user"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search user..." 
                  onValueChange={setSearchQuery} 
                />
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  <CommandItem
                    value="unassigned"
                    onSelect={() => {
                      form.setValue("user", "unassigned");
                      if(setSelectedUser) setSelectedUser("unassigned");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value === "unassigned" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    -- No user assigned --
                  </CommandItem>
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.name}
                      value={user.name}
                      onSelect={() => {
                        form.setValue("user", user.name);
                        if(setSelectedUser) setSelectedUser(user.name);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === user.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const DesignationField: React.FC<FieldProps> = ({ form }) => (
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
);

export const EquipmentField: React.FC<FieldProps> = ({ form }) => (
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
);

export const ModelField: React.FC<FieldProps> = ({ form }) => (
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
);

export const SerialNumberField: React.FC<FieldProps> = ({ form }) => (
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
);

export const OeTagField: React.FC<FieldProps> = ({ form }) => (
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
);

export const PcNameField: React.FC<FieldProps> = ({ form }) => (
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
);

export const OsField: React.FC<FieldProps> = ({ form }) => (
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
);

export const RamField: React.FC<FieldProps> = ({ form }) => (
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
);

export const StorageField: React.FC<FieldProps> = ({ form }) => (
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
);

export const LocationField: React.FC<FieldProps> = ({ form }) => (
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
);

export const StatusField: React.FC<FieldProps> = ({ form }) => (
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
);

export const DateField: React.FC<FieldProps & { name: 'purchaseDate' | 'lastMaintenance' | 'nextMaintenance', label: string, description?: string }> = 
  ({ form, name, label, description }) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type="date" {...field} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

export const NotesField: React.FC<FieldProps & { label: string }> = ({ form, label }) => (
  <FormField
    control={form.control}
    name="notes"
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
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
);
