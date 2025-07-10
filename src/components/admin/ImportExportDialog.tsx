import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Property, Agent } from '@/types';
import { 
  exportPropertiesToCSV, 
  downloadCSV, 
  parseCSVToProperties, 
  generateImportTemplate,
  formatFileSize,
  ImportResult,
  ImportedProperty
} from '@/lib/property-import-export';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  agents: Agent[];
  onImportProperties: (properties: ImportedProperty[]) => Promise<void>;
  isLoading?: boolean;
}

export const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  open,
  onOpenChange,
  properties,
  agents,
  onImportProperties,
  isLoading = false
}) => {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle export
  const handleExport = () => {
    const csvContent = exportPropertiesToCSV(properties, agents);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `properties-export-${timestamp}.csv`);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    const template = generateImportTemplate(agents);
    downloadCSV(template, 'property-import-template.csv');
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => {
        const result = parseCSVToProperties(csvContent, agents);
        setImportResult(result);
        setUploadProgress(100);
        setIsProcessing(false);
        clearInterval(progressInterval);
      }, 1000);
    };

    reader.readAsText(file);
  };

  // Handle import confirmation
  const handleConfirmImport = async () => {
    if (!importResult?.validProperties.length) return;

    try {
      await onImportProperties(importResult.validProperties);
      setImportResult(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  // Reset import state
  const resetImport = () => {
    setImportResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Import / Export Properties</span>
          </DialogTitle>
          <DialogDescription>
            Import properties from CSV or export current properties to CSV format
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Current Properties</h4>
                    <p className="text-sm text-gray-600">
                      {properties.length} properties ready for export
                    </p>
                  </div>
                  <Badge variant="secondary">{properties.length} items</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Export includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Property details (title, description, price, location)</li>
                    <li>• Property specifications (bedrooms, bathrooms, size)</li>
                    <li>• Status and featured information</li>
                    <li>• Agent assignments</li>
                    <li>• Creation dates and image counts</li>
                  </ul>
                </div>

                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!importResult ? (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Download the template first to ensure your CSV has the correct format.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      onClick={handleDownloadTemplate}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Template
                    </Button>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Select a CSV file to import properties
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                      >
                        Choose CSV File
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing file...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Import Results */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResult.summary.total}
                        </div>
                        <div className="text-sm text-blue-600">Total Rows</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.summary.valid}
                        </div>
                        <div className="text-sm text-green-600">Valid</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {importResult.summary.invalid}
                        </div>
                        <div className="text-sm text-red-600">Invalid</div>
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {importResult.invalidRows.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {importResult.invalidRows.length} rows have validation errors and will be skipped.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Error Details */}
                    {importResult.invalidRows.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded p-2">
                        <h4 className="font-medium text-sm mb-2">Validation Errors:</h4>
                        {importResult.invalidRows.slice(0, 5).map((row, index) => (
                          <div key={index} className="text-xs text-red-600 mb-1">
                            Row {row.row}: {row.errors.join(', ')}
                          </div>
                        ))}
                        {importResult.invalidRows.length > 5 && (
                          <div className="text-xs text-gray-500">
                            ... and {importResult.invalidRows.length - 5} more errors
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={resetImport}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleConfirmImport}
                        disabled={importResult.summary.valid === 0 || isLoading}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Import {importResult.summary.valid} Properties
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
