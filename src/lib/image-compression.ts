/**
 * Image compression utilities for optimizing images before upload
 * Reduces file size while maintaining acceptable quality for property images
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'jpeg' | 'webp' | 'png';
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Default compression settings optimized for property images
 */
export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'jpeg',
  maintainAspectRatio: true
};

/**
 * Compress an image file using canvas-based compression
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    // Validate file
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file: not an image'));
      return;
    }

    // Create image element
    const img = new Image();
    let objectUrl: string | null = null;
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        );

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Configure canvas for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              generateCompressedFileName(file.name, format),
              {
                type: `image/${format}`,
                lastModified: Date.now()
              }
            );

            // Calculate compression metrics
            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio,
              dimensions: {
                width: newWidth,
                height: newHeight
              }
            });
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        // Clean up object URL
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      // Clean up object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    // Load image with error handling
    try {
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } catch (error) {
      reject(new Error('Failed to create object URL for image'));
    }
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } => {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    };
  }

  // If image is already smaller than max dimensions, return original
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight
    };
  }

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scalingFactor = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * scalingFactor),
    height: Math.round(originalHeight * scalingFactor)
  };
};

/**
 * Generate a filename for the compressed image
 */
export const generateCompressedFileName = (
  originalName: string,
  format: string
): string => {
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${nameWithoutExtension}_compressed_${timestamp}.${format}`;
};

/**
 * Batch compress multiple images
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<CompressionResult[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Get image dimensions without loading the full image
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate if file is a supported image type
 */
export const isValidImageType = (file: File): boolean => {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return supportedTypes.includes(file.type);
};

/**
 * Compression presets for different use cases
 */
export const COMPRESSION_PRESETS = {
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
    format: 'jpeg' as const
  },
  medium: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
    format: 'jpeg' as const
  },
  large: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    format: 'jpeg' as const
  },
  highQuality: {
    maxWidth: 2560,
    maxHeight: 1440,
    quality: 0.95,
    format: 'webp' as const
  }
} as const;

/**
 * Generate multiple optimized versions of an image for different use cases
 */
export const generateImageVariants = async (
  file: File
): Promise<{
  thumbnail: CompressionResult;
  medium: CompressionResult;
  large: CompressionResult;
}> => {
  const [thumbnail, medium, large] = await Promise.all([
    compressImage(file, COMPRESSION_PRESETS.thumbnail),
    compressImage(file, COMPRESSION_PRESETS.medium),
    compressImage(file, COMPRESSION_PRESETS.large)
  ]);

  return { thumbnail, medium, large };
};

/**
 * Smart compression that chooses the best settings based on image characteristics
 */
export const smartCompress = async (file: File): Promise<CompressionResult> => {
  const dimensions = await getImageDimensions(file);
  const fileSize = file.size;

  // Choose compression settings based on image characteristics
  let preset = COMPRESSION_PRESETS.medium;

  if (dimensions.width > 2000 || dimensions.height > 2000) {
    // Large images get more aggressive compression
    preset = COMPRESSION_PRESETS.large;
  } else if (dimensions.width < 800 && dimensions.height < 600) {
    // Small images get lighter compression
    preset = {
      ...COMPRESSION_PRESETS.medium,
      quality: 0.9
    };
  }

  // Adjust quality based on file size
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    preset = {
      ...preset,
      quality: Math.max(0.7, preset.quality - 0.1)
    };
  }

  return compressImage(file, preset);
};

/**
 * Create a responsive image set with multiple sizes
 */
export const createResponsiveImageSet = async (
  file: File
): Promise<{
  small: CompressionResult;
  medium: CompressionResult;
  large: CompressionResult;
  original?: CompressionResult;
}> => {
  const originalDimensions = await getImageDimensions(file);

  const variants = await Promise.all([
    // Small (mobile)
    compressImage(file, {
      maxWidth: 480,
      maxHeight: 320,
      quality: 0.8,
      format: 'jpeg'
    }),
    // Medium (tablet)
    compressImage(file, {
      maxWidth: 768,
      maxHeight: 512,
      quality: 0.85,
      format: 'jpeg'
    }),
    // Large (desktop)
    compressImage(file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.9,
      format: 'jpeg'
    })
  ]);

  const result: any = {
    small: variants[0],
    medium: variants[1],
    large: variants[2]
  };

  // Only include original if it's significantly larger than the large variant
  if (originalDimensions.width > 1400 || originalDimensions.height > 900) {
    result.original = await compressImage(file, {
      maxWidth: originalDimensions.width,
      maxHeight: originalDimensions.height,
      quality: 0.95,
      format: 'webp'
    });
  }

  return result;
};

/**
 * Optimize image for web display with automatic format selection
 */
export const optimizeForWeb = async (
  file: File,
  targetSize?: number // Target file size in bytes
): Promise<CompressionResult> => {
  const dimensions = await getImageDimensions(file);

  // Try WebP first for better compression
  let result = await compressImage(file, {
    maxWidth: Math.min(dimensions.width, 1920),
    maxHeight: Math.min(dimensions.height, 1080),
    quality: 0.85,
    format: 'webp'
  });

  // If target size is specified and we're over it, try more aggressive compression
  if (targetSize && result.compressedSize > targetSize) {
    const qualityReduction = Math.max(0.1, targetSize / result.compressedSize);
    const newQuality = Math.max(0.6, 0.85 * qualityReduction);

    result = await compressImage(file, {
      maxWidth: Math.min(dimensions.width, 1920),
      maxHeight: Math.min(dimensions.height, 1080),
      quality: newQuality,
      format: 'webp'
    });
  }

  // Fallback to JPEG if WebP doesn't provide good enough compression
  if (result.compressionRatio < 30) {
    const jpegResult = await compressImage(file, {
      maxWidth: Math.min(dimensions.width, 1920),
      maxHeight: Math.min(dimensions.height, 1080),
      quality: 0.8,
      format: 'jpeg'
    });

    // Use JPEG if it provides better compression
    if (jpegResult.compressedSize < result.compressedSize) {
      result = jpegResult;
    }
  }

  return result;
};
