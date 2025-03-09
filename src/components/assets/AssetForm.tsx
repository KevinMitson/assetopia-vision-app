
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotesField } from './FormFields';
import { DepartmentInfoGroup, BasicAssetInfoGroup, MaintenanceGroup } from './FieldGroups';
import { useAssetForm } from './useAssetForm';

export function AssetForm() {
  const navigate = useNavigate();
  const { form, isLoading, shouldShowField, setSelectedUser, onSubmit } = useAssetForm();

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
            </div>

            {/* Notes textarea - full width */}
            <NotesField form={form} />

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
