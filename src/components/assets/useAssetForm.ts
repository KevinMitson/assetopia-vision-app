
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { assetFormSchema, AssetFormValues, AssignmentHistory } from './types';
import { useAuth } from '@/context/AuthContext';
import { sampleUsers } from './constants';

export const useAssetForm = () => {
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
  const assetType = form.watch('equipment');
  const useCurrentUser = form.watch('useCurrentUser');
  
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

  const onSubmit = async (data: AssetFormValues) => {
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
  };

  const shouldShowField = (fieldName: string) => {
    if (!assetType) return false;
    const fields = assetType && assetType in (assetTypeFields || {}) 
      ? assetTypeFields[assetType as keyof typeof assetTypeFields] || []
      : [];
    return fields.includes(fieldName);
  };

  return {
    form,
    isLoading,
    selectedUser,
    setSelectedUser,
    shouldShowField,
    onSubmit,
  };
};
