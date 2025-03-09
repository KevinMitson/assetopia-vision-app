
import * as z from 'zod';
import { AssetType, AssetStatus } from '@/components/dashboard/types';

// Create schema for form validation
export const assetFormSchema = z.object({
  assetNo: z.string().optional(),
  equipment: z.string().min(1, { message: "Equipment type is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  serialNo: z.string().min(1, { message: "Serial number is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  departmentSection: z.string().min(1, { message: "Department section is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  purchaseDate: z.string().optional(),
  status: z.string().min(1, { message: "Status is required" }),
  user: z.string().optional(),
  designation: z.string().optional(),
  pcName: z.string().optional(),
  oeTag: z.string().optional(),
  os: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  notes: z.string().optional(),
  useCurrentUser: z.boolean().default(false),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export interface AssignmentHistory {
  user: string | null;
  department: string | null;
  from: string;
  to: string | null;
  reason: string;
}
