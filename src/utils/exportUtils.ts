import * as XLSX from 'xlsx';

// Function to export data to CSV
export const exportToCSV = (data: any[], filename: string) => {
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
  
  // Generate CSV file
  XLSX.writeFile(workbook, `${filename}.csv`);
};

// Function to prepare asset data for export
export const prepareAssetsForExport = (assets: any[]) => {
  return assets.map(asset => ({
    'Asset No': asset.asset_no || '',
    'Equipment': asset.equipment || '',
    'Model': asset.model || '',
    'Serial No': asset.serial_no || '',
    'Department': asset.department || '',
    'User': asset.user_name || '',
    'Designation': asset.designation || '',
    'Location': asset.location || '',
    'Status': asset.status || '',
    'Purchase Date': asset.purchase_date || '',
    'Last Maintenance': asset.last_maintenance || '',
    'Next Maintenance': asset.next_maintenance || '',
    'OS': asset.os || '',
    'RAM': asset.ram || '',
    'Storage': asset.storage || '',
    'PC Name': asset.pc_name || '',
  }));
}; 