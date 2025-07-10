import React, { useState } from 'react';
import { Users, Tag, Trash2, Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Property, Agent } from '@/types';

export type BulkOperation = 'status' | 'agent' | 'featured' | 'delete';

interface BulkOperationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProperties: Property[];
  agents: Agent[];
  onBulkStatusChange: (propertyIds: number[], newStatus: string) => void;
  onBulkAgentChange: (propertyIds: number[], newAgentId: number) => void;
  onBulkFeaturedChange: (propertyIds: number[], featured: boolean) => void;
  onBulkDelete: (propertyIds: number[]) => void;
  isLoading?: boolean;
}

export const BulkOperationsDialog: React.FC<BulkOperationsDialogProps> = ({
  open,
  onOpenChange,
  selectedProperties,
  agents,
  onBulkStatusChange,
  onBulkAgentChange,
  onBulkFeaturedChange,
  onBulkDelete,
  isLoading = false
}) => {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | ''>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newAgentId, setNewAgentId] = useState<string>('');
  const [newFeatured, setNewFeatured] = useState<string>('');

  const propertyIds = selectedProperties.map(p => p.id);

  const handleExecute = () => {
    switch (selectedOperation) {
      case 'status':
        if (newStatus) {
          onBulkStatusChange(propertyIds, newStatus);
        }
        break;
      case 'agent':
        if (newAgentId) {
          onBulkAgentChange(propertyIds, parseInt(newAgentId));
        }
        break;
      case 'featured':
        if (newFeatured) {
          onBulkFeaturedChange(propertyIds, newFeatured === 'true');
        }
        break;
      case 'delete':
        onBulkDelete(propertyIds);
        break;
    }
    
    // Reset form
    setSelectedOperation('');
    setNewStatus('');
    setNewAgentId('');
    setNewFeatured('');
    onOpenChange(false);
  };

  const canExecute = () => {
    switch (selectedOperation) {
      case 'status':
        return newStatus !== '';
      case 'agent':
        return newAgentId !== '';
      case 'featured':
        return newFeatured !== '';
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  const getOperationDescription = () => {
    switch (selectedOperation) {
      case 'status':
        return `Change status of ${selectedProperties.length} properties to "${newStatus}"`;
      case 'agent':
        const agent = agents.find(a => a.id === parseInt(newAgentId));
        return `Assign ${selectedProperties.length} properties to ${agent?.name || 'selected agent'}`;
      case 'featured':
        return `${newFeatured === 'true' ? 'Mark' : 'Unmark'} ${selectedProperties.length} properties as featured`;
      case 'delete':
        return `Delete ${selectedProperties.length} properties permanently`;
      default:
        return '';
    }
  };

  const getOperationIcon = () => {
    switch (selectedOperation) {
      case 'status':
        return <Tag className="h-4 w-4" />;
      case 'agent':
        return <Users className="h-4 w-4" />;
      case 'featured':
        return <Edit3 className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Group properties by current values for display
  const statusGroups = selectedProperties.reduce((acc, prop) => {
    acc[prop.status] = (acc[prop.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const agentGroups = selectedProperties.reduce((acc, prop) => {
    const agent = agents.find(a => a.id === prop.agentId);
    const agentName = agent?.name || 'Unassigned';
    acc[agentName] = (acc[agentName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const featuredCount = selectedProperties.filter(p => p.featured).length;
  const notFeaturedCount = selectedProperties.length - featuredCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Bulk Operations</span>
          </DialogTitle>
          <DialogDescription>
            Perform bulk operations on {selectedProperties.length} selected properties
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Selection Summary */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selected Properties Summary</Label>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Status Distribution:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(statusGroups).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-xs text-gray-500">Agent Distribution:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(agentGroups).map(([agentName, count]) => (
                    <Badge key={agentName} variant="outline" className="text-xs">
                      {agentName}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-xs text-gray-500">Featured Status:</span>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Featured: {featuredCount}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Not Featured: {notFeaturedCount}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Operation Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select Operation</Label>
            
            <Select value={selectedOperation} onValueChange={(value) => setSelectedOperation(value as BulkOperation)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an operation..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Change Status</SelectItem>
                <SelectItem value="agent">Reassign Agent</SelectItem>
                <SelectItem value="featured">Toggle Featured Status</SelectItem>
                <SelectItem value="delete" className="text-red-600">Delete Properties</SelectItem>
              </SelectContent>
            </Select>

            {/* Operation-specific inputs */}
            {selectedOperation === 'status' && (
              <div className="space-y-2">
                <Label className="text-sm">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="For Rent">For Rent</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOperation === 'agent' && (
              <div className="space-y-2">
                <Label className="text-sm">Assign to Agent</Label>
                <Select value={newAgentId} onValueChange={setNewAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOperation === 'featured' && (
              <div className="space-y-2">
                <Label className="text-sm">Featured Status</Label>
                <Select value={newFeatured} onValueChange={setNewFeatured}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select featured status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Mark as Featured</SelectItem>
                    <SelectItem value="false">Remove from Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOperation === 'delete' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <Trash2 className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Permanent Deletion</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete all selected properties and their associated images. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operation Preview */}
          {selectedOperation && canExecute() && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                {getOperationIcon()}
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-blue-800">Operation Preview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {getOperationDescription()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={!canExecute() || isLoading}
            variant={selectedOperation === 'delete' ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : 'Execute Operation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
