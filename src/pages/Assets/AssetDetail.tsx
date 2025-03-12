import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Building, 
  MapPin, 
  Tag, 
  HardDrive, 
  Cpu, 
  Database, 
  Monitor, 
  Calendar, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { AssetForm } from '@/components/assets/AssetForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { AssetMaintenanceTab } from '@/components/assets/AssetMaintenanceTab';
import { AssetAssignmentsTab } from '@/components/assets/AssetAssignmentsTab';

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const styles = {
    'Assigned': 'bg-green-100 text-green-800',
    'Available': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'In Storage': 'bg-gray-100 text-gray-800',
    'Unserviceable': 'bg-red-100 text-red-800',
    'Stolen': 'bg-purple-100 text-purple-800',
    'Serviceable': 'bg-green-100 text-green-800',
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

const AssetDetail = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!assetId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch asset details
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('*')
          .eq('id', assetId)
          .single();
        
        if (assetError) throw assetError;
        
        // Fetch assignment history
        const { data: historyData, error: historyError } = await supabase
          .from('assignment_history')
          .select('*')
          .eq('asset_id', assetId)
          .order('from_date', { ascending: false });
        
        if (historyError) throw historyError;
        
        setAsset(assetData);
        setAssignmentHistory(historyData || []);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        setError('Failed to load asset details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssetDetails();
  }, [assetId, isEditing]);

  const handleDelete = async () => {
    if (!assetId) return;
    
    try {
      setIsDeleting(true);
      
      // Delete assignment history first (foreign key constraint)
      const { error: historyError } = await supabase
        .from('assignment_history')
        .delete()
        .eq('asset_id', assetId);
      
      if (historyError) throw historyError;
      
      // Delete the asset
      const { error: assetError } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);
      
      if (assetError) throw assetError;
      
      toast.success('Asset deleted successfully');
      navigate('/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load asset details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout>
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Asset Details
            </Button>
            <h1 className="text-2xl font-bold">Edit Asset</h1>
          </div>
          
          <AssetForm />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-2/3">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{asset.equipment} - {asset.model}</CardTitle>
                  <CardDescription>Asset #{asset.asset_no} • Serial: {asset.serial_no}</CardDescription>
                </div>
                <Badge className={getStatusBadge(asset.status)}>
                  {asset.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="details" onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">Assignment History</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          User Information
                        </h3>
                        <p className="text-lg font-medium">{asset.user_name || 'Unassigned'}</p>
                        {asset.designation && (
                          <p className="text-sm text-muted-foreground">{asset.designation}</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Department
                        </h3>
                        <p className="text-lg font-medium">{asset.department}</p>
                        <p className="text-sm text-muted-foreground">{asset.department_section}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location
                        </h3>
                        <p className="text-lg font-medium">{asset.location}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Asset Details
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">OE Tag</p>
                            <p className="font-medium">{asset.oe_tag || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">PC Name</p>
                            <p className="font-medium">{asset.pc_name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          System Specifications
                        </h3>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">OS</p>
                            <p className="font-medium">{asset.os || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">RAM</p>
                            <p className="font-medium">{asset.ram || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Storage</p>
                            <p className="font-medium">{asset.storage || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Dates
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Purchase Date</p>
                            <p className="font-medium">{asset.purchase_date ? format(new Date(asset.purchase_date), 'dd MMM yyyy') : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Last Maintenance</p>
                            <p className="font-medium">{asset.last_maintenance ? format(new Date(asset.last_maintenance), 'dd MMM yyyy') : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  {assignmentHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No assignment history found for this asset.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignmentHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell>{history.user_name || '-'}</TableCell>
                              <TableCell>{history.department || '-'}</TableCell>
                              <TableCell>{format(new Date(history.from_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>{history.to_date ? format(new Date(history.to_date), 'dd MMM yyyy') : 'Current'}</TableCell>
                              <TableCell>{history.reason || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="maintenance">
                  <AssetMaintenanceTab assetId={assetId || ''} />
                </TabsContent>

                <TabsContent value="assignments">
                  <AssetAssignmentsTab assetId={assetId || ''} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-1/3">
            {activeTab === 'maintenance' || activeTab === 'assignments' ? (
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage this asset</CardDescription>
              </CardHeader>
            ) : (
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Next maintenance due</CardDescription>
              </CardHeader>
            )}
            <CardContent>
              {activeTab === 'maintenance' ? (
                <div className="space-y-4">
                  <Button className="w-full" onClick={() => document.getElementById('add-maintenance-button')?.click()}>
                    Add Maintenance Record
                  </Button>
                </div>
              ) : activeTab === 'assignments' ? (
                <div className="space-y-4">
                  <Button className="w-full" onClick={() => document.getElementById('assign-asset-button')?.click()}>
                    Assign Asset
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  {asset.next_maintenance ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {format(new Date(asset.next_maintenance), 'dd MMM yyyy')}
                      </div>
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(asset.next_maintenance) < new Date() ? (
                          <span className="text-red-500">Overdue</span>
                        ) : (
                          <span>
                            {Math.ceil((new Date(asset.next_maintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No maintenance scheduled</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              and all associated assignment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AssetDetail; 