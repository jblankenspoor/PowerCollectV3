/**
 * ImportDataDialog Component
 * 
 * Dialog for importing table data from Excel or CSV files.
 * Handles file upload, validation, and data previewing.
 * 
 * @module ImportDataDialog
 * @version 1.1.2 - Fixed build error with unused variable
 */

import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { parseExcelFile, parseCSVFile, validateExcelImport, validateCSVImport } from '../../utils/importUtils';

/**
 * ImportDataDialog Component - Allows users to import table data
 * 
 * @returns JSX Element
 */
const ImportDataDialog: React.FC = () => {
  const { state, dispatch } = useTableContext();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Reset the file input when dialog is closed
   */
  useEffect(() => {
    if (!state.showImportDialog) {
      // Reset the file input when the dialog is closed
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state.showImportDialog]);
  
  /**
   * Reset the file input when import preview is shown
   */
  useEffect(() => {
    if (state.showImportPreviewDialog) {
      // Reset the file input when the preview dialog is shown
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state.showImportPreviewDialog]);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false });
    // File will be reset by the useEffect
  };

  /**
   * Handle file selection
   * 
   * @param e - The file input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      dispatch({ type: 'SET_IMPORT_ERRORS', payload: [] });
    }
  };

  /**
   * Handle file drop
   * 
   * @param e - The drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      dispatch({ type: 'SET_IMPORT_ERRORS', payload: [] });
    }
  };

  /**
   * Handle drag events
   * 
   * @param e - The drag event
   * @param isDraggingState - Whether dragging is starting or ending
   */
  const handleDrag = (e: React.DragEvent<HTMLDivElement>, isDraggingState: boolean) => {
    e.preventDefault();
    setIsDragging(isDraggingState);
  };

  /**
   * Determine if file type is valid
   * 
   * @param fileName - The file name to check
   * @returns Whether the file type is valid
   */
  const isValidFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['xlsx', 'xls', 'csv'].includes(extension || '');
  };

  /**
   * Handle validation button click
   * This will now open a preview dialog instead of importing directly
   */
  const handleValidate = async () => {
    if (!file) return;
    
    try {
      setIsValidating(true);
      dispatch({ type: 'SET_IMPORT_ERRORS', payload: [] });
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        // Handle CSV validation
        const data = await parseCSVFile(file);
        const validationResult = validateCSVImport(data);
        
        if (!validationResult.isValid) {
          dispatch({ type: 'SET_IMPORT_ERRORS', payload: validationResult.errors });
          return;
        }
        
        // Show preview if valid
        if (validationResult.data && validationResult.columns) {
          dispatch({
            type: 'SET_IMPORT_PREVIEW_DATA',
            payload: {
              tasks: validationResult.data,
              columns: validationResult.columns,
              sourceType: 'csv',
              fileName: file.name
            }
          });
        }
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        // Handle Excel validation
        const { data, metadata } = await parseExcelFile(file);
        const validationResult = validateExcelImport(data, metadata);
        
        if (!validationResult.isValid) {
          dispatch({ type: 'SET_IMPORT_ERRORS', payload: validationResult.errors });
          return;
        }
        
        // Show preview if valid
        if (validationResult.data && validationResult.columns) {
          dispatch({
            type: 'SET_IMPORT_PREVIEW_DATA',
            payload: {
              tasks: validationResult.data,
              columns: validationResult.columns,
              sourceType: 'excel',
              fileName: file.name
            }
          });
        }
      } else {
        dispatch({ 
          type: 'SET_IMPORT_ERRORS', 
          payload: ['Unsupported file format. Please use .xlsx, .xls, or .csv files.'] 
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      dispatch({ 
        type: 'SET_IMPORT_ERRORS', 
        payload: ['Failed to validate file. Please check the file format and try again.'] 
      });
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Trigger file input click
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!state.showImportDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Import Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div 
            className={`
              border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              ${file ? 'bg-gray-50' : ''}
              transition-colors duration-200
            `}
            onClick={triggerFileInput}
            onDrop={handleDrop}
            onDragOver={(e) => handleDrag(e, true)}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx,.xls,.csv"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <DocumentIcon className="h-10 w-10 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button 
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Choose another file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your file here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            )}
          </div>
          
          {/* Import Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Import Process:</h3>
            <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
              <li>First, select your file to validate its structure</li>
              <li>Review the data preview before confirming</li>
              <li>Excel files (.xlsx, .xls) preserve column types</li>
              <li>CSV files will import all columns as text type</li>
            </ul>
          </div>
          
          {/* Validation Errors */}
          {state.importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-center mb-1">
                <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                <h3 className="text-sm font-medium text-red-800">Validation errors:</h3>
              </div>
              <ul className="text-xs text-red-700 list-disc pl-5 space-y-1">
                {state.importErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleValidate}
            disabled={!file || isValidating || !isValidFileType(file?.name || '')}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md flex items-center
              ${!file || isValidating || !isValidFileType(file?.name || '') ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                Validate & Preview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDataDialog; 