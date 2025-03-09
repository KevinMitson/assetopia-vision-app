
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
} from 'lucide-react';
import { AssetType } from '@/components/dashboard/types';

// Department data structure
export const departmentSections = [
  'Managing Director',
  'DMD',
  'MD',
  'Internal Audit',
  'Communications and Branding',
  'Procurement',
  'TSU',
  'Finance',
  'IT',
  'HR',
  'Operations',
  'Marketing',
  'Legal',
  'Administration'
];

export const departments = [
  'DMD',
  'MD',
  'Internal Audit',
  'Communications and Branding',
  'Procurement',
  'TSU',
  'Finance',
  'IT',
  'HR',
  'Operations',
  'Marketing',
  'Legal',
  'Administration'
];

export const locations = [
  'Head Office', 'KKIA', 'SMKIA', 'HMNIA', 'MIA', 'Service Center', 'Stores'
];

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
