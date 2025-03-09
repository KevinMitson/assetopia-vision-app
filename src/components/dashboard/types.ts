
export type ActivityItemType = 'maintenance' | 'transfer' | 'create' | 'update' | 'delete' | 'issue';

export interface ActivityUser {
  name: string;
  initials: string;
}

export interface ActivityItem {
  id: string;
  user: ActivityUser;
  action: string;
  target: string;
  timestamp: string;
  station: string;
  type: ActivityItemType;
}

export interface AssetCategory {
  name: string;
  value: number;
  color: string;
}

export interface Station {
  id: string;
  name: string;
  assetsCount: number;
  utilization: number;
  status: 'operational' | 'maintenance' | 'issue';
  location: string;
}

export interface StationStats {
  totalAssets: string;
  maintenance: string;
  transfers: string;
  personnel: string;
  operational: number;
  underMaintenance: number;
  issuesReported: number;
}

export interface ChartDataPoint {
  date: string;
  acquisitions: number;
  disposals: number;
  transfers: number;
}

export type AssetType = 'Laptop' | 'Desktop' | 'Printer' | 'Switch' | 'Server' | 'License' | 'Phone' | 'iPad' | 'Other';

export type AssetStatus = 'Assigned' | 'Available' | 'Under Maintenance' | 'In Storage' | 'Unserviceable' | 'Stolen';

export interface Asset {
  id: number;
  department: string;
  user: string | null;
  designation: string | null;
  equipment: AssetType;
  model: string;
  serialNo: string;
  assetNo: string;
  pcName?: string;
  os?: string;
  ram?: string;
  storage?: string;
  purchaseDate: string;
  status: AssetStatus;
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string | null;
  assignmentHistory?: AssignmentHistory[];
  licenseKey?: string;
  expiryDate?: string;
  warranty?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
}

export interface AssignmentHistory {
  user: string | null;
  department: string | null;
  from: string;
  to: string | null;
  reason: string;
}
