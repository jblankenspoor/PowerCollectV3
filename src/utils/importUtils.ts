/**
 * Import Utilities
 * 
 * Utility functions for importing table data from Excel and CSV formats
 * with validation and error handling.
 * 
 * @module importUtils
 * @version 1.0.1 - Enhanced error handling and debugging
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
        if (!data) {
          console.error('No data read from file');
          reject(new Error('No data could be read from the file'));
          return;
        }
        
        console.log('File read successfully, parsing workbook...');
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          console.error('Invalid Excel file structure');
          reject(new Error('Invalid Excel file structure'));
          return;
        }
        
        console.log('Workbook parsed, sheet names:', workbook.SheetNames);
        
        // Get first sheet (data)
        const firstSheetName = workbook.SheetNames[0];
        const dataWorksheet = workbook.Sheets[firstSheetName];
        
        if (!dataWorksheet) {
          console.error('No worksheet found');
          reject(new Error('No worksheet found in Excel file'));
          return;
        }
        
        // Try to convert to JSON
        try {
          const jsonData = XLSX.utils.sheet_to_json(dataWorksheet);
          console.log('Data sheet converted to JSON, rows:', jsonData.length);
          
          if (jsonData.length === 0) {
            console.warn('No data rows found in Excel file');
          }
          
          // Get second sheet (metadata) if it exists
          let metadata: any[] = [];
          if (workbook.SheetNames.length > 1 && workbook.SheetNames[1] === 'ColumnMetadata') {
            const metadataWorksheet = workbook.Sheets[workbook.SheetNames[1]];
            if (metadataWorksheet) {
              metadata = XLSX.utils.sheet_to_json(metadataWorksheet);
              console.log('Metadata sheet found and converted, items:', metadata.length);
            }
          }
          
          resolve({ data: jsonData, metadata });
        } catch (jsonError) {
          console.error('Error converting sheet to JSON:', jsonError);
          reject(new Error('Failed to convert Excel data to JSON format'));
        }
      } catch (error) {
        console.error('Failed to parse Excel file:', error);
        reject(new Error('Failed to parse Excel file format'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('Error reading file:', e);
      reject(new Error('Error reading file'));
    };
    
    console.log('Starting to read file as ArrayBuffer...');
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
        if (!data) {
          console.error('No data read from CSV file');
          reject(new Error('No data could be read from the CSV file'));
          return;
        }
        
        console.log('CSV file read successfully, parsing...');
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          console.error('Invalid CSV file structure');
          reject(new Error('Invalid CSV file structure'));
          return;
        }
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        if (!worksheet) {
          console.error('No worksheet found in CSV');
          reject(new Error('No data found in CSV file'));
          return;
        }
        
        try {
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('CSV converted to JSON, rows:', jsonData.length);
          
          if (jsonData.length === 0) {
            console.warn('No data rows found in CSV file');
          }
          
          resolve(jsonData);
        } catch (jsonError) {
          console.error('Error converting CSV to JSON:', jsonError);
          reject(new Error('Failed to convert CSV data to JSON format'));
        }
      } catch (error) {
        console.error('Failed to parse CSV file:', error);
        reject(new Error('Failed to parse CSV file format'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('Error reading CSV file:', e);
      reject(new Error('Error reading CSV file'));
    };
    
    console.log('Starting to read CSV file as ArrayBuffer...');
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