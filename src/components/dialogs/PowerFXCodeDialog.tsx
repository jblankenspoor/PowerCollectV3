/**
 * PowerFXCodeDialog Component
 * 
 * Dialog for displaying generated Power FX code from table data.
 * Allows users to copy the code to the clipboard.
 * 
 * @module PowerFXCodeDialog
 * @version 0.2.2 - Fixed unused import
 */

import React, { useState, useRef } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon, CodeBracketIcon, ExclamationTriangleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';

/**
 * PowerFXCodeDialog Component - Displays generated Power FX code
 * 
 * @returns JSX Element
 */
const PowerFXCodeDialog: React.FC = () => {
  const { state, dispatch } = useTableContext();
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    dispatch({ type: 'TOGGLE_POWERFX_DIALOG', payload: false });
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = () => {
    if (state.powerFXCode && codeRef.current) {
      navigator.clipboard.writeText(state.powerFXCode);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  /**
   * Check if the code contains an API key error message
   */
  const isClaudeApiKeyError = state.powerFXCode?.includes('Claude API key');

  /**
   * Check if the code contains a Supabase API key error message
   */
  const isSupabaseApiKeyError = state.powerFXCode?.includes('Supabase API key');

  /**
   * Check if the code contains any API key error
   */
  const isApiKeyError = isClaudeApiKeyError || isSupabaseApiKeyError;

  /**
   * Check if the code contains any error message
   */
  const hasError = state.powerFXCode?.includes('// Error generating Power FX code');

  /**
   * Extract error type from the error message
   */
  const getErrorType = () => {
    if (!state.powerFXCode) return '';
    
    if (state.powerFXCode.includes('Network error')) return 'Network Error';
    if (state.powerFXCode.includes('API key error')) return 'API Key Error';
    if (state.powerFXCode.includes('Rate limit')) return 'Rate Limit Exceeded';
    if (state.powerFXCode.includes('Authentication error')) return 'Authentication Error';
    
    return 'Error';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <CodeBracketIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Power FX Code
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Code display area */}
        <div className="p-4">
          {state.isGeneratingPowerFX ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-700">Generating Power FX code...</span>
            </div>
          ) : state.powerFXCode ? (
            <div className="relative">
              {isClaudeApiKeyError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <KeyIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-700 font-medium">Claude API Key Required</p>
                    <p className="text-yellow-600 text-sm">
                      To use the Claude AI integration, you need to set your API key in the <code className="bg-yellow-100 px-1 rounded">.env</code> file.
                      Copy <code className="bg-yellow-100 px-1 rounded">.env.example</code> to <code className="bg-yellow-100 px-1 rounded">.env</code> and add your API key.
                    </p>
                  </div>
                </div>
              )}

              {isSupabaseApiKeyError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <KeyIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-700 font-medium">Supabase API Key Required</p>
                    <p className="text-yellow-600 text-sm">
                      To use the Supabase Edge Function, you need to set your Supabase API key in the <code className="bg-yellow-100 px-1 rounded">.env</code> file.
                      Add <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_API_KEY=your_supabase_api_key_here</code> to your <code className="bg-yellow-100 px-1 rounded">.env</code> file.
                    </p>
                  </div>
                </div>
              )}
              
              {hasError && !isApiKeyError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">{getErrorType()}</p>
                    <p className="text-red-600 text-sm">
                      There was an error generating the Power FX code. Please check the console for more details.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center px-3 py-1 text-sm text-white rounded focus:outline-none ${
                    hasError ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  disabled={hasError}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre
                ref={codeRef}
                className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96 text-sm font-mono"
              >
                {state.powerFXCode}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <CodeBracketIcon className="w-12 h-12 mb-2" />
              <p>No Power FX code has been generated yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none mr-2"
          >
            Close
          </button>
          {state.powerFXCode && !state.isGeneratingPowerFX && !hasError && (
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          )}
        </div>
        
        {/* Version indicator */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400">
          v0.2.2
        </div>
      </div>
    </div>
  );
};

export default PowerFXCodeDialog; 