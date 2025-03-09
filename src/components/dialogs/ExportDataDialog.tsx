/**
 * ExportDataDialog Component
 * 
 * Dialog for exporting table data to Excel or CSV formats.
 * Allows users to choose the export format and provides information about limitations.
 * 
 * @module ExportDataDialog
 */

import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';

/**
 * ExportDataDialog Component - Allows users to export table data
 * 
 * @returns JSX Element
 */
const ExportDataDialog: React.FC = () => {
  const { state, dispatch } = useTableContext();
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [fileName, setFileName] = useState('table_data');
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    dispatch({ type: 'TOGGLE_EXPORT_DIALOG', payload: false });
  };

  /**
   * Handle export format change
   * 
   * @param format - The selected export format
   */
  const handleFormatChange = (format: 'excel' | 'csv') => {
    setExportFormat(format);
  };

  /**
   * Handle file name change
   * 
   * @param e - The input change event
   */
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      if (exportFormat === 'excel') {
        await exportToExcel(state.tasks, state.columns, `${fileName}.xlsx`);
      } else {
        await exportToCSV(state.tasks, state.columns, `${fileName}.csv`);
      }
      
      // Close dialog after successful export
      handleClose();
    } catch (error) {
      console.error('Export failed:', error);
      // Could add error notification here
    } finally {
      setIsExporting(false);
    }
  };

  if (!state.showExportDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Export Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={handleFileNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter file name"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <RadioGroup value={exportFormat} onChange={handleFormatChange} className="mt-2">
              <div className="space-y-3">
                <RadioGroup.Option
                  value="excel"
                  className={({ checked }) => `
                    ${checked ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}
                    relative border rounded-lg px-4 py-3 cursor-pointer flex focus:outline-none
                  `}
                >
                  {({ checked }) => (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <RadioGroup.Label as="p" className="font-medium text-gray-900">
                              Excel (.xlsx)
                            </RadioGroup.Label>
                            <RadioGroup.Description as="span" className="text-gray-500 text-xs">
                              Exports data with column types preserved
                            </RadioGroup.Description>
                          </div>
                        </div>
                        <div className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} w-4 h-4 rounded-full flex items-center justify-center`}>
                          {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
                
                <RadioGroup.Option
                  value="csv"
                  className={({ checked }) => `
                    ${checked ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}
                    relative border rounded-lg px-4 py-3 cursor-pointer flex focus:outline-none
                  `}
                >
                  {({ checked }) => (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <RadioGroup.Label as="p" className="font-medium text-gray-900">
                              CSV (.csv)
                            </RadioGroup.Label>
                            <RadioGroup.Description as="span" className="text-gray-500 text-xs">
                              Simple format, but column types are not preserved
                            </RadioGroup.Description>
                          </div>
                        </div>
                        <div className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} w-4 h-4 rounded-full flex items-center justify-center`}>
                          {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              </div>
            </RadioGroup>
          </div>
          
          {exportFormat === 'csv' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700 text-sm">
                <strong>Note:</strong> CSV format does not support column type information. 
                When reimporting, all columns will be treated as text.
              </p>
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
            onClick={handleExport}
            disabled={isExporting}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md flex items-center
              ${isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataDialog; 