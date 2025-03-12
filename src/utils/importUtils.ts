import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Function to read Excel file and convert to JSON
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

// Map Excel column names to database field names
export const mapExcelToDbFields = (excelData: any[]): any[] => {
  return excelData.map(row => {
    // Create a new object with the correct field names
    return {
      department: row['Department/Section'] || row['Department'] || '',
      department_section: row['Department/Section'] || '',
      user_name: row['User'] || '',
      designation: row['Designation'] || '',
      equipment: row['Equipment'] || '',
      model: row['Model'] || '',
      serial_no: row['Serial No.'] || row['Serial No'] || row['SerialNo'] || '',
      asset_no: generateAssetNo(),
      pc_name: row['PC Name'] || '',
      os: row['OS'] || '',
      ram: row['RAM'] || '',
      storage: row['Storage'] || '',
      purchase_date: row['Date of Purchase'] ? formatDate(row['Date of Purchase']) : null,
      status: row['Status'] || 'Serviceable',
      location: row['Location'] || 'Head Office',
      last_maintenance: format(new Date(), 'yyyy-MM-dd'),
      next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
    };
  });
};

// Helper function to format date from Excel
const formatDate = (dateValue: any): string | null => {
  if (!dateValue) return null;
  
  try {
    // Handle Excel date number format
    if (typeof dateValue === 'number') {
      // Excel dates are number of days since 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
      return format(date, 'yyyy-MM-dd');
    }
    
    // Handle string date format
    if (typeof dateValue === 'string') {
      // Try to parse the date string
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
      
      // Handle DD/MM/YYYY format
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return format(date, 'yyyy-MM-dd');
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Generate a unique asset number
const generateAssetNo = (): string => {
  const prefix = 'AST';
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomNum}`;
};

// Import data into Supabase
export const importAssetsToDb = async (mappedData: any[]): Promise<{ success: boolean, imported: number, errors: number, errorDetails: any[] }> => {
  let imported = 0;
  let errors = 0;
  const errorDetails: any[] = [];
  
  try {
    // Process each asset
    for (const asset of mappedData) {
      // Check if asset with same serial number already exists
      const { data: existingAsset } = await supabase
        .from('assets')
        .select('id')
        .eq('serial_no', asset.serial_no)
        .maybeSingle();
      
      let result;
      
      if (existingAsset) {
        // Update existing asset
        result = await supabase
          .from('assets')
          .update(asset)
          .eq('id', existingAsset.id);
      } else {
        // Insert new asset
        result = await supabase
          .from('assets')
          .insert(asset)
          .select('id')
          .single();
      }
      
      if (result.error) {
        errors++;
        errorDetails.push({
          asset: asset.serial_no,
          error: result.error.message
        });
        continue;
      }
      
      // Create assignment history entry if user is assigned
      if (asset.user_name && !existingAsset) {
        const { error: historyError } = await supabase
          .from('assignment_history')
          .insert({
            asset_id: result.data?.id,
            user_name: asset.user_name,
            department: asset.department,
            from_date: asset.purchase_date || format(new Date(), 'yyyy-MM-dd'),
            to_date: null,
            reason: 'Initial assignment from Excel import'
          });
        
        if (historyError) {
          console.error('Error inserting assignment history:', historyError);
        }
      }
      
      imported++;
    }
    
    return { 
      success: imported > 0, 
      imported, 
      errors, 
      errorDetails 
    };
  } catch (error) {
    console.error('Error importing data:', error);
    return { 
      success: false, 
      imported, 
      errors: errors + 1, 
      errorDetails: [...errorDetails, { error: 'Unexpected error during import' }] 
    };
  }
}; 