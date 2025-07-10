/**
 * Property Import/Export utilities for CSV and Excel files
 */

import { Property, Agent } from '@/types';

// CSV headers for property export
const CSV_HEADERS = [
  'ID',
  'Title',
  'Description',
  'Price',
  'Location',
  'Address',
  'Bedrooms',
  'Bathrooms',
  'Size (sq ft)',
  'Status',
  'Featured',
  'Agent ID',
  'Agent Name',
  'Created At',
  'Image Count'
];

// Property validation schema for import
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportedProperty {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented';
  featured: boolean;
  agentId: number;
}

export interface ImportResult {
  success: boolean;
  validProperties: ImportedProperty[];
  invalidRows: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Export properties to CSV format
 */
export const exportPropertiesToCSV = (properties: Property[], agents: Agent[]): string => {
  const agentMap = new Map(agents.map(agent => [agent.id, agent.name]));
  
  const csvRows = [
    CSV_HEADERS.join(','),
    ...properties.map(property => [
      property.id,
      `"${property.title.replace(/"/g, '""')}"`,
      `"${property.description.replace(/"/g, '""')}"`,
      property.price,
      `"${property.location.replace(/"/g, '""')}"`,
      `"${property.address.replace(/"/g, '""')}"`,
      property.bedrooms,
      property.bathrooms,
      property.size,
      `"${property.status}"`,
      property.featured ? 'Yes' : 'No',
      property.agentId,
      `"${agentMap.get(property.agentId) || 'Unknown'}"`,
      property.createdAt,
      property.images.length
    ].join(','))
  ];
  
  return csvRows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string = 'properties.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Parse CSV content to properties
 */
export const parseCSVToProperties = (csvContent: string, agents: Agent[]): ImportResult => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const agentIds = new Set(agents.map(a => a.id));
  
  if (lines.length < 2) {
    return {
      success: false,
      validProperties: [],
      invalidRows: [],
      summary: { total: 0, valid: 0, invalid: 0 }
    };
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1);
  
  const validProperties: ImportedProperty[] = [];
  const invalidRows: Array<{ row: number; data: any; errors: string[] }> = [];
  
  dataLines.forEach((line, index) => {
    const values = parseCSVLine(line);
    const rowData: any = {};
    
    headers.forEach((header, i) => {
      rowData[header] = values[i] || '';
    });
    
    const validation = validateImportedProperty(rowData, agentIds);
    
    if (validation.isValid) {
      validProperties.push({
        title: rowData.Title || rowData.title,
        description: rowData.Description || rowData.description,
        price: parseFloat(rowData.Price || rowData.price),
        location: rowData.Location || rowData.location,
        address: rowData.Address || rowData.address,
        bedrooms: parseInt(rowData.Bedrooms || rowData.bedrooms),
        bathrooms: parseFloat(rowData.Bathrooms || rowData.bathrooms),
        size: parseInt(rowData['Size (sq ft)'] || rowData.size),
        status: (rowData.Status || rowData.status) as any,
        featured: (rowData.Featured || rowData.featured || '').toLowerCase() === 'yes' || 
                 (rowData.Featured || rowData.featured || '').toLowerCase() === 'true',
        agentId: parseInt(rowData['Agent ID'] || rowData.agentId)
      });
    } else {
      invalidRows.push({
        row: index + 2, // +2 because we skip header and arrays are 0-indexed
        data: rowData,
        errors: validation.errors
      });
    }
  });
  
  return {
    success: validProperties.length > 0,
    validProperties,
    invalidRows,
    summary: {
      total: dataLines.length,
      valid: validProperties.length,
      invalid: invalidRows.length
    }
  };
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Validate imported property data
 */
const validateImportedProperty = (data: any, validAgentIds: Set<number>): ImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation
  if (!data.Title && !data.title) {
    errors.push('Title is required');
  }
  
  if (!data.Description && !data.description) {
    errors.push('Description is required');
  }
  
  if (!data.Location && !data.location) {
    errors.push('Location is required');
  }
  
  if (!data.Address && !data.address) {
    errors.push('Address is required');
  }
  
  // Price validation
  const price = parseFloat(data.Price || data.price);
  if (isNaN(price) || price <= 0) {
    errors.push('Price must be a valid positive number');
  }
  
  // Bedrooms validation
  const bedrooms = parseInt(data.Bedrooms || data.bedrooms);
  if (isNaN(bedrooms) || bedrooms < 0) {
    errors.push('Bedrooms must be a valid non-negative number');
  }
  
  // Bathrooms validation
  const bathrooms = parseFloat(data.Bathrooms || data.bathrooms);
  if (isNaN(bathrooms) || bathrooms < 0) {
    errors.push('Bathrooms must be a valid non-negative number');
  }
  
  // Size validation
  const size = parseInt(data['Size (sq ft)'] || data.size);
  if (isNaN(size) || size <= 0) {
    errors.push('Size must be a valid positive number');
  }
  
  // Status validation
  const status = data.Status || data.status;
  const validStatuses = ['For Sale', 'For Rent', 'Sold', 'Rented'];
  if (!validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Agent ID validation
  const agentId = parseInt(data['Agent ID'] || data.agentId);
  if (isNaN(agentId)) {
    errors.push('Agent ID must be a valid number');
  } else if (!validAgentIds.has(agentId)) {
    errors.push(`Agent ID ${agentId} does not exist`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generate CSV template for import
 */
export const generateImportTemplate = (agents: Agent[]): string => {
  const templateHeaders = [
    'Title',
    'Description',
    'Price',
    'Location',
    'Address',
    'Bedrooms',
    'Bathrooms',
    'Size (sq ft)',
    'Status',
    'Featured',
    'Agent ID'
  ];
  
  const sampleRow = [
    'Sample Property Title',
    'Beautiful property with modern amenities',
    '500000',
    'Nairobi',
    '123 Sample Street, Nairobi',
    '3',
    '2',
    '1200',
    'For Sale',
    'No',
    agents.length > 0 ? agents[0].id.toString() : '1'
  ];
  
  const csvRows = [
    templateHeaders.join(','),
    sampleRow.map(value => `"${value}"`).join(',')
  ];
  
  return csvRows.join('\n');
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
