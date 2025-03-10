/**
 * App Component
 * 
 * Main application component that renders the DataTable with proper context
 * 
 * @module App
 * @version 3.3.0 - Added Claude API integration for PowerFX code generation
 */

import React from 'react';
import { TableProvider, useTableContext } from './context/TableContext';
import DataTable from './components/table/DataTable';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { 
  ImportDataDialog, 
  ExportDataDialog, 
  ImportPreviewDialog,
  PowerFXCodeDialog,
  PowerFXImportDialog
} from './components/dialogs';
import { CodeBracketIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { convertTableToPowerFX } from './utils/claudeApiClient';

/**
 * AppContent component that contains the main UI elements
 * Separated from App to enable useContext
 * 
 * @returns JSX Element
 */
const AppContent: React.FC = () => {
  const { state, dispatch } = useTableContext();

  /**
   * Generate Power FX code from the current table data
   */
  const handleGeneratePowerFX = async () => {
    // Set generating state to true
    dispatch({ type: 'SET_GENERATING_POWERFX', payload: true });
    
    // Show PowerFX dialog
    dispatch({ type: 'TOGGLE_POWERFX_DIALOG', payload: true });
    
    try {
      // Convert the table data to Power FX code
      const powerFXCode = await convertTableToPowerFX(
        Array.from(state.tasks),
        state.columns
      );
      
      // Set the generated PowerFX code
      dispatch({ type: 'SET_POWERFX_CODE', payload: powerFXCode });
    } catch (error) {
      console.error('Error generating Power FX code:', error);
      // Set empty code with error message
      dispatch({ 
        type: 'SET_POWERFX_CODE', 
        payload: '// Error generating Power FX code. Please try again.' 
      });
    }
  };

  /**
   * Open the PowerFX Import dialog
   */
  const handleOpenPowerFXImport = () => {
    dispatch({ type: 'TOGGLE_POWERFX_IMPORT_DIALOG', payload: true });
  };

  /**
   * Handle import preview cancel
   */
  const handleImportCancel = () => {
    dispatch({ type: 'TOGGLE_IMPORT_PREVIEW_DIALOG', payload: false });
  };

  /**
   * Handle import preview confirm
   */
  const handleImportConfirm = () => {
    if (state.importPreviewData) {
      dispatch({
        type: 'IMPORT_DATA',
        payload: state.importPreviewData
      });
    }
    dispatch({ type: 'TOGGLE_IMPORT_PREVIEW_DIALOG', payload: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 relative">
      {/* Full width container with no constraints */}
      <div className="w-full px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">PowerCollectV3</h1>
          <p className="text-xl text-gray-700">
            Build tables visually and generate Power FX code for Power Apps collections
          </p>
        </div>
        
        {/* DataTable with full width and overflow visible for trash cans */}
        <div className="w-full overflow-visible relative">
          <DataTable />
        </div>
        
        {/* PowerFX action buttons */}
        <div className="mt-6 flex space-x-4">
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center"
            onClick={handleGeneratePowerFX}
            aria-label="Generate Power FX code"
          >
            <CodeBracketIcon className="w-5 h-5 mr-2" />
            Generate Power FX
          </button>
          
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 font-medium flex items-center"
            onClick={handleOpenPowerFXImport}
            aria-label="Import Power FX code"
          >
            <ArrowUpOnSquareIcon className="w-5 h-5 mr-2" />
            Import From Power FX
          </button>
        </div>
      </div>
      
      {/* Dialogs */}
      {state.showImportDialog && <ImportDataDialog />}
      {state.showExportDialog && <ExportDataDialog />}
      {state.showImportPreviewDialog && (
        <ImportPreviewDialog 
          isOpen={state.showImportPreviewDialog}
          onClose={handleImportCancel}
          onConfirm={handleImportConfirm}
          previewData={state.importPreviewData || { tasks: [], columns: [] }}
          sourceType={state.importPreviewSourceType || 'excel'}
          fileName={state.importPreviewFileName}
        />
      )}
      {state.showPowerFXDialog && <PowerFXCodeDialog />}
      {state.showPowerFXImportDialog && <PowerFXImportDialog />}
      
      {/* Version number in the bottom left corner */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">
        v3.3.0
      </div>
    </div>
  );
};

/**
 * App component that provides context and renders the main UI
 * @returns JSX Element
 */
function App() {
  return (
    <TableProvider>
      <AppContent />
      <SpeedInsights />
    </TableProvider>
  );
}

export default App;
