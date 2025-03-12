import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { assetFormSchema, AssetFormValues, AssignmentHistory } from './types';
import { useAuth } from '@/context/AuthContext';
import { sampleUsers, assetTypeFields } from './constants';

export const useAssetForm = (assetId?: string) => {
  const { user, session } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAsset, setIsLoadingAsset] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentAsset, setCurrentAsset] = useState<any>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [isReassignment, setIsReassignment] = useState(false);
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
      transferReason: '',
      condition: 'Good',
    },
  });

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

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!assetId) return;
      
      setIsLoadingAsset(true);
      try {
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('*')
          .eq('id', assetId)
          .single();
          
        if (assetError) throw assetError;
        
        setCurrentAsset(assetData);
        
        const { data: historyData, error: historyError } = await supabase
          .from('assignment_history')
          .select('*')
          .eq('asset_id', assetId)
          .order('from_date', { ascending: false });
          
        if (historyError) throw historyError;
        
        const formattedHistory = historyData.map((record: any) => ({
          user: record.user_name,
          department: record.department,
          from: record.from_date,
          to: record.to_date,
          reason: record.reason,
          condition: record.condition || 'Unknown'
        }));
        
        setAssignmentHistory(formattedHistory);
        
        form.reset({
          assetNo: assetData.asset_no || '',
          equipment: assetData.equipment || '',
          model: assetData.model || '',
          serialNo: assetData.serial_no || '',
          department: assetData.department || '',
          departmentSection: assetData.department_section || 'Managing Director',
          location: assetData.location || 'Head Office',
          purchaseDate: assetData.purchase_date || format(new Date(), 'yyyy-MM-dd'),
          status: assetData.status || 'Serviceable',
          user: assetData.user_name || '',
          designation: assetData.designation || '',
          pcName: assetData.pc_name || '',
          oeTag: assetData.oe_tag || '',
          os: assetData.os || '',
          ram: assetData.ram || '',
          storage: assetData.storage || '',
          lastMaintenance: assetData.last_maintenance || '',
          nextMaintenance: assetData.next_maintenance || '',
          notes: '',
          useCurrentUser: false,
          transferReason: '',
          condition: 'Good',
        });
        
        if (assetData.user_name) {
          setIsReassignment(true);
        }
      } catch (error) {
        console.error('Error fetching asset data:', error);
        toast.error("Failed to load asset data", {
          description: "Could not retrieve the asset details. Please try again."
        });
      } finally {
        setIsLoadingAsset(false);
      }
    };
    
    fetchAssetData();
  }, [assetId, form]);

  const assetType = form.watch('equipment');
  const useCurrentUser = form.watch('useCurrentUser');
  
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

  useEffect(() => {
    if (selectedUser && selectedUser.trim() !== '') {
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
      if (!session) {
        toast.error("Authentication error", {
          description: "You must be logged in to perform this action",
        });
        navigate('/auth/login');
        return;
      }
      
      const assetNo = data.assetNo || (assetId ? currentAsset.asset_no : `AST${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
      
      const userName = !data.user || data.user.trim() === "" ? null : data.user.trim();
      
      let updatedHistory = false;
      
      if (assetId) {
        if (currentAsset.user_name !== userName) {
          if (currentAsset.user_name) {
            const { error: updateError } = await supabase
              .from('assignment_history')
              .update({ 
                to_date: format(new Date(), 'yyyy-MM-dd') 
              })
              .eq('asset_id', assetId)
              .is('to_date', null);
            
            if (updateError) throw updateError;
          }
          
          if (userName) {
            const { error: historyError } = await supabase
              .from('assignment_history')
              .insert({
                asset_id: assetId,
                user_name: userName,
                department: data.department,
                from_date: format(new Date(), 'yyyy-MM-dd'),
                to_date: null,
                reason: data.transferReason || `Reassigned from ${currentAsset.user_name || 'unassigned'}`,
                condition: data.condition || 'Good'
              });
            
            if (historyError) throw historyError;
          }
          
          updatedHistory = true;
        }
        
        const { error: assetError } = await supabase
          .from('assets')
          .update({
            department: data.department,
            department_section: data.departmentSection,
            user_name: userName,
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
            next_maintenance: data.nextMaintenance || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', assetId);
        
        if (assetError) throw assetError;
        
        toast.success("Asset updated successfully", {
          description: updatedHistory ? 
            `Asset ${data.serialNo} has been reassigned to ${userName || 'inventory'}` : 
            `Asset ${data.serialNo} has been updated`,
        });
      } else {
        const assignmentHistory: AssignmentHistory[] = [];
        
        if (data.status === 'Assigned' && userName) {
          assignmentHistory.push({
            user: userName,
            department: data.department,
            from: format(new Date(), 'yyyy-MM-dd'),
            to: null,
            reason: data.notes ? `Initial assignment: ${data.notes}` : 'Initial assignment',
            condition: data.condition || 'Good'
          });
        }
        
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .insert({
            department: data.department,
            department_section: data.departmentSection,
            user_name: userName,
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
              reason: history.reason,
              condition: history.condition
            });
          
          if (historyError) throw historyError;
        }
        
        toast.success("Asset created successfully", {
          description: `Asset ${data.serialNo} has been added to inventory.`,
        });
      }
      
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving asset:', error);
      
      if (error.status === 401) {
        toast.error("Authentication error", {
          description: "Your session has expired. Please log in again.",
        });
        navigate('/auth/login');
      } else {
        toast.error("Failed to save asset", {
          description: error.message || "An unexpected error occurred",
        });
      }
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
    isLoadingAsset,
    selectedUser,
    setSelectedUser,
    shouldShowField,
    onSubmit,
    currentAsset,
    assignmentHistory,
    isReassignment
  };
};
