/**
 * App Component
 * 
 * Main application component that renders the DataTable with proper context
 * 
 * @module App
 * @version 7.3.3 - Minor version update with Claude API authentication fix for Claude 3.5 Haiku
 */

import { TableProvider } from './context/TableContext';
import DataTable from './components/table/DataTable';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useState } from 'react';
import { PowerFXGenerateDialog, PowerFXImportDialog } from './components/dialogs';
import VersionDisplay from './components/common/VersionDisplay';

// Import package.json for version
import packageJson from '../package.json';

/**
 * App component that provides context and renders the main UI
 * @returns JSX Element
 */
function App() {
  // State for dialog visibility
  const [showGenerateDialog, setShowGenerateDialog] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  
  return (
    <TableProvider>
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
          
          <div className="mt-6 flex space-x-4">
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
              aria-label="Generate Power FX code"
              onClick={() => setShowGenerateDialog(true)}
            >
              Generate Power Apps Collection
            </button>
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 font-medium"
              aria-label="Import Power FX code"
              onClick={() => setShowImportDialog(true)}
            >
              Import Power Apps Collection
            </button>
          </div>
        </div>
        
        {/* Version display component */}
        <VersionDisplay version={packageJson.version} />
      </div>
      
      {/* PowerFX Dialogs */}
      <PowerFXGenerateDialog 
        isOpen={showGenerateDialog} 
        onClose={() => setShowGenerateDialog(false)} 
      />
      <PowerFXImportDialog 
        isOpen={showImportDialog} 
        onClose={() => setShowImportDialog(false)} 
      />
      
      <SpeedInsights />
    </TableProvider>
  );
}

export default App;
