/**
 * ImportDataDialog Component
 * 
 * Dialog for importing table data from Excel or CSV files.
 * Handles file upload, validation, and data importing.
 * Now shows a preview step before actual import.
 * 
 * @module ImportDataDialog
 * @version 1.1.2 - Fixed file upload functionality
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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Reset file input when import is completed
   */
  useEffect(() => {
    // Check if the import preview dialog has been closed and no import errors
    if (!state.showImportPreviewDialog && state.importPreviewData === null && state.importErrors.length === 0) {
      // Reset file only if there was a previous file and import completed successfully
      if (file) {
        setFile(null);
        setUploadError(null);
        // Reset the file input element
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [state.showImportPreviewDialog, state.importPreviewData, state.importErrors, file]);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setFile(null);
    setUploadError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false });
  };

  /**
   * Handle file selection
   * 
   * @param e - The file input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name, selectedFile.size);
      
      if (!isValidFileType(selectedFile.name)) {
        setUploadError('Invalid file type. Please use .xlsx, .xls, or .csv files.');
        return;
      }
      
      setFile(selectedFile);
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
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      console.log('File dropped:', droppedFile.name, droppedFile.size);
      
      if (!isValidFileType(droppedFile.name)) {
        setUploadError('Invalid file type. Please use .xlsx, .xls, or .csv files.');
        return;
      }
      
      setFile(droppedFile);
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
   * Process file and show preview
   */
  const handlePreview = async () => {
    if (!file) {
      setUploadError('Please select a file first.');
      return;
    }
    
    try {
      setIsLoading(true);
      setUploadError(null);
      dispatch({ type: 'SET_IMPORT_ERRORS', payload: [] });
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      console.log('Processing file:', file.name, 'with extension:', extension);
      
      if (extension === 'csv') {
        // Handle CSV preview
        console.log('Parsing CSV file');
        const data = await parseCSVFile(file);
        console.log('CSV data parsed successfully, rows:', data.length);
        
        const validationResult = validateCSVImport(data);
        console.log('CSV validation result:', validationResult.isValid);
        
        if (!validationResult.isValid) {
          dispatch({ type: 'SET_IMPORT_ERRORS', payload: validationResult.errors });
          setIsLoading(false);
          return;
        }
        
        // Show preview if valid
        if (validationResult.data && validationResult.columns) {
          console.log('Setting preview data with', validationResult.data.length, 'rows');
          dispatch({
            type: 'SET_IMPORT_PREVIEW_DATA',
            payload: {
              tasks: validationResult.data,
              columns: validationResult.columns,
              sourceFormat: 'csv'
            }
          });
        }
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        // Handle Excel preview
        console.log('Parsing Excel file');
        try {
          const { data, metadata } = await parseExcelFile(file);
          console.log('Excel data parsed successfully, rows:', data.length);
          
          const validationResult = validateExcelImport(data, metadata);
          console.log('Excel validation result:', validationResult.isValid);
          
          if (!validationResult.isValid) {
            dispatch({ type: 'SET_IMPORT_ERRORS', payload: validationResult.errors });
            setIsLoading(false);
            return;
          }
          
          // Show preview if valid
          if (validationResult.data && validationResult.columns) {
            console.log('Setting preview data with', validationResult.data.length, 'rows');
            dispatch({
              type: 'SET_IMPORT_PREVIEW_DATA',
              payload: {
                tasks: validationResult.data,
                columns: validationResult.columns,
                sourceFormat: 'excel'
              }
            });
          }
        } catch (parseError) {
          console.error('Error parsing Excel file:', parseError);
          setUploadError(`Error parsing Excel file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      } else {
        setUploadError('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
        dispatch({ 
          type: 'SET_IMPORT_ERRORS', 
          payload: ['Unsupported file format. Please use .xlsx, .xls, or .csv files.'] 
        });
      }
    } catch (error) {
      console.error('Import preview failed:', error);
      setUploadError(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      dispatch({ 
        type: 'SET_IMPORT_ERRORS', 
        payload: ['Failed to process file. Please check the file format and try again.'] 
      });
    } finally {
      setIsLoading(false);
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
                    setUploadError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
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
          
          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-center mb-1">
                <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                <h3 className="text-sm font-medium text-red-800">Upload Error:</h3>
              </div>
              <p className="text-xs text-red-700">{uploadError}</p>
            </div>
          )}
          
          {/* Import Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Import Guidelines:</h3>
            <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
              <li>Excel files (.xlsx, .xls) preserve column types</li>
              <li>CSV files will import all columns as text type</li>
              <li>First row must contain column headers</li>
              <li>Column headers should match your current table for best results</li>
              <li>You'll be able to preview data before confirming import</li>
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
            onClick={handlePreview}
            disabled={!file || isLoading}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md flex items-center
              ${!file || isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                Preview Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDataDialog; 