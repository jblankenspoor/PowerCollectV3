/**
 * Export Utilities
 * 
 * Utility functions for exporting table data to Excel and CSV formats.
 * 
 * @module exportUtils
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Column, Task } from '../types/dataTypes';

/**
 * Export data to Excel format with column type information
 * 
 * @param {Task[]} data - Array of tasks/data to export
 * @param {Column[]} columns - Column definitions including types
 * @param {string} [filename='exported_data.xlsx'] - Optional filename for the exported file
 * @returns {void}
 */
export const exportToExcel = (
  data: Task[], 
  columns: Column[], 
  filename: string = 'exported_data.xlsx'
): void => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Transform data to format compatible with XLSX
    const processedData = data.map(task => {
      const row: { [key: string]: any } = {};
      
      // Process each column for the current task
      columns.forEach(column => {
        row[column.title] = task[column.id];
      });
      
      return row;
    });
    
    // Create main data worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Create a separate sheet for column metadata
    const metadataSheet = XLSX.utils.json_to_sheet(
      columns.map(column => ({
        ColumnId: column.id,
        Title: column.title,
        Type: column.type
      }))
    );
    XLSX.utils.book_append_sheet(wb, metadataSheet, 'ColumnMetadata');
    
    // Generate and save the file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

/**
 * Export data to CSV format (without column type information)
 * 
 * @param {Task[]} data - Array of tasks/data to export
 * @param {Column[]} columns - Column definitions used for headers
 * @param {string} [filename='exported_data.csv'] - Optional filename for the exported file
 * @returns {void}
 */
export const exportToCSV = (
  data: Task[], 
  columns: Column[], 
  filename: string = 'exported_data.csv'
): void => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Transform data to format compatible with XLSX
    const processedData = data.map(task => {
      const row: { [key: string]: any } = {};
      
      // Process each column for the current task
      columns.forEach(column => {
        row[column.title] = task[column.id];
      });
      
      return row;
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Generate CSV data
    const csvOutput = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Failed to export to CSV:', error);
    throw new Error('Failed to export to CSV');
  }
}; 