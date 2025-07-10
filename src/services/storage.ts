/**
 * Supabase Storage service for handling property image uploads
 */

import { supabase } from '@/integrations/supabase/client';
import { compressImage, CompressionOptions, COMPRESSION_PRESETS } from '@/lib/image-compression';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a single image to Supabase Storage
 */
export const uploadPropertyImage = async (
  file: File,
  propertyId: number,
  options: {
    compress?: boolean;
    compressionOptions?: CompressionOptions;
    onProgress?: (progress: UploadProgress) => void;
  } = {}
): Promise<UploadResult> => {
  try {
    const {
      compress = true,
      compressionOptions = COMPRESSION_PRESETS.large,
      onProgress
    } = options;

    let fileToUpload = file;
    let originalSize = file.size;
    let compressedSize = file.size;

    // Compress image if requested
    if (compress) {
      try {
        const compressionResult = await compressImage(file, compressionOptions);
        fileToUpload = compressionResult.file;
        compressedSize = compressionResult.compressedSize;
        
        console.log(`Image compressed: ${originalSize} -> ${compressedSize} bytes (${compressionResult.compressionRatio.toFixed(1)}% reduction)`);
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original:', compressionError);
        // Continue with original file if compression fails
      }
    }

    // Ensure fileToUpload has a proper name property
    if (!fileToUpload || !fileToUpload.name) {
      console.warn('File has no name property, using fallback name');
      fileToUpload = new File([fileToUpload], file.name || 'image.jpg', {
        type: fileToUpload?.type || 'image/jpeg'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    
    // Create storage path: property-images/{propertyId}/{fileName}
    const storagePath = `${propertyId}/${fileName}`;

    // Simulate progress for better UX
    if (onProgress) {
      onProgress({ loaded: 0, total: fileToUpload.size, percentage: 0 });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(storagePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Simulate progress completion
    if (onProgress) {
      onProgress({ loaded: fileToUpload.size, total: fileToUpload.size, percentage: 100 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
      originalSize,
      compressedSize
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Upload multiple images for a property
 */
export const uploadPropertyImages = async (
  files: File[],
  propertyId: number,
  options: {
    compress?: boolean;
    compressionOptions?: CompressionOptions;
    onProgress?: (fileIndex: number, progress: UploadProgress) => void;
    onComplete?: (fileIndex: number, result: UploadResult) => void;
  } = {}
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const result = await uploadPropertyImage(file, propertyId, {
      ...options,
      onProgress: (progress) => options.onProgress?.(i, progress)
    });

    results.push(result);
    options.onComplete?.(i, result);
  }

  return results;
};

/**
 * Delete an image from storage
 */
export const deletePropertyImage = async (storagePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('property-images')
      .remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
};

/**
 * Delete all images for a property
 */
export const deletePropertyImages = async (propertyId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    // List all files in the property folder
    const { data: files, error: listError } = await supabase.storage
      .from('property-images')
      .list(propertyId.toString());

    if (listError) {
      console.error('Storage list error:', listError);
      return {
        success: false,
        error: listError.message
      };
    }

    if (!files || files.length === 0) {
      return { success: true }; // No files to delete
    }

    // Delete all files
    const filePaths = files.map(file => `${propertyId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('property-images')
      .remove(filePaths);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
      return {
        success: false,
        error: deleteError.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete property images error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
};

/**
 * Get public URL for a storage path
 */
export const getImageUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
};

/**
 * List all images for a property
 */
export const listPropertyImages = async (propertyId: number): Promise<{ success: boolean; images?: string[]; error?: string }> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('property-images')
      .list(propertyId.toString());

    if (error) {
      console.error('Storage list error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!files) {
      return {
        success: true,
        images: []
      };
    }

    // Convert file paths to public URLs
    const imageUrls = files.map(file => {
      const storagePath = `${propertyId}/${file.name}`;
      return getImageUrl(storagePath);
    });

    return {
      success: true,
      images: imageUrls
    };
  } catch (error) {
    console.error('List property images error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<{
  success: boolean;
  totalFiles?: number;
  totalSize?: number;
  error?: string;
}> => {
  try {
    // This would require admin access to get full storage stats
    // For now, we'll return a placeholder
    return {
      success: true,
      totalFiles: 0,
      totalSize: 0
    };
  } catch (error) {
    console.error('Storage stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
