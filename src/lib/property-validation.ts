/**
 * Comprehensive property validation and error handling utilities
 */

import { Property } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface PropertyValidationOptions {
  requireImages?: boolean;
  minPrice?: number;
  maxPrice?: number;
  allowedStatuses?: string[];
  strictMode?: boolean;
}

// Default validation options
const DEFAULT_OPTIONS: PropertyValidationOptions = {
  requireImages: false,
  minPrice: 1,
  maxPrice: 1000000000, // 1 billion
  allowedStatuses: ['For Sale', 'For Rent', 'Sold', 'Rented'],
  strictMode: false
};

/**
 * Validate a complete property object
 */
export const validateProperty = (
  property: Partial<Property>,
  options: PropertyValidationOptions = {}
): ValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Title validation
  if (!property.title || property.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Property title is required',
      code: 'TITLE_REQUIRED'
    });
  } else if (property.title.length < 5) {
    errors.push({
      field: 'title',
      message: 'Property title must be at least 5 characters long',
      code: 'TITLE_TOO_SHORT'
    });
  } else if (property.title.length > 200) {
    errors.push({
      field: 'title',
      message: 'Property title must be less than 200 characters',
      code: 'TITLE_TOO_LONG'
    });
  }

  // Description validation
  if (!property.description || property.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Property description is required',
      code: 'DESCRIPTION_REQUIRED'
    });
  } else if (property.description.length < 10) {
    errors.push({
      field: 'description',
      message: 'Property description must be at least 10 characters long',
      code: 'DESCRIPTION_TOO_SHORT'
    });
  } else if (property.description.length > 2000) {
    errors.push({
      field: 'description',
      message: 'Property description must be less than 2000 characters',
      code: 'DESCRIPTION_TOO_LONG'
    });
  }

  // Price validation
  if (property.price === undefined || property.price === null) {
    errors.push({
      field: 'price',
      message: 'Property price is required',
      code: 'PRICE_REQUIRED'
    });
  } else if (typeof property.price !== 'number' || isNaN(property.price)) {
    errors.push({
      field: 'price',
      message: 'Property price must be a valid number',
      code: 'PRICE_INVALID'
    });
  } else if (property.price < opts.minPrice!) {
    errors.push({
      field: 'price',
      message: `Property price must be at least ${opts.minPrice}`,
      code: 'PRICE_TOO_LOW'
    });
  } else if (property.price > opts.maxPrice!) {
    errors.push({
      field: 'price',
      message: `Property price must be less than ${opts.maxPrice}`,
      code: 'PRICE_TOO_HIGH'
    });
  }

  // Location validation
  if (!property.location || property.location.trim().length === 0) {
    errors.push({
      field: 'location',
      message: 'Property location is required',
      code: 'LOCATION_REQUIRED'
    });
  } else if (property.location.length < 2) {
    errors.push({
      field: 'location',
      message: 'Property location must be at least 2 characters long',
      code: 'LOCATION_TOO_SHORT'
    });
  }

  // Address validation
  if (!property.address || property.address.trim().length === 0) {
    errors.push({
      field: 'address',
      message: 'Property address is required',
      code: 'ADDRESS_REQUIRED'
    });
  } else if (property.address.length < 5) {
    errors.push({
      field: 'address',
      message: 'Property address must be at least 5 characters long',
      code: 'ADDRESS_TOO_SHORT'
    });
  }

  // Bedrooms validation
  if (property.bedrooms === undefined || property.bedrooms === null) {
    errors.push({
      field: 'bedrooms',
      message: 'Number of bedrooms is required',
      code: 'BEDROOMS_REQUIRED'
    });
  } else if (typeof property.bedrooms !== 'number' || !Number.isInteger(property.bedrooms)) {
    errors.push({
      field: 'bedrooms',
      message: 'Number of bedrooms must be a whole number',
      code: 'BEDROOMS_INVALID'
    });
  } else if (property.bedrooms < 0) {
    errors.push({
      field: 'bedrooms',
      message: 'Number of bedrooms cannot be negative',
      code: 'BEDROOMS_NEGATIVE'
    });
  } else if (property.bedrooms > 20) {
    warnings.push({
      field: 'bedrooms',
      message: 'Unusually high number of bedrooms (>20)',
      code: 'BEDROOMS_HIGH'
    });
  }

  // Bathrooms validation
  if (property.bathrooms === undefined || property.bathrooms === null) {
    errors.push({
      field: 'bathrooms',
      message: 'Number of bathrooms is required',
      code: 'BATHROOMS_REQUIRED'
    });
  } else if (typeof property.bathrooms !== 'number') {
    errors.push({
      field: 'bathrooms',
      message: 'Number of bathrooms must be a number',
      code: 'BATHROOMS_INVALID'
    });
  } else if (property.bathrooms < 0) {
    errors.push({
      field: 'bathrooms',
      message: 'Number of bathrooms cannot be negative',
      code: 'BATHROOMS_NEGATIVE'
    });
  } else if (property.bathrooms > 10) {
    warnings.push({
      field: 'bathrooms',
      message: 'Unusually high number of bathrooms (>10)',
      code: 'BATHROOMS_HIGH'
    });
  }

  // Size validation
  if (property.size === undefined || property.size === null) {
    errors.push({
      field: 'size',
      message: 'Property size is required',
      code: 'SIZE_REQUIRED'
    });
  } else if (typeof property.size !== 'number' || !Number.isInteger(property.size)) {
    errors.push({
      field: 'size',
      message: 'Property size must be a whole number',
      code: 'SIZE_INVALID'
    });
  } else if (property.size <= 0) {
    errors.push({
      field: 'size',
      message: 'Property size must be greater than 0',
      code: 'SIZE_ZERO_OR_NEGATIVE'
    });
  } else if (property.size < 100) {
    warnings.push({
      field: 'size',
      message: 'Unusually small property size (<100 sq ft)',
      code: 'SIZE_SMALL'
    });
  } else if (property.size > 50000) {
    warnings.push({
      field: 'size',
      message: 'Unusually large property size (>50,000 sq ft)',
      code: 'SIZE_LARGE'
    });
  }

  // Status validation
  if (!property.status) {
    errors.push({
      field: 'status',
      message: 'Property status is required',
      code: 'STATUS_REQUIRED'
    });
  } else if (!opts.allowedStatuses!.includes(property.status)) {
    errors.push({
      field: 'status',
      message: `Property status must be one of: ${opts.allowedStatuses!.join(', ')}`,
      code: 'STATUS_INVALID'
    });
  }

  // Agent ID validation
  if (property.agentId === undefined || property.agentId === null) {
    errors.push({
      field: 'agentId',
      message: 'Agent assignment is required',
      code: 'AGENT_REQUIRED'
    });
  } else if (typeof property.agentId !== 'number' || !Number.isInteger(property.agentId)) {
    errors.push({
      field: 'agentId',
      message: 'Agent ID must be a valid number',
      code: 'AGENT_INVALID'
    });
  } else if (property.agentId <= 0) {
    errors.push({
      field: 'agentId',
      message: 'Agent ID must be a positive number',
      code: 'AGENT_INVALID_ID'
    });
  }

  // Images validation
  if (opts.requireImages && (!property.images || property.images.length === 0)) {
    errors.push({
      field: 'images',
      message: 'At least one property image is required',
      code: 'IMAGES_REQUIRED'
    });
  } else if (property.images && property.images.length > 50) {
    warnings.push({
      field: 'images',
      message: 'Large number of images may affect performance',
      code: 'IMAGES_MANY'
    });
  }

  // Business logic validations
  if (opts.strictMode) {
    // Strict mode additional validations
    if (property.bedrooms && property.bathrooms && property.bathrooms > property.bedrooms * 2) {
      warnings.push({
        field: 'bathrooms',
        message: 'Unusually high bathroom to bedroom ratio',
        code: 'BATHROOM_BEDROOM_RATIO'
      });
    }

    if (property.price && property.size && (property.price / property.size) > 10000) {
      warnings.push({
        field: 'price',
        message: 'Very high price per square foot',
        code: 'PRICE_PER_SQFT_HIGH'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate property for specific operations
 */
export const validatePropertyForOperation = (
  property: Partial<Property>,
  operation: 'create' | 'update' | 'delete',
  options: PropertyValidationOptions = {}
): ValidationResult => {
  const baseValidation = validateProperty(property, options);

  switch (operation) {
    case 'create':
      // For creation, all fields are required
      return validateProperty(property, { ...options, requireImages: false });
    
    case 'update':
      // For updates, only validate provided fields
      const updateErrors = baseValidation.errors.filter(error => {
        const fieldValue = (property as any)[error.field];
        return fieldValue !== undefined && fieldValue !== null;
      });
      
      return {
        isValid: updateErrors.length === 0,
        errors: updateErrors,
        warnings: baseValidation.warnings
      };
    
    case 'delete':
      // For deletion, only check if property exists
      if (!property.id) {
        return {
          isValid: false,
          errors: [{
            field: 'id',
            message: 'Property ID is required for deletion',
            code: 'ID_REQUIRED'
          }],
          warnings: []
        };
      }
      return { isValid: true, errors: [], warnings: [] };
    
    default:
      return baseValidation;
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Multiple validation errors:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
};

/**
 * Get field-specific errors
 */
export const getFieldErrors = (errors: ValidationError[], field: string): ValidationError[] => {
  return errors.filter(error => error.field === field);
};

/**
 * Check if a specific field has errors
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(error => error.field === field);
};
