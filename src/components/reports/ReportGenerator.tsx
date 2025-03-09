
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export function ReportGenerator({ isOpen, onClose }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState('personnel');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [station, setStation] = useState('all');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stations, setStations] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  // Fetch stations from Supabase - in a real implementation this would get all stations
  useState(() => {
    const fetchStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('id, name');
        
        if (error) throw error;
        
        setStations(data || []);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  });

  const reportTypes = [
    { value: 'personnel', label: 'Personnel Report' },
    { value: 'assets', label: 'Asset Report' },
    { value: 'tickets', label: 'Tickets Report' },
    { value: 'inventory', label: 'Inventory Report' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would send the request to a server endpoint
    // that would generate the report and return a download URL
    
    toast({
      title: "Report Generated",
      description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report is ready for download.`,
    });
    
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Create reports based on various parameters and data points.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Station</Label>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>{station.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker date={dateRange} setDate={setDateRange} />
            </div>
            
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="grid grid-cols-2 gap-4">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={format === option.value ? "default" : "outline"}
                      className="justify-start gap-2"
                      onClick={() => setFormat(option.value)}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="pt-4">
            <div className="min-h-[300px] flex items-center justify-center text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Custom report builder is coming soon.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will allow you to build reports with custom fields and parameters.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
