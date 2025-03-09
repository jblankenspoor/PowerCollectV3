/**
 * App Component
 * 
 * Main application component that renders the DataTable with proper context
 * 
 * @module App
 * @version 3.2.12 - Fixed Select column preservation and duplicate notifications
 */

import { TableProvider } from './context/TableContext';
import DataTable from './components/table/DataTable';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * App component that provides context and renders the main UI
 * @returns JSX Element
 */
function App() {
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
          
          <div className="mt-6">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 font-medium"
              aria-label="Generate Power FX code"
            >
              Generate Power FX
            </button>
          </div>
        </div>
        
        {/* Version number in the bottom left corner */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          v3.2.12
        </div>
      </div>
      <SpeedInsights />
    </TableProvider>
  );
}

export default App;
