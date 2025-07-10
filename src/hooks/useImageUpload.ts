/**
 * Custom hook for managing image uploads with Supabase Storage
 * Handles upload, deletion, and state management for property images
 */

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  uploadPropertyImage, 
  uploadPropertyImages, 
  deletePropertyImage, 
  deletePropertyImages,
  UploadResult 
} from '@/services/storage';
import { UploadedImage } from '@/components/ui/image-upload';

interface UseImageUploadOptions {
  propertyId?: number;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  enableCompression?: boolean;
}

interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  completed: boolean;
  error?: string;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    propertyId,
    onUploadComplete,
    onUploadError,
    enableCompression = true
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  /**
   * Upload multiple images to Supabase Storage
   */
  const uploadImages = useCallback(async (images: UploadedImage[]) => {
    if (!propertyId) {
      const error = 'Property ID is required for image upload';
      onUploadError?.(error);
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress([]);

    try {
      // Initialize progress tracking
      const initialProgress: UploadProgress[] = images.map((image, index) => ({
        fileIndex: index,
        fileName: image.file.name,
        progress: 0,
        completed: false
      }));
      setUploadProgress(initialProgress);

      // Upload images
      const files = images.map(img => img.file);
      const results = await uploadPropertyImages(files, propertyId, {
        compress: enableCompression,
        onProgress: (fileIndex, progress) => {
          setUploadProgress(prev => prev.map((item, index) => 
            index === fileIndex 
              ? { ...item, progress: progress.percentage }
              : item
          ));
        },
        onComplete: (fileIndex, result) => {
          setUploadProgress(prev => prev.map((item, index) => 
            index === fileIndex 
              ? { 
                  ...item, 
                  completed: true, 
                  error: result.success ? undefined : result.error 
                }
              : item
          ));
        }
      });

      // Update uploaded images with results
      const updatedImages = images.map((image, index) => {
        const result = results[index];
        return {
          ...image,
          uploaded: result.success,
          url: result.url,
          error: result.error
        };
      });

      setUploadedImages(updatedImages);
      onUploadComplete?.(results);

      // Show success/error toast
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;

      if (errorCount === 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} image(s) uploaded successfully.`
        });
      } else {
        toast({
          title: "Upload Completed with Errors",
          description: `${successCount} uploaded, ${errorCount} failed.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      onUploadError?.(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [propertyId, enableCompression, onUploadComplete, onUploadError]);

  /**
   * Delete a single image from storage
   */
  const deleteImage = useCallback(async (storagePath: string) => {
    try {
      const result = await deletePropertyImage(storagePath);
      
      if (result.success) {
        // Remove from uploaded images
        setUploadedImages(prev => prev.filter(img => img.url !== storagePath));
        
        toast({
          title: "Image Deleted",
          description: "Image has been removed successfully."
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete image",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Delete all images for a property
   */
  const deleteAllImages = useCallback(async () => {
    if (!propertyId) {
      const error = 'Property ID is required for image deletion';
      toast({
        title: "Delete Error",
        description: error,
        variant: "destructive"
      });
      return { success: false, error };
    }

    try {
      const result = await deletePropertyImages(propertyId);
      
      if (result.success) {
        setUploadedImages([]);
        toast({
          title: "All Images Deleted",
          description: "All property images have been removed successfully."
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete images",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, [propertyId]);

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress([]);
    setUploadedImages([]);
  }, []);

  /**
   * Get upload statistics
   */
  const getUploadStats = useCallback(() => {
    const total = uploadProgress.length;
    const completed = uploadProgress.filter(p => p.completed).length;
    const errors = uploadProgress.filter(p => p.error).length;
    const inProgress = total - completed;

    return {
      total,
      completed,
      errors,
      inProgress,
      successRate: total > 0 ? (completed - errors) / total : 0
    };
  }, [uploadProgress]);

  return {
    // State
    isUploading,
    uploadProgress,
    uploadedImages,
    
    // Actions
    uploadImages,
    deleteImage,
    deleteAllImages,
    resetUpload,
    
    // Utils
    getUploadStats
  };
};
