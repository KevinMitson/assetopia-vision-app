
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

// Sample data from the image
const sampleAssets = [
  { 
    department: "DMD", 
    department_section: "Managing Director", 
    user_name: "Ngoza Matakala", 
    designation: "DMD", 
    equipment: "Laptop", 
    model: "HP ProBook 440G9", 
    serial_no: "5CD249G1FK", 
    asset_no: "AST001",
    pc_name: "ZACLHQDMD", 
    os: "Windows 11 Professional 64-bit", 
    ram: "16GB", 
    storage: "1TB", 
    purchase_date: "2023-10-20", 
    status: "Serviceable", 
    location: "Head Office", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "MD", 
    department_section: "Managing Director", 
    user_name: "Elita Njovu", 
    designation: "Personal Secretary Managing Director", 
    equipment: "Desktop", 
    model: "HP Elite SFF 600 G9", 
    serial_no: "4CE30BF8X", 
    asset_no: "AST002",
    oe_tag: "OE-03024", 
    pc_name: "ZACLHQMD-SEC", 
    os: "Windows 11 Professional 64-bit", 
    ram: "8GB", 
    storage: "512GB", 
    purchase_date: "2023-08-23", 
    status: "Serviceable", 
    location: "Head Office", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "Internal Audit", 
    department_section: "Managing Director", 
    user_name: "Walker Nsemani", 
    designation: "Manager Audit Services", 
    equipment: "Laptop", 
    model: "HP ProBook 440 G10", 
    serial_no: "5CD333L34N", 
    asset_no: "AST003",
    oe_tag: "OE-3182", 
    pc_name: "", 
    os: "Windows 11 Professional 64-bit", 
    ram: "8GB", 
    storage: "500GB", 
    purchase_date: null, 
    status: "Serviceable", 
    location: "Head Office", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "Communications and Branding", 
    department_section: "Managing Director", 
    user_name: "Mweembe Sikaulu", 
    designation: "Manager -Communications and Brand", 
    equipment: "Laptop", 
    model: "HP ProBook 440 G9", 
    serial_no: "5CD249G1FW", 
    asset_no: "AST004",
    pc_name: "ZACLHQMDCBM", 
    os: "Windows 11 Professional 64-bit", 
    ram: "16GB", 
    storage: "1TB", 
    purchase_date: "2023-11-08", 
    status: "Serviceable", 
    location: "KKIA", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "Procurement", 
    department_section: "Managing Director", 
    user_name: "Twaambo Haambote", 
    designation: "Procurement Officer", 
    equipment: "Desktop", 
    model: "HP ProDesk 600 G1 SFF", 
    serial_no: "TRF4500M8G", 
    asset_no: "AST005",
    pc_name: "ZACLHQPROCURE1", 
    os: "Windows 10 Profesional 64-bit", 
    ram: "4GB", 
    storage: "452 GB", 
    purchase_date: null, 
    status: "Serviceable", 
    location: "Head Office", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "Procurement", 
    department_section: "Managing Director", 
    user_name: "Emmanuel Zulu", 
    designation: "Procurement Officer", 
    equipment: "Laptop", 
    model: "HP ProBook 650 G5", 
    serial_no: "5CG02869HD", 
    asset_no: "AST006",
    pc_name: "ZACLHMMDPRO", 
    os: "Windows 10 Professional 64-bit", 
    ram: "4GB", 
    storage: "500GB", 
    purchase_date: null, 
    status: "Serviceable", 
    location: "MIA", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  },
  { 
    department: "TSU", 
    department_section: "Managing Director", 
    user_name: "Simon Mulenga", 
    designation: "Acting Manager - Civil Engineering", 
    equipment: "Laptop", 
    model: "HP ProBook 440 G9", 
    serial_no: "5CD3060M3B", 
    asset_no: "AST007",
    pc_name: "ZACLHMDMCE1", 
    os: "Windows 11 Professional 64-bit", 
    ram: "16GB", 
    storage: "1TB", 
    purchase_date: "2023-03-15", 
    status: "Serviceable", 
    location: "HMNIA", 
    last_maintenance: format(new Date(), 'yyyy-MM-dd'), 
    next_maintenance: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
  }
];

// Function to import sample data
export const importSampleData = async () => {
  try {
    // Insert assets
    for (const asset of sampleAssets) {
      // Insert the asset
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert(asset)
        .select('id')
        .single();
      
      if (assetError) {
        console.error('Error inserting asset:', assetError);
        continue;
      }
      
      // Create assignment history entry
      if (asset.user_name) {
        const { error: historyError } = await supabase
          .from('assignment_history')
          .insert({
            asset_id: assetData.id,
            user_name: asset.user_name,
            department: asset.department,
            from_date: asset.purchase_date || format(new Date(), 'yyyy-MM-dd'),
            to_date: null,
            reason: 'Initial assignment'
          });
        
        if (historyError) {
          console.error('Error inserting assignment history:', historyError);
        }
      }
    }
    
    console.log('Sample data imported successfully');
    return { success: true };
  } catch (error) {
    console.error('Error importing sample data:', error);
    return { success: false, error };
  }
};
