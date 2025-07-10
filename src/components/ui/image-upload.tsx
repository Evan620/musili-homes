import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Eye, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { compressImage, formatFileSize, getImageDimensions, COMPRESSION_PRESETS } from '@/lib/image-compression';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
  error?: string;
  compressed?: boolean;
  originalSize?: number;
  compressedSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  existingImages?: string[]; // URLs of existing images
  enableCompression?: boolean;
  enablePreview?: boolean;
  showImageInfo?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className,
  disabled = false,
  existingImages = [],
  enableCompression = true,
  enablePreview = true,
  showImageInfo = true
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert existing images to UploadedImage format
  React.useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageObjects: UploadedImage[] = existingImages.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], 'existing-image'), // Placeholder file
        preview: url,
        uploaded: true,
        url: url
      }));
      setImages(existingImageObjects);
      onImagesChange(existingImageObjects);
    }
  }, [existingImages, onImagesChange]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }
    
    return null;
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newImages: UploadedImage[] = [];

    for (const file of fileArray) {
      // Check if we've reached the max images limit
      if (images.length + newImages.length >= maxImages) {
        toast({
          title: "Maximum images reached",
          description: `You can only upload up to ${maxImages} images.`,
          variant: "destructive"
        });
        break;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: error,
          variant: "destructive"
        });
        continue;
      }

      try {
        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Create preview URL
        const preview = URL.createObjectURL(file);

        let processedFile = file;
        let compressed = false;
        let originalSize = file.size;
        let compressedSize = file.size;

        // Compress image if enabled
        if (enableCompression) {
          try {
            const compressionResult = await compressImage(file, COMPRESSION_PRESETS.large);
            processedFile = compressionResult.file;
            compressed = true;
            compressedSize = compressionResult.compressedSize;

            // Update preview with compressed image
            URL.revokeObjectURL(preview);
            const compressedPreview = URL.createObjectURL(processedFile);

            const uploadedImage: UploadedImage = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              file: processedFile,
              preview: compressedPreview,
              uploaded: false,
              compressed,
              originalSize,
              compressedSize,
              dimensions
            };

            newImages.push(uploadedImage);
          } catch (compressionError) {
            console.warn('Compression failed, using original file:', compressionError);

            const uploadedImage: UploadedImage = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              file,
              preview,
              uploaded: false,
              compressed: false,
              originalSize,
              compressedSize: originalSize,
              dimensions
            };

            newImages.push(uploadedImage);
          }
        } else {
          const uploadedImage: UploadedImage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview,
            uploaded: false,
            compressed: false,
            originalSize,
            compressedSize: originalSize,
            dimensions
          };

          newImages.push(uploadedImage);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Error processing image",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);

      const compressionInfo = enableCompression
        ? ` (${newImages.filter(img => img.compressed).length} compressed)`
        : '';

      toast({
        title: "Images added",
        description: `${newImages.length} image(s) ready for upload${compressionInfo}.`
      });
    }
  }, [images, maxImages, maxFileSize, acceptedTypes, onImagesChange, enableCompression]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    
    // Clean up preview URL to prevent memory leaks
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Upload className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: {acceptedTypes.map(type => type.split('/')[1]).join(', ')} 
                (max {Math.round(maxFileSize / 1024 / 1024)}MB each)
              </p>
              <p className="text-xs text-gray-500">
                {images.length}/{maxImages} images
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Upload status overlay */}
                {!image.uploaded && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-1">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Error
                    </div>
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {enablePreview && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Image Preview</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <img
                                src={image.preview}
                                alt="Full preview"
                                className="max-h-96 max-w-full object-contain rounded-lg"
                              />
                            </div>
                            {showImageInfo && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>File name:</strong> {image.file.name || 'Existing image'}
                                </div>
                                <div>
                                  <strong>File size:</strong> {formatFileSize(image.compressedSize || 0)}
                                </div>
                                {image.dimensions && (
                                  <div>
                                    <strong>Dimensions:</strong> {image.dimensions.width} × {image.dimensions.height}
                                  </div>
                                )}
                                {image.compressed && image.originalSize && (
                                  <div>
                                    <strong>Original size:</strong> {formatFileSize(image.originalSize)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Compression badge */}
              {image.compressed && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Compressed
                </Badge>
              )}

              {/* File info */}
              <div className="mt-1 space-y-1">
                <div className="text-xs text-gray-500 truncate">
                  {image.file.name || 'Existing image'}
                </div>
                {showImageInfo && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatFileSize(image.compressedSize || 0)}</span>
                    {image.dimensions && (
                      <span>{image.dimensions.width}×{image.dimensions.height}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
