/**
 * Import Utilities
 * 
 * Utility functions for importing table data from Excel and CSV formats
 * with validation and error handling.
 * 
 * @module importUtils
 */

import * as XLSX from 'xlsx';
import { Column, Task, ColumnType } from '../types/dataTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for validation results
 * @interface ValidationResult
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Task[];
  columns?: Column[];
}

/**
 * Parse Excel file and extract both data and column metadata
 * 
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{data: any[], columns: any[]}>} - Extracted data and column metadata
 */
export const parseExcelFile = async (file: File): Promise<{data: any[], metadata: any[]}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet (data)
        const firstSheetName = workbook.SheetNames[0];
        const dataWorksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(dataWorksheet);
        
        // Get second sheet (metadata) if it exists
        let metadata: any[] = [];
        if (workbook.SheetNames.length > 1 && workbook.SheetNames[1] === 'ColumnMetadata') {
          const metadataWorksheet = workbook.Sheets[workbook.SheetNames[1]];
          metadata = XLSX.utils.sheet_to_json(metadataWorksheet);
        }
        
        resolve({ data: jsonData, metadata });
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse CSV file and extract data
 * 
 * @param {File} file - The CSV file to parse
 * @returns {Promise<any[]>} - Extracted data
 */
export const parseCSVFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate if a value is a valid column type
 * 
 * @param {string} type - The type to validate
 * @returns {boolean} - Whether the type is valid
 */
const isValidColumnType = (type: string): boolean => {
  const validTypes: ColumnType[] = ['select', 'text', 'status', 'priority', 'date', 'custom'];
  return validTypes.includes(type as ColumnType);
};

/**
 * Generate columns from data headers when no metadata is available
 * 
 * @param {any[]} data - The imported data
 * @returns {Column[]} - Generated columns
 */
const generateColumnsFromData = (data: any[]): Column[] => {
  if (data.length === 0) return [];
  
  // Get keys from first data item
  const keys = Object.keys(data[0]);
  
  // Create default columns with consistent width settings
  return keys.map(key => ({
    id: key.toLowerCase().replace(/\s+/g, '_'),
    title: key,
    type: 'text' as ColumnType,
    width: 'w-40',
    minWidth: 'min-w-[160px]' // Adding minWidth for consistent alignment
  }));
};

/**
 * Convert raw imported data to expected task format
 * 
 * @param {any[]} data - Raw data from import
 * @param {Column[]} columns - Column definitions
 * @returns {Task[]} - Converted tasks
 */
const convertToTasks = (data: any[], columns: Column[]): Task[] => {
  return data.map(item => {
    // Create base task with default values
    const task: Task = {
      id: uuidv4(),
      name: '',
      status: 'To do',
      priority: 'Medium',
      startDate: '',
      deadline: ''
    };
    
    // Map data fields to the right column ids
    columns.forEach(column => {
      const originalTitle = column.title;
      const originalValue = item[originalTitle];
      
      if (originalValue !== undefined) {
        task[column.id] = originalValue.toString();
      }
    });
    
    return task;
  });
};

/**
 * Validate imported Excel data with column metadata
 * 
 * @param {any[]} data - The data to validate
 * @param {any[]} metadata - Column metadata
 * @returns {ValidationResult} - Validation result
 */
export const validateExcelImport = (data: any[], metadata: any[]): ValidationResult => {
  const errors: string[] = [];
  
  // Basic validation
  if (!data || data.length === 0) {
    errors.push('No data found in the Excel file');
    return { isValid: false, errors };
  }
  
  // Validate metadata if present
  let columns: Column[] = [];
  if (metadata && metadata.length > 0) {
    // Check metadata structure
    const hasRequiredFields = metadata.every(
      col => col.ColumnId !== undefined && col.Title !== undefined && col.Type !== undefined
    );
    
    if (!hasRequiredFields) {
      errors.push('Column metadata is missing required fields (ColumnId, Title, or Type)');
    }
    
    // Check column types
    const invalidTypes = metadata
      .filter(col => !isValidColumnType(col.Type))
      .map(col => col.Title);
    
    if (invalidTypes.length > 0) {
      errors.push(`Invalid column types found: ${invalidTypes.join(', ')}`);
    }
    
    // Create columns from metadata
    columns = metadata
      .filter(col => isValidColumnType(col.Type))
      .map(col => ({
        id: col.ColumnId,
        title: col.Title,
        type: col.Type as ColumnType,
        width: 'w-40',
        minWidth: 'min-w-[160px]' // Adding consistent minWidth
      }));
  } else {
    // No metadata - generate columns from data
    columns = generateColumnsFromData(data);
  }
  
  // Convert data to tasks
  const tasks = convertToTasks(data, columns);
  
  return {
    isValid: errors.length === 0,
    errors,
    data: tasks,
    columns
  };
};

/**
 * Validate imported CSV data
 * 
 * @param {any[]} data - The data to validate 
 * @returns {ValidationResult} - Validation result
 */
export const validateCSVImport = (data: any[]): ValidationResult => {
  const errors: string[] = [];
  
  // Basic validation
  if (!data || data.length === 0) {
    errors.push('No data found in the CSV file');
    return { isValid: false, errors };
  }
  
  // Generate columns from data
  const columns = generateColumnsFromData(data);
  
  // Convert data to tasks
  const tasks = convertToTasks(data, columns);
  
  return {
    isValid: errors.length === 0,
    errors,
    data: tasks,
    columns
  };
}; 