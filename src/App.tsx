import DataTable from './components/DataTable';

function App() {
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
        
        <div className="mt-6">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 font-medium"
          >
            Generate Power FX
          </button>
        </div>
      </div>
      
      {/* Version number in the bottom left corner */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">
        v2.0.5
      </div>
    </div>
  );
}

export default App;
