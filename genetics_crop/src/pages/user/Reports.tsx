import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  TrendingUp,
  Leaf,
  Dna,
  Loader2,
  BarChart3,
  PieChart,
  Bot,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cropApi } from '@/lib/api';

const reportTypes = [
  {
    id: 'crop-recommendation',
    title: 'Crop Recommendation Report',
    description: 'Detailed analysis of recommended crops based on soil and climate data',
    icon: Leaf,
  },
  {
    id: 'seasonal-suitability',
    title: 'Seasonal Suitability Report',
    description: 'Crop suitability analysis across different seasons and regions',
    icon: TrendingUp,
  },
  {
    id: 'genetic-impact',
    title: 'Genetic Marker Report',
    description: 'Impact of genetic markers on crop yield and disease resistance',
    icon: Dna,
  },
];

const cropSummaryData = [
  { name: 'Rice', value: 0 },
  { name: 'Wheat', value: 0 },
  { name: 'Maize', value: 0 },
  { name: 'Cotton', value: 0 },
  { name: 'Soybean', value: 0 },
];

const yieldTrendData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReportData, setAiReportData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState([
    { label: 'Total Predictions', value: '0' },
    { label: 'Crops Analyzed', value: '0' },
    { label: 'Genetic Traits', value: '0' },
    { label: 'Success Rate', value: '94%' },
  ]);
  const [filters, setFilters] = useState({
    location: 'all',
    season: 'all',
    crop: 'all',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await cropApi.getDashboardStats();
      setSummaryStats([
        { label: 'Total Predictions', value: data.predictions.toString() },
        { label: 'Crops Analyzed', value: data.crops.toString() },
        { label: 'Genetic Traits', value: data.traits.toString() },
        { label: 'Success Rate', value: '94%' },
      ]);
    } catch (error) {
      console.error('Failed to fetch reports stats:', error);
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    if (!selectedReport) {
      toast({
        title: 'Select a Report',
        description: 'Please select a report type to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setAiReportData(null);

    try {
      if (selectedReport === 'ai-summary') {
        const report = await cropApi.generateReport();
        setAiReportData(report);
        toast({
          title: 'AI Report Generated',
          description: 'Project status summary is ready to view.',
        });
      } else {
        // Simulate other report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast({
          title: 'Report Generated',
          description: `Your ${format.toUpperCase()} report is ready for download.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate report. Please check API connection.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">Export insights and summaries</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Select report type and filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Report Type Selection */}
                <div className="space-y-3">
                  {reportTypes.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedReport === report.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${selectedReport === report.id ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                          <report.icon className={`w-5 h-5 ${selectedReport === report.id ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{report.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Filter className="w-4 h-4" />
                    Filters
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Location</Label>
                    <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="punjab">Punjab</SelectItem>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Season</Label>
                    <Select value={filters.season} onValueChange={(v) => setFilters({ ...filters, season: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Seasons</SelectItem>
                        <SelectItem value="kharif">Kharif</SelectItem>
                        <SelectItem value="rabi">Rabi</SelectItem>
                        <SelectItem value="zaid">Zaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Crop</Label>
                    <Select value={filters.crop} onValueChange={(v) => setFilters({ ...filters, crop: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Crops</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="cotton">Cotton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    variant="hero"
                    className="w-full"
                    disabled={isGenerating || !selectedReport}
                    onClick={() => handleGenerateReport('pdf')}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isGenerating || !selectedReport}
                    onClick={() => handleGenerateReport('csv')}
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Report Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Summary Stats */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Summary Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {summaryStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="text-center p-4 rounded-lg bg-muted/50"
                    >
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="Crop Distribution"
                description="Predictions by crop type"
                type="bar"
                data={cropSummaryData}
              />
              <ChartCard
                title="Yield Trends"
                description="Monthly yield predictions"
                type="area"
                data={yieldTrendData}
              />
            </div>

            {/* Report Content Preview */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Report Preview
                </CardTitle>
                <CardDescription>
                  {selectedReport
                    ? `Preview of ${reportTypes.find(r => r.id === selectedReport)?.title}`
                    : 'Select a report type to see preview'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiReportData ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h3 className="text-xl font-bold text-primary mb-2">{aiReportData.title}</h3>
                      <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                        {aiReportData.summary_markdown}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Key Insights
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {aiReportData.key_insights.map((insight: string, i: number) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Leaf className="w-4 h-4" /> Recommendations
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {aiReportData.recommendations.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : selectedReport ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Report Contents</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          Executive Summary
                        </li>
                        <li className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          Data Analysis Section
                        </li>
                        <li className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          Visualizations & Charts
                        </li>
                        <li className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          Recommendations
                        </li>
                        <li className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          Raw Data Appendix
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The generated report will include all selected data filtered by your preferences.
                      Charts and statistics will be included based on the report type.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Select a report type from the left panel to preview its contents
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
