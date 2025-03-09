
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Download, X } from "lucide-react";
import { Station, AssetCategory, StationStats, ChartDataPoint } from './types';
import { exportToExcel, generateAssetReport } from '@/utils/reportUtils';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: string;
  stations: Station[];
  assetDistribution: AssetCategory[];
  stats: StationStats;
  trendsData: {
    daily: ChartDataPoint[];
    weekly: ChartDataPoint[];
    monthly: ChartDataPoint[];
  };
}

export function ReportDialog({
  isOpen,
  onClose,
  selectedStation,
  stations,
  assetDistribution,
  stats,
  trendsData
}: ReportDialogProps) {
  const [reportFormat, setReportFormat] = useState<'summary' | 'detailed'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Generate report data
      const reportData = generateAssetReport(
        selectedStation,
        assetDistribution,
        stats,
        stations
      );
      
      // Export to Excel
      const stationName = selectedStation === 'all' ? 'All_Stations' : selectedStation.toUpperCase();
      const reportType = reportFormat === 'summary' ? 'Summary' : 'Detailed';
      const filename = `Asset_Report_${stationName}_${reportType}_${new Date().toISOString().split('T')[0]}`;
      
      exportToExcel(reportData, filename);
      
      // Show success toast
      toast({
        title: "Report Generated",
        description: "Your report has been generated and downloaded successfully.",
        duration: 3000,
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Show error toast
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Create a report for {selectedStation === 'all' ? 'all stations' : selectedStation.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Report Type</h4>
            <Tabs defaultValue="summary" value={reportFormat} onValueChange={(value) => setReportFormat(value as 'summary' | 'detailed')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-2">
                <div className="text-sm text-muted-foreground">
                  <p>A condensed overview of assets including:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Total asset counts by category</li>
                    <li>Operational status overview</li>
                    <li>Station distribution summary</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="detailed" className="mt-2">
                <div className="text-sm text-muted-foreground">
                  <p>A comprehensive report including:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Asset counts with detailed breakdowns</li>
                    <li>Maintenance and issue statistics</li>
                    <li>Full station utilization data</li>
                    <li>Trend analysis over time</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Report Details</h4>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm">
                <span>Station:</span>
                <span className="font-medium">{selectedStation === 'all' ? 'All Stations' : selectedStation.toUpperCase()}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Asset Categories:</span>
                <span className="font-medium">{assetDistribution.length}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Total Assets:</span>
                <span className="font-medium">{stats.totalAssets}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Format:</span>
                <span className="font-medium">Microsoft Excel (.xlsx)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
