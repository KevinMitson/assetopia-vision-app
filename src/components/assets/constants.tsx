
import {
  Laptop,
  Monitor,
  Printer,
  Server,
  Smartphone,
  Tablet,
  Network,
  Key,
  Package,
  Building,
  MapPin,
} from 'lucide-react';
import { AssetType } from '@/components/dashboard/types';

// Department data structure - now with a more structured format
export interface Department {
  id: string;
  name: string;
  section: string;
}

// Sample departments data
export const departmentsData: Department[] = [
  { id: 'md-1', name: 'MD', section: 'Managing Director' },
  { id: 'dmd-1', name: 'DMD', section: 'Managing Director' },
  { id: 'ia-1', name: 'Internal Audit', section: 'Managing Director' },
  { id: 'comms-1', name: 'Communications and Branding', section: 'Managing Director' },
  { id: 'proc-1', name: 'Procurement', section: 'Managing Director' },
  { id: 'tsu-1', name: 'TSU', section: 'Managing Director' },
  { id: 'finance-1', name: 'Finance', section: 'Finance' },
  { id: 'it-1', name: 'IT', section: 'IT' },
  { id: 'hr-1', name: 'HR', section: 'HR' },
  { id: 'ops-1', name: 'Operations', section: 'Operations' },
  { id: 'marketing-1', name: 'Marketing', section: 'Marketing' },
  { id: 'legal-1', name: 'Legal', section: 'Legal' },
  { id: 'admin-1', name: 'Administration', section: 'Administration' },
];

// Backward compatibility for existing code
export const departmentSections = Array.from(
  new Set(departmentsData.map(dept => dept.section))
).sort();

export const departments = Array.from(
  new Set(departmentsData.map(dept => dept.name))
).sort();

// Station data structure
export interface Station {
  id: string;
  name: string;
  code: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
}

// Sample stations data
export const stationsData: Station[] = [
  { id: 'hq-1', name: 'Head Office', code: 'HQ', location: 'Lusaka', status: 'Active' },
  { id: 'kkia-1', name: 'KKIA', code: 'KKIA', location: 'Lusaka', status: 'Active' },
  { id: 'smkia-1', name: 'SMKIA', code: 'SMKIA', location: 'Livingstone', status: 'Active' },
  { id: 'hmnia-1', name: 'HMNIA', code: 'HMNIA', location: 'Ndola', status: 'Active' },
  { id: 'mia-1', name: 'MIA', code: 'MIA', location: 'Mfuwe', status: 'Active' },
  { id: 'sc-1', name: 'Service Center', code: 'SC', location: 'Lusaka', status: 'Active' },
  { id: 'stores-1', name: 'Stores', code: 'STR', location: 'Lusaka', status: 'Active' },
];

// Backward compatibility for existing code
export const locations = stationsData.map(station => station.name);

export const statuses = [
  'Serviceable', 'Unserviceable', 'Assigned', 'Available', 'Under Maintenance', 'In Storage', 'Stolen'
];

// Define what fields should be shown for each asset type
export const assetTypeFields: Record<AssetType, string[]> = {
  'Laptop': ['pcName', 'oeTag', 'os', 'ram', 'storage', 'user', 'designation'],
  'Desktop': ['pcName', 'oeTag', 'os', 'ram', 'storage', 'user', 'designation'],
  'Printer': [],
  'Switch': [],
  'Server': ['pcName', 'os', 'ram', 'storage'],
  'License': [],
  'Phone': ['os', 'storage', 'user', 'designation'],
  'iPad': ['os', 'storage', 'user', 'designation'],
  'Other': [],
};

// Icons for each asset type
export const assetTypeIcons: Record<AssetType, React.ReactNode> = {
  'Laptop': <Laptop className="mr-2" size={16} />,
  'Desktop': <Monitor className="mr-2" size={16} />,
  'Printer': <Printer className="mr-2" size={16} />,
  'Switch': <Network className="mr-2" size={16} />,
  'Server': <Server className="mr-2" size={16} />,
  'License': <Key className="mr-2" size={16} />,
  'Phone': <Smartphone className="mr-2" size={16} />,
  'iPad': <Tablet className="mr-2" size={16} />,
  'Other': <Package className="mr-2" size={16} />,
};

// Icons for management pages
export const managementIcons = {
  departments: <Building className="mr-2" size={16} />,
  stations: <MapPin className="mr-2" size={16} />,
};

// Sample users
export const sampleUsers = [
  { name: 'Ngoza Matakala', designation: 'DMD', department: 'DMD', departmentSection: 'Managing Director' },
  { name: 'Elita Njovu', designation: 'Personal Secretary Managing Director', department: 'MD', departmentSection: 'Managing Director' },
  { name: 'Walker Nsemani', designation: 'Manager Audit Services', department: 'Internal Audit', departmentSection: 'Managing Director' },
  { name: 'Mweembe Sikaulu', designation: 'Manager -Communications and Brand', department: 'Communications and Branding', departmentSection: 'Managing Director' },
  { name: 'Twaambo Haambote', designation: 'Procurement Officer', department: 'Procurement', departmentSection: 'Managing Director' },
  { name: 'Emmanuel Zulu', designation: 'Procurement Officer', department: 'Procurement', departmentSection: 'Managing Director' },
  { name: 'Simon Mulenga', designation: 'Acting Manager - Civil Engineering', department: 'TSU', departmentSection: 'Managing Director' },
];
