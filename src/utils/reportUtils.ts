
import * as XLSX from 'xlsx';

// Function to export data to Excel
export const exportToExcel = (data: any[], filename: string) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Function to generate asset report data
export const generateAssetReport = (
  station: string,
  assetDistribution: any[],
  stats: any,
  stationData: any[]
) => {
  // Basic report data structure
  const reportData = {
    reportName: `Asset Report - ${station.toUpperCase() === 'ALL' ? 'All Stations' : station.toUpperCase()}`,
    generatedAt: new Date().toLocaleString(),
    summary: {
      totalAssets: stats.totalAssets,
      operational: stats.operational,
      underMaintenance: stats.underMaintenance,
      issuesReported: stats.issuesReported
    },
    assetCategories: assetDistribution.map(item => ({
      category: item.name,
      count: item.value,
      percentage: ((item.value / assetDistribution.reduce((sum, current) => sum + current.value, 0)) * 100).toFixed(2) + '%'
    })),
    stationData: stationData.map(station => ({
      name: station.name,
      assets: station.assetsCount,
      utilization: station.utilization + '%',
      status: station.status,
      location: station.location
    }))
  };

  // Format data for Excel export
  const excelData = [
    // Header row with report info
    { 
      Category: 'Report Information', 
      Value: '', 
      Details: '' 
    },
    { 
      Category: 'Report Name', 
      Value: reportData.reportName, 
      Details: '' 
    },
    { 
      Category: 'Generated At', 
      Value: reportData.generatedAt, 
      Details: '' 
    },
    { 
      Category: '', 
      Value: '', 
      Details: '' 
    }, // empty row
    
    // Summary section
    { 
      Category: 'Summary', 
      Value: '', 
      Details: '' 
    },
    { 
      Category: 'Total Assets', 
      Value: reportData.summary.totalAssets, 
      Details: '' 
    },
    { 
      Category: 'Operational', 
      Value: reportData.summary.operational, 
      Details: '' 
    },
    { 
      Category: 'Under Maintenance', 
      Value: reportData.summary.underMaintenance, 
      Details: '' 
    },
    { 
      Category: 'Issues Reported', 
      Value: reportData.summary.issuesReported, 
      Details: '' 
    },
    { 
      Category: '', 
      Value: '', 
      Details: '' 
    }, // empty row
    
    // Asset Categories section
    { 
      Category: 'Asset Categories', 
      Value: 'Count', 
      Details: 'Percentage' 
    },
    ...reportData.assetCategories.map(cat => ({ 
      Category: cat.category, 
      Value: cat.count, 
      Details: cat.percentage 
    })),
    { 
      Category: '', 
      Value: '', 
      Details: '' 
    }, // empty row
    
    // Stations section
    { 
      Category: 'Station', 
      Value: 'Assets', 
      Details: 'Utilization' 
    },
    ...reportData.stationData.map(station => ({ 
      Category: station.name, 
      Value: station.assets, 
      Details: station.utilization 
    }))
  ];

  return excelData;
};
