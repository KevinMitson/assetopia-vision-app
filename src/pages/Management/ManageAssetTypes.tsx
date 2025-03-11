
import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X, Check, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { assetTypeIcons, assetTypeFields, AssetType } from '@/components/dashboard/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define a richer asset type representation for management
interface AssetTypeWithFields {
  id: string;
  name: string;
  icon: string;
  fields: string[];
}

// Convert from the existing types to our management format
const convertToAssetTypeWithFields = (): AssetTypeWithFields[] => {
  return Object.keys(assetTypeFields).map(typeKey => ({
    id: typeKey,
    name: typeKey,
    icon: 'default', // We would need actual icon mapping
    fields: assetTypeFields[typeKey as AssetType]
  }));
};

const iconOptions = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'printer', label: 'Printer' },
  { value: 'server', label: 'Server' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'network', label: 'Network' },
  { value: 'key', label: 'Key' },
  { value: 'package', label: 'Package' }
];

const commonFields = [
  { id: 'pcName', label: 'PC Name' },
  { id: 'oeTag', label: 'OE Tag' },
  { id: 'os', label: 'Operating System' },
  { id: 'ram', label: 'RAM' },
  { id: 'storage', label: 'Storage' },
  { id: 'user', label: 'User' },
  { id: 'designation', label: 'Designation' },
  { id: 'serialNo', label: 'Serial Number' },
  { id: 'model', label: 'Model' }
];

const ManageAssetTypes = () => {
  const { toast } = useToast();
  const [assetTypes, setAssetTypes] = useState<AssetTypeWithFields[]>(convertToAssetTypeWithFields());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [activeAssetType, setActiveAssetType] = useState<string | null>(null);
  
  const [newAssetType, setNewAssetType] = useState<Omit<AssetTypeWithFields, 'id'>>({
    name: '',
    icon: 'package',
    fields: []
  });
  
  const [editingValues, setEditingValues] = useState<AssetTypeWithFields>({
    id: '',
    name: '',
    icon: '',
    fields: []
  });
  
  const handleEdit = (assetType: AssetTypeWithFields) => {
    setEditingId(assetType.id);
    setEditingValues(assetType);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = () => {
    setAssetTypes(prev => 
      prev.map(type => 
        type.id === editingId ? editingValues : type
      )
    );
    setEditingId(null);
    toast({
      title: "Asset type updated",
      description: "Asset type has been successfully updated.",
    });
  };
  
  const handleDelete = (id: string) => {
    setAssetTypes(prev => prev.filter(type => type.id !== id));
    toast({
      title: "Asset type deleted",
      description: "Asset type has been successfully removed.",
    });
  };
  
  const handleAdd = () => {
    const newId = newAssetType.name.toLowerCase().replace(/\s+/g, '-');
    setAssetTypes(prev => [...prev, { id: newId, ...newAssetType }]);
    setNewAssetType({ name: '', icon: 'package', fields: [] });
    setDialogOpen(false);
    toast({
      title: "Asset type added",
      description: "New asset type has been successfully added.",
    });
  };
  
  const handleManageFields = (assetTypeId: string) => {
    setActiveAssetType(assetTypeId);
    setFieldDialogOpen(true);
  };
  
  const handleToggleField = (fieldId: string) => {
    if (!activeAssetType) return;
    
    setAssetTypes(prev => 
      prev.map(type => {
        if (type.id === activeAssetType) {
          const fields = [...type.fields];
          if (fields.includes(fieldId)) {
            return { ...type, fields: fields.filter(f => f !== fieldId) };
          } else {
            return { ...type, fields: [...fields, fieldId] };
          }
        }
        return type;
      })
    );
  };
  
  return (
    <ManagementLayout 
      title="Manage Asset Types" 
      description="Add, edit, and delete asset types and their fields"
      onAddNew={() => setDialogOpen(true)}
      addNewLabel="Add Asset Type"
    >
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Type</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetTypes.map((assetType) => (
                <TableRow key={assetType.id}>
                  <TableCell>
                    {editingId === assetType.id ? (
                      <Input 
                        value={editingValues.name} 
                        onChange={(e) => setEditingValues({...editingValues, name: e.target.value})}
                      />
                    ) : (
                      assetType.name
                    )}
                  </TableCell>
                  <TableCell>
                    {assetType.fields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assetType.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="outline" className="mr-1">
                            {field}
                          </Badge>
                        ))}
                        {assetType.fields.length > 3 && (
                          <Badge variant="outline">+{assetType.fields.length - 3} more</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No fields configured</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === assetType.id ? (
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
                          <Button variant="outline" size="sm" onClick={() => handleEdit(assetType)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleManageFields(assetType.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(assetType.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {assetTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No asset types found. Add a new asset type to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Asset Type Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset Type</DialogTitle>
            <DialogDescription>
              Enter the details for the new asset type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Asset Type Name</label>
              <Input
                id="name"
                value={newAssetType.name}
                onChange={(e) => setNewAssetType({...newAssetType, name: e.target.value})}
                placeholder="Enter asset type name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="icon" className="text-sm font-medium">Icon</label>
              <Select 
                value={newAssetType.icon}
                onValueChange={(value) => setNewAssetType({...newAssetType, icon: value})}
              >
                <SelectTrigger id="icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newAssetType.name}
            >
              Add Asset Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Fields Dialog */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Fields</DialogTitle>
            <DialogDescription>
              Select which fields should be associated with this asset type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {activeAssetType && (
              <div className="grid grid-cols-1 gap-3">
                {commonFields.map(field => {
                  const isSelected = assetTypes.find(t => t.id === activeAssetType)?.fields.includes(field.id);
                  
                  return (
                    <div key={field.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`field-${field.id}`}
                        checked={isSelected}
                        onChange={() => handleToggleField(field.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`field-${field.id}`} className="text-sm">
                        {field.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setFieldDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
};

export default ManageAssetTypes;
