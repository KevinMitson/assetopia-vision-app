
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotesField } from './FormFields';
import { DepartmentInfoGroup, BasicAssetInfoGroup, MaintenanceGroup } from './FieldGroups';
import { useAssetForm } from './useAssetForm';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function AssetForm() {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const { 
    form, 
    isLoading, 
    isLoadingAsset,
    shouldShowField, 
    setSelectedUser, 
    onSubmit,
    currentAsset,
    assignmentHistory,
    isReassignment
  } = useAssetForm(assetId);

  // Helper function to determine if we're editing an existing asset
  const isEditing = Boolean(assetId);

  // Render loading state if fetching asset data
  if (isEditing && isLoadingAsset) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update asset details or reassign to a different user'
            : 'Enter details to register a new asset in the inventory'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Asset Details</TabsTrigger>
              <TabsTrigger value="history">Assignment History</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <AssetFormContent 
                form={form} 
                isLoading={isLoading} 
                shouldShowField={shouldShowField} 
                setSelectedUser={setSelectedUser} 
                onSubmit={onSubmit} 
                navigate={navigate}
                isReassignment={isReassignment}
                isEditing={isEditing}
              />
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assignment History</h3>
                {assignmentHistory.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentHistory.map((history, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{history.user || 'Unassigned'}</TableCell>
                            <TableCell>{history.department || '-'}</TableCell>
                            <TableCell>{history.from}</TableCell>
                            <TableCell>{history.to || 'Present'}</TableCell>
                            <TableCell>
                              {history.condition && (
                                <Badge className={
                                  history.condition === 'Good' ? 'bg-green-100 text-green-800' :
                                  history.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  history.condition === 'Poor' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {history.condition}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{history.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No assignment history found for this asset.</p>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate('/inventory')}>
                    Back to Inventory
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <AssetFormContent 
            form={form} 
            isLoading={isLoading} 
            shouldShowField={shouldShowField} 
            setSelectedUser={setSelectedUser} 
            onSubmit={onSubmit} 
            navigate={navigate}
            isReassignment={false}
            isEditing={false}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface AssetFormContentProps {
  form: any;
  isLoading: boolean;
  shouldShowField: (field: string) => boolean;
  setSelectedUser: (user: string | null) => void;
  onSubmit: (data: any) => void;
  navigate: (path: string) => void;
  isReassignment: boolean;
  isEditing: boolean;
}

function AssetFormContent({ 
  form, 
  isLoading, 
  shouldShowField, 
  setSelectedUser, 
  onSubmit, 
  navigate,
  isReassignment,
  isEditing
}: AssetFormContentProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Information */}
          <DepartmentInfoGroup 
            form={form} 
            shouldShowField={shouldShowField} 
            setSelectedUser={setSelectedUser} 
          />

          {/* Basic Asset Information */}
          <BasicAssetInfoGroup 
            form={form} 
            shouldShowField={shouldShowField} 
            setSelectedUser={setSelectedUser} 
          />

          {/* Maintenance fields */}
          <MaintenanceGroup 
            form={form} 
            shouldShowField={shouldShowField} 
            setSelectedUser={setSelectedUser} 
          />
          
          {/* Reassignment fields - only show when editing an existing asset with a current user */}
          {isReassignment && (
            <div className="space-y-4 border p-4 rounded-md md:col-span-2">
              <h3 className="font-medium">Reassignment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transferReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for reassignment" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a reason for this asset reassignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                          <SelectItem value="Needs repair">Needs repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current condition of the asset
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes textarea - full width */}
        <NotesField form={form} label={isEditing ? "Additional Notes" : "Notes"} />

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/inventory')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : isEditing ? "Update Asset" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
