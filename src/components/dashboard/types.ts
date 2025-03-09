
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
