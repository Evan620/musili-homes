import React from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type ConfirmationVariant = 'destructive' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  details?: string[];
  warningText?: string;
}

const getVariantConfig = (variant: ConfirmationVariant) => {
  switch (variant) {
    case 'destructive':
      return {
        icon: Trash2,
        iconColor: 'text-red-500',
        confirmButtonVariant: 'destructive' as const,
        badgeColor: 'bg-red-100 text-red-800 border-red-200'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        confirmButtonVariant: 'default' as const,
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    case 'info':
      return {
        icon: Info,
        iconColor: 'text-blue-500',
        confirmButtonVariant: 'default' as const,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'success':
      return {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        confirmButtonVariant: 'default' as const,
        badgeColor: 'bg-green-100 text-green-800 border-green-200'
      };
    default:
      return {
        icon: Info,
        iconColor: 'text-gray-500',
        confirmButtonVariant: 'default' as const,
        badgeColor: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
  isLoading = false,
  details = [],
  warningText
}) => {
  const config = getVariantConfig(variant);
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-gray-100 ${config.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Details Section */}
        {details.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Details:</h4>
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Section */}
        {warningText && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">{warningText}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Specialized property deletion dialog
interface PropertyDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: number;
    title: string;
    location: string;
    price: number;
    images: string[];
    agentId: number;
  } | null;
  onConfirm: (propertyId: number) => void;
  isLoading?: boolean;
  agentName?: string;
}

export const PropertyDeletionDialog: React.FC<PropertyDeletionDialogProps> = ({
  open,
  onOpenChange,
  property,
  onConfirm,
  isLoading = false,
  agentName
}) => {
  if (!property) return null;

  const details = [
    `Property: ${property.title}`,
    `Location: ${property.location}`,
    `Price: KES ${property.price.toLocaleString()}`,
    `Images: ${property.images.length} image(s) will be deleted`,
    agentName ? `Assigned Agent: ${agentName}` : 'No assigned agent'
  ];

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Property"
      description="Are you sure you want to delete this property? This action cannot be undone."
      confirmText="Delete Property"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={() => onConfirm(property.id)}
      isLoading={isLoading}
      details={details}
      warningText="All associated images will be permanently deleted from storage. Property assignments and related data will also be removed."
    />
  );
};

// Bulk deletion dialog
interface BulkDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BulkDeletionDialog: React.FC<BulkDeletionDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isLoading = false
}) => {
  const details = [
    `${selectedCount} properties will be deleted`,
    'All associated images will be removed from storage',
    'Property assignments will be cleared',
    'This action affects multiple records'
  ];

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Multiple Properties"
      description={`Are you sure you want to delete ${selectedCount} selected properties? This action cannot be undone.`}
      confirmText={`Delete ${selectedCount} Properties`}
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
      isLoading={isLoading}
      details={details}
      warningText="This is a bulk operation that will permanently delete multiple properties and all their associated data. Please ensure you have selected the correct properties."
    />
  );
};
