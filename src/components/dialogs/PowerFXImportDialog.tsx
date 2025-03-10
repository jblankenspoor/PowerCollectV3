/**
 * PowerFXImportDialog Component
 * 
 * Dialog for importing Power FX code and converting it to table data.
 * 
 * @module PowerFXImportDialog
 * @version 0.1.3 - Fixed TypeScript error with unused state variable
 */

import React, { useState } from 'react';
import { XMarkIcon, ArrowPathIcon, CodeBracketIcon, ExclamationCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { convertPowerFXToTable } from '../../utils/claudeApiClient';

/**
 * PowerFXImportDialog Component - Allows users to import Power FX code
 * 
 * @returns JSX Element
 */
const PowerFXImportDialog: React.FC = () => {
  const { dispatch } = useTableContext();
  const [powerFXCode, setPowerFXCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClaudeApiKeyError, setIsClaudeApiKeyError] = useState(false);
  const [isSupabaseApiKeyError, setIsSupabaseApiKeyError] = useState(false);

  /**
   * Check if any API key error is present
   */
  const isApiKeyError = isClaudeApiKeyError || isSupabaseApiKeyError;

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    dispatch({ type: 'TOGGLE_POWERFX_IMPORT_DIALOG', payload: false });
    setPowerFXCode('');
    setError(null);
    setIsClaudeApiKeyError(false);
    setIsSupabaseApiKeyError(false);
  };

  /**
   * Handle text area change
   * 
   * @param e - Text area change event
   */
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPowerFXCode(e.target.value);
    setError(null);
    setIsClaudeApiKeyError(false);
    setIsSupabaseApiKeyError(false);
  };

  /**
   * Handle code import
   */
  const handleImport = async () => {
    if (!powerFXCode.trim()) {
      setError('Please enter Power FX code to import');
      return;
    }

    setIsConverting(true);
    setError(null);
    setIsClaudeApiKeyError(false);
    setIsSupabaseApiKeyError(false);

    try {
      const { tasks, columns } = await convertPowerFXToTable(powerFXCode);
      
      // Set preview data for confirmation
      dispatch({
        type: 'SET_IMPORT_PREVIEW_DATA',
        payload: {
          tasks,
          columns,
          sourceType: 'excel', // Using excel as the source type
          fileName: 'PowerFX Import',
        },
      });

      // Show import preview dialog
      dispatch({ type: 'TOGGLE_IMPORT_PREVIEW_DIALOG', payload: true });
      
      // Close this dialog
      dispatch({ type: 'TOGGLE_POWERFX_IMPORT_DIALOG', payload: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Claude API key')) {
        setIsClaudeApiKeyError(true);
      } else if (errorMessage.includes('Supabase API key')) {
        setIsSupabaseApiKeyError(true);
      } else {
        setError(`Error converting Power FX code: ${errorMessage}`);
      }
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <CodeBracketIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Import Power FX Code
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isClaudeApiKeyError ? (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <KeyIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-800 font-medium text-lg mb-1">Claude API Key Required</h3>
                  <p className="text-yellow-700 mb-3">
                    To use the Claude AI integration for importing Power FX code, you need to set your API key.
                  </p>
                  <p className="text-yellow-600 text-sm">
                    Please add your Claude API key to the <code className="bg-yellow-100 px-1 rounded">.env</code> file:
                    <br />
                    <code className="bg-yellow-100 px-1 rounded">VITE_CLAUDE_API_KEY=your_claude_api_key_here</code>
                  </p>
                </div>
              </div>
            </div>
          ) : isSupabaseApiKeyError ? (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <KeyIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-800 font-medium text-lg mb-1">Supabase API Key Required</h3>
                  <p className="text-yellow-700 mb-3">
                    To use the Supabase Edge Function for importing Power FX code, you need to set your Supabase API key.
                  </p>
                  <p className="text-yellow-600 text-sm">
                    Please add your Supabase API key to the <code className="bg-yellow-100 px-1 rounded">.env</code> file:
                    <br />
                    <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_API_KEY=your_supabase_api_key_here</code>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Paste your Power FX code below to convert it to table data:
              </p>
              <textarea
                className="w-full h-64 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Paste Power FX code here..."
                value={powerFXCode}
                onChange={handleTextAreaChange}
                disabled={isConverting}
              ></textarea>
              {error && (
                <div className="mt-2 text-red-600 flex items-start">
                  <ExclamationCircleIcon className="w-5 h-5 mr-1 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none mr-2"
            disabled={isConverting}
          >
            Cancel
          </button>
          {!isApiKeyError && (
            <button
              onClick={handleImport}
              disabled={isConverting || !powerFXCode.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded focus:outline-none flex items-center ${
                isConverting || !powerFXCode.trim() ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isConverting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                'Import Code'
              )}
            </button>
          )}
        </div>
        
        {/* Version indicator */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400">
          v0.1.2
        </div>
      </div>
    </div>
  );
};

export default PowerFXImportDialog; 