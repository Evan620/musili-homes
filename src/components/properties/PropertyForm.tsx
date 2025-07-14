import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload, UploadedImage } from '@/components/ui/image-upload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, AlertTriangle } from 'lucide-react';
import { validateProperty, formatValidationErrors } from '@/lib/property-validation';

// Property form schema
const propertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  bedrooms: z.number().min(0, 'Bedrooms must be 0 or greater'),
  bathrooms: z.number().min(0, 'Bathrooms must be 0 or greater'),
  size: z.number().min(1, 'Size must be greater than 0'),
  status: z.enum(['For Sale', 'For Rent', 'Sold', 'Rented']),
  featured: z.boolean().default(false),
  agentId: z.union([z.string(), z.number()]).transform((val) => {
    const num = Number(val);
    if (isNaN(num) || num < 1) {
      throw new Error('Agent is required and must be a valid number');
    }
    return num;
  })
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { images: string[]; imageFiles?: File[] }) => void;
  onCancel?: () => void;
  initialData?: Partial<PropertyFormData & { images: string[] }>;
  agents: Array<{ id: number; name: string }>;
  isLoading?: boolean;
  propertyId?: number; // For editing existing properties
  // External upload state control for create property
  externalUploadState?: {
    isUploading: boolean;
    current: number;
    total: number;
    currentFileName?: string;
  };
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  agents,
  isLoading = false,
  propertyId,
  externalUploadState
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    current: number;
    total: number;
    currentFileName?: string;
  } | null>(null);

  const {
    uploadImages,
    isUploading: isUploadingToStorage,
    uploadProgress,
    getUploadStats
  } = useImageUpload({
    propertyId,
    onUploadComplete: (results) => {
      const successfulUploads = results.filter(r => r.success);
      const imageUrls = successfulUploads.map(r => r.url!);

      // Reset upload status
      setUploadStatus(null);
      setIsUploadingImages(false);

      // Submit form with uploaded image URLs
      const formData = form.getValues();
      onSubmit({
        ...formData,
        images: imageUrls
      });
    },
    onUploadError: (error) => {
      toast({
        title: "Image Upload Failed",
        description: error,
        variant: "destructive"
      });
      setUploadStatus(null);
      setIsUploadingImages(false);
    }
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      location: initialData?.location || '',
      address: initialData?.address || '',
      bedrooms: initialData?.bedrooms || 0,
      bathrooms: initialData?.bathrooms || 0,
      size: initialData?.size || 0,
      status: initialData?.status || 'For Sale',
      featured: initialData?.featured || false,
      agentId: initialData?.agentId || (agents.length === 1 ? agents[0].id : undefined)
    }
  });



  // Auto-select agent if there's only one available
  useEffect(() => {
    if (agents.length === 1 && !form.getValues('agentId')) {
      form.setValue('agentId', agents[0].id);
    }
  }, [agents, form]);

  // Use external upload state if provided (for create property)
  const effectiveUploadState = externalUploadState || uploadStatus;
  const effectiveIsUploading = externalUploadState?.isUploading || isUploadingImages;

  const handleFormSubmit = async (data: PropertyFormData) => {

    
    // Validate the property data
    const validation = validateProperty(data, {
      requireImages: false, // Images are optional for now
      strictMode: true
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: formatValidationErrors(validation.errors),
        variant: "destructive"
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      toast({
        title: "Validation Warnings",
        description: formatValidationErrors(validation.warnings),
        variant: "default"
      });
    }

    // Handle image uploads for both new and existing properties
    const newImages = images.filter(img => !img.uploaded && img.file);
    const existingImageUrls = images.filter(img => img.uploaded).map(img => img.url!);

    if (propertyId) {
      // For existing properties, upload new images first if there are any
      if (newImages.length > 0) {
        setIsUploadingImages(true);
        setUploadStatus({ current: 0, total: newImages.length });
        await uploadImages(newImages);
      } else {
        // No new images to upload, submit with existing image URLs
        onSubmit({
          ...data,
          images: existingImageUrls
        });
      }
    } else {
      // For new properties, start upload process and keep loading state
      const imageFiles = newImages.map(img => img.file!);

      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        setUploadStatus({ current: 0, total: imageFiles.length });
      }

      // Submit form data - parent will handle actual upload and keep us informed
      onSubmit({
        ...data,
        images: existingImageUrls,
        imageFiles: imageFiles
      });

      // Don't reset loading state here - parent will call onUploadComplete when done
    }
  };

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
  };

  const uploadStats = getUploadStats();
  const showUploadProgress = isUploadingImages && uploadProgress.length > 0;
  const showExternalProgress = externalUploadState?.isUploading && externalUploadState.total > 0;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        key="property-description"
                        placeholder="Describe the property features, amenities, and highlights"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KES)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="For Sale">For Sale</SelectItem>
                          <SelectItem value="For Rent">For Rent</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                          <SelectItem value="Rented">Rented</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location/Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nairobi, Karen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter complete address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (sq ft)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Agent</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={20}
                existingImages={initialData?.images || []}
                enableCompression={true}
                enablePreview={true}
                showImageInfo={true}
                disabled={isLoading || isUploadingImages}
              />

              {/* Upload Progress */}
              {(showUploadProgress || uploadStatus || showExternalProgress) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {propertyId ? 'Uploading Images...' : 'Uploading Images...'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {externalUploadState ?
                        `${externalUploadState.current}/${externalUploadState.total}` :
                        uploadStatus ?
                          `${uploadStatus.current}/${uploadStatus.total}` :
                          `${uploadStats.completed}/${uploadStats.total}`
                      }
                    </span>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                      style={{
                        width: externalUploadState ?
                          `${(externalUploadState.current / externalUploadState.total) * 100}%` :
                          uploadStatus ?
                            `${(uploadStatus.current / uploadStatus.total) * 100}%` :
                            `${(uploadStats.completed / uploadStats.total) * 100}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {externalUploadState ?
                          `${Math.round((externalUploadState.current / externalUploadState.total) * 100)}%` :
                          uploadStatus ?
                            `${Math.round((uploadStatus.current / uploadStatus.total) * 100)}%` :
                            `${Math.round((uploadStats.completed / uploadStats.total) * 100)}%`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Current File Info */}
                  {(externalUploadState?.currentFileName || uploadStatus?.currentFileName) && (
                    <div className="text-xs text-gray-600 truncate">
                      Processing: {externalUploadState?.currentFileName || uploadStatus?.currentFileName}
                    </div>
                  )}

                  {/* Detailed Progress for Edit Mode */}
                  {propertyId && showUploadProgress && (
                    <div className="mt-3 space-y-1">
                      {uploadProgress.map((progress, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{progress.fileName}</span>
                          <span className={progress.error ? 'text-red-500' : 'text-gray-500'}>
                            {progress.error ? 'Error' : `${progress.progress.toFixed(0)}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isUploadingImages || externalUploadState?.isUploading}
              className="min-w-[140px]"
            >
              {isLoading || isUploadingImages || externalUploadState?.isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {externalUploadState?.isUploading ? 'Uploading...' :
                   isUploadingImages ?
                    (propertyId ? 'Uploading...' : 'Preparing...') :
                    'Saving...'
                  }
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {propertyId ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
