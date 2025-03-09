/**
 * ImportPreviewDialog Component
 * 
 * Dialog for previewing data before importing it into the table.
 * Shows a sample of rows and columns with the option to confirm or cancel.
 * 
 * @module ImportPreviewDialog
 */

import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { Column, Task } from '../../types/dataTypes';

/**
 * Props for the ImportPreviewDialog component
 * 
 * @interface ImportPreviewDialogProps
 */
interface ImportPreviewDialogProps {
  isOpen: boolean;
  previewData: {
    tasks: Task[];
    columns: Column[];
    sourceFormat: 'excel' | 'csv';
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ImportPreviewDialog Component - Displays a preview of data to be imported
 * 
 * @param {ImportPreviewDialogProps} props - Component props
 * @returns JSX Element
 */
const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({ 
  isOpen, 
  previewData, 
  onConfirm, 
  onCancel 
}) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  if (!isOpen || !previewData) return null;

  const { tasks, columns, sourceFormat } = previewData;
  
  /**
   * Calculate total pages for pagination
   */
  const totalPages = Math.ceil(tasks.length / rowsPerPage);
  
  /**
   * Get current page of data
   */
  const paginatedTasks = tasks.slice(
    page * rowsPerPage, 
    (page + 1) * rowsPerPage
  );

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  /**
   * Determine if a column should be displayed in the preview
   * Limits the number of columns to keep the UI manageable
   */
  const getDisplayColumns = () => {
    // Always show first column (usually name/title)
    // Then add a sensible number of other columns
    const maxPreviewColumns = 5;
    return columns.slice(0, maxPreviewColumns);
  };

  const displayColumns = getDisplayColumns();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Import Preview</h2>
            <p className="text-sm text-gray-500">
              Review the data before importing ({tasks.length} rows, {columns.length} columns)
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Source format notice */}
          <div className={`mb-4 p-3 rounded-md ${sourceFormat === 'csv' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${sourceFormat === 'csv' ? 'text-amber-700' : 'text-blue-700'}`}>
              <span className="font-medium">Source:</span> {sourceFormat === 'csv' ? 'CSV file (column types defaulted to text)' : 'Excel file with column type information'}
            </p>
          </div>
          
          {/* Preview table */}
          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {displayColumns.map(column => (
                      <th
                        key={column.id}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.title}</span>
                          <span className="text-xs text-gray-400 font-normal">({column.type})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTasks.map((task, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {displayColumns.map(column => (
                        <td key={column.id} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {task[column.id] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty state for no data */}
            {tasks.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-gray-500 text-sm">No data to preview</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <div className="text-sm text-gray-500">
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, tasks.length)} of {tasks.length} rows
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className={`px-2 py-1 text-sm rounded ${page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={`px-2 py-1 text-sm rounded ${page >= totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Warning about column limitations */}
          {columns.length > displayColumns.length && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Only showing {displayColumns.length} of {columns.length} columns in the preview.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 rounded-md flex items-center"
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Cancel Import
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewDialog; 