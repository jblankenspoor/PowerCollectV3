/**
 * Utility functions for table operations
 * 
 * @module tableUtils
 * @version 1.1.0 - Added text width measurement functionality
 */

/**
 * Parse clipboard text data into a 2D array
 * Handles Excel, CSV, and regular text formats
 * 
 * @param clipboardText - Text from clipboard
 * @returns 2D array of string values
 */
export const parseClipboardData = (clipboardText: string): string[][] => {
  try {
    if (!clipboardText) return [[]];
    
    // Split by newline to get rows
    const rows = clipboardText.split(/\r?\n/).filter(row => row.trim() !== '');
    
    // Detect delimiter (tab for Excel, comma for CSV, or fallback to space)
    let delimiter = '\t';
    if (rows[0] && !rows[0].includes('\t') && rows[0].includes(',')) {
      delimiter = ',';
    }
    
    // Parse rows into 2D array
    return rows.map(row => {
      if (delimiter === ',') {
        // Handle CSV with quoted values containing commas
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        result.push(currentValue.trim());
        return result;
      } else {
        // Simple split for tab or space delimited data
        return row.split(delimiter);
      }
    });
  } catch (error) {
    console.error('Error parsing clipboard data:', error);
    return [[]]; // Return empty data on error
  }
};

/**
 * Calculate pixel width from a minWidth CSS class
 * 
 * @param minWidthClass - CSS class string like "min-w-[160px]"
 * @returns Pixel width value (number) or 0 if not found
 */
export const getPixelWidthFromClass = (minWidthClass?: string): number => {
  if (!minWidthClass) return 0;
  
  const widthMatch = minWidthClass.match(/min-w-\[(\d+)px\]/);
  return widthMatch ? parseInt(widthMatch[1], 10) : 0;
};

/**
 * Get pixel width as CSS string from a minWidth CSS class
 * 
 * @param minWidthClass - CSS class string like "min-w-[160px]"
 * @returns Pixel width as CSS value (e.g. "160px") or "auto" if not found
 */
export const getPixelWidthStringFromClass = (minWidthClass?: string): string => {
  if (!minWidthClass) return 'auto';
  
  const widthMatch = minWidthClass.match(/min-w-\[(\d+)px\]/);
  return widthMatch ? `${widthMatch[1]}px` : 'auto';
};

/**
 * Get appropriate style classes for a status value
 * 
 * @param status - Status value
 * @returns CSS class for styling
 */
export const getStatusColorClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'To do': 'bg-red-100 text-red-800',
    'In progress': 'bg-yellow-100 text-yellow-800',
    'Done': 'bg-green-100 text-green-800'
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get appropriate style classes for a priority value
 * 
 * @param priority - Priority value
 * @returns CSS class for styling
 */
export const getPriorityColorClass = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
  };
  
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

/**
 * Safely validate and format date string
 * 
 * @param dateString - Input date string
 * @returns Valid date string or empty string
 */
export const formatDateSafely = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Check for invalid date
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Calculate the width needed for text in pixels
 * This uses a canvas to measure text width based on font properties
 * 
 * @param text - Text to measure
 * @param fontStyle - CSS font style (default is "normal 14px sans-serif")
 * @returns Width in pixels
 */
export const measureTextWidth = (text: string, fontStyle: string = "bold 14px sans-serif"): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return text.length * 8; // Fallback if canvas not supported
  
  context.font = fontStyle;
  const metrics = context.measureText(text);
  
  // Add padding for some space on both sides
  return Math.ceil(metrics.width) + 32; // 16px padding on each side
};

/**
 * Convert pixel width to Tailwind min-width class
 * 
 * @param pixelWidth - Width in pixels
 * @returns Tailwind class string
 */
export const pixelWidthToMinWidthClass = (pixelWidth: number): string => {
  return `min-w-[${pixelWidth}px]`;
};

/**
 * Convert pixel width to Tailwind width class
 * 
 * @param pixelWidth - Width in pixels
 * @returns Tailwind class string
 */
export const pixelWidthToWidthClass = (pixelWidth: number): string => {
  // Standard Tailwind width increments
  const widthIncrements = [32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
  
  // Find the closest increment that's at least as large as our needed width
  let suitableWidth = widthIncrements.find(w => w >= pixelWidth / 4);
  
  // Default to largest if no suitable width found
  if (!suitableWidth) suitableWidth = widthIncrements[widthIncrements.length - 1];
  
  return `w-${suitableWidth}`; 
}; 