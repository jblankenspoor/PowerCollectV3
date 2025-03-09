/**
 * ImportPreviewDialog Component
 * 
 * Dialog for previewing table data before confirming import.
 * Shows a sample of the data and allows confirming or canceling the import.
 * 
 * @module ImportPreviewDialog
 * @version 1.0.5 - Fixed unused import causing build errors
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Column, Task } from '../../types/dataTypes';

/**
 * ImportPreviewDialog Props
 * @interface ImportPreviewDialogProps
 */
interface ImportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewData: {
    tasks: Task[];
    columns: Column[];
  };
  sourceType: 'excel' | 'csv';
  fileName: string;
}

/**
 * ImportPreviewDialog Component - Allows users to preview data before importing
 * 
 * @param {ImportPreviewDialogProps} props - Component props
 * @returns JSX Element
 */
const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  previewData,
  sourceType,
  fileName
}) => {
  // State to manage visibility for animation
  const [isVisible, setIsVisible] = useState(false);
  
  // Update visibility based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      // When opening, make element visible first
      setIsVisible(true);
    } else {
      // When closing, wait for animation before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with your transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // If dialog should not be rendered
  if (!isOpen && !isVisible) return null;

  // Limit preview data to a reasonable amount
  const MAX_PREVIEW_ROWS = 5;
  const previewTasks = previewData.tasks.slice(0, MAX_PREVIEW_ROWS);
  const totalRows = previewData.tasks.length;
  
  /**
   * Get background color based on column type
   * 
   * @param type - Column type
   * @returns Tailwind CSS class for background color
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'status': return 'bg-green-100 text-green-800';
      case 'priority': return 'bg-purple-100 text-purple-800';
      case 'date': return 'bg-orange-100 text-orange-800';
      case 'select': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Import Preview
            </h2>
            <p className="text-sm text-gray-500">
              {sourceType === 'excel' ? 'Excel' : 'CSV'} file: {fileName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Data Preview ({totalRows} row{totalRows !== 1 ? 's' : ''} total)
              {totalRows > MAX_PREVIEW_ROWS && ` - showing first ${MAX_PREVIEW_ROWS}`}
            </h3>
            
            {/* Data preview with aligned column types and headers */}
            <div className="border rounded-md overflow-hidden">
              {/* Column types section */}
              <div className="bg-gray-50 border-b">
                <div className="px-4 pt-3 pb-2">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Column Types:</h4>
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${previewData.columns.length}, minmax(120px, 1fr))` }}>
                    {previewData.columns.map((column) => (
                      <div key={`type-${column.id}`} className="px-4">
                        <span 
                          className={`px-2 py-1 rounded-md text-xs font-medium inline-block transition-colors duration-200 ${getTypeColor(column.type)}`}
                        >
                          {column.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Table Container */}
              <div className="overflow-x-auto max-h-[300px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {previewData.columns.map((column) => (
                        <th
                          key={column.id}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] min-w-[120px]"
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewTasks.length > 0 ? (
                      previewTasks.map((task, index) => (
                        <tr 
                          key={task.id} 
                          className="hover:bg-gray-50 transition-colors duration-150"
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeIn 0.3s ease-in-out forwards'
                          }}
                        >
                          {previewData.columns.map((column) => (
                            <td 
                              key={`${task.id}-${column.id}`} 
                              className="px-4 py-3 text-sm text-gray-500 truncate"
                            >
                              {task[column.id] || ''}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan={previewData.columns.length} 
                          className="px-4 py-3 text-sm text-gray-500 text-center"
                        >
                          No data to preview
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Warning section */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 transition-all duration-300 hover:bg-amber-100">
            <div className="flex items-start">
              <XCircleIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Important:</h3>
                <p className="text-sm text-amber-700">
                  Importing this data will replace your current table's content. This action cannot be undone.
                  {sourceType === 'csv' && ' CSV imports will set all columns to text type by default.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 rounded-md mr-2 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center transition-colors duration-200"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Confirm Import
          </button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ImportPreviewDialog; 