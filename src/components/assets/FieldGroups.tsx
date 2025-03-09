
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AssetFormValues } from './types';
import {
  DepartmentSectionField,
  DepartmentField,
  UserField,
  DesignationField,
  EquipmentField,
  ModelField,
  SerialNumberField,
  OeTagField,
  PcNameField,
  OsField,
  RamField,
  StorageField,
  LocationField,
  StatusField,
  DateField,
  NotesField
} from './FormFields';

interface FieldGroupProps {
  form: UseFormReturn<AssetFormValues>;
  shouldShowField: (fieldName: string) => boolean;
  setSelectedUser: (value: string) => void;
}

export const DepartmentInfoGroup: React.FC<FieldGroupProps> = ({ form, setSelectedUser }) => (
  <>
    <DepartmentSectionField form={form} />
    <DepartmentField form={form} />
    <UserField form={form} setSelectedUser={setSelectedUser} />
    <DesignationField form={form} />
  </>
);

export const BasicAssetInfoGroup: React.FC<FieldGroupProps> = ({ form, shouldShowField }) => (
  <>
    <EquipmentField form={form} />
    <ModelField form={form} />
    <SerialNumberField form={form} />
    
    {shouldShowField('oeTag') && <OeTagField form={form} />}
    {shouldShowField('pcName') && <PcNameField form={form} />}
    {shouldShowField('os') && <OsField form={form} />}
    {shouldShowField('ram') && <RamField form={form} />}
    {shouldShowField('storage') && <StorageField form={form} />}
    
    <LocationField form={form} />
    <StatusField form={form} />
    
    <DateField 
      form={form} 
      name="purchaseDate" 
      label="Purchase Date" 
      description="Leave empty if unknown" 
    />
  </>
);

export const MaintenanceGroup: React.FC<FieldGroupProps> = ({ form }) => (
  <>
    <DateField 
      form={form} 
      name="lastMaintenance" 
      label="Last Maintenance Date" 
    />
    <DateField 
      form={form} 
      name="nextMaintenance" 
      label="Next Maintenance Date" 
    />
  </>
);
