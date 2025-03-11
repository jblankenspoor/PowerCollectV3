/**
 * PowerFX Generate Dialog Component
 * 
 * Dialog for generating Power Apps Collection code from the current table data
 * Uses the Claude API client to convert table data to Power Apps Collection format
 * 
 * @module PowerFXGenerateDialog
 * @version 4.1.4 - Improved error handling with detailed messages
 */

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { convertTableToPowerFX, ClaudeModel, getClaudeModelDisplayName } from '../../utils/claudeApiClient';

/**
 * Props for the PowerFXGenerateDialog component
 * @interface PowerFXGenerateDialogProps
 */
interface PowerFXGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Available Claude models for dropdown
 * @type {ClaudeModel[]} - Array of available Claude API model identifiers
 * @see https://docs.anthropic.com/en/docs/about-claude/models/all-models
 */
const CLAUDE_MODELS: ClaudeModel[] = [
  'claude-3-5-haiku-20241022',
  'claude-3-7-sonnet-20250219'
];

/**
 * PowerFXGenerateDialog component for generating Power Apps Collection code
 * @param props - Component props
 * @returns JSX Element
 */
export default function PowerFXGenerateDialog({ isOpen, onClose }: PowerFXGenerateDialogProps) {
  // Get table data from context
  const { state: { tasks, columns } } = useTableContext();
  
  // State for Power Apps Collection code and loading status
  const [powerFXCode, setPowerFXCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ClaudeModel>('claude-3-5-haiku-20241022');

  /**
   * Generate Power Apps Collection code from the current table data
   */
  const generateCollectionCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert table data to PowerFX using Claude API with selected model
      const code = await convertTableToPowerFX(tasks, columns, selectedModel);
      setPowerFXCode(code);
    } catch (err) {
      console.error('Error generating PowerFX code:', err);
      
      // Provide a more detailed error message
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Additional context for specific errors
        if (err.message.includes('Failed to fetch')) {
          errorMessage = `Network error when contacting the API service: ${err.message}. Please check your internet connection and try again.`;
        } else if (err.message.includes('404')) {
          errorMessage = `The selected model "${getClaudeModelDisplayName(selectedModel)}" is currently unavailable. Please try again with a different model.`;
        }
      } else {
        errorMessage = 'An unknown error occurred while generating the code. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy PowerFX code to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(powerFXCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setPowerFXCode('');
    setError(null);
    onClose();
  };

  /**
   * Handle model selection change
   */
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as ClaudeModel);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Generate Power Apps Collection
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Create a Power Apps collection from your table data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4">
                  {!powerFXCode && !isLoading && !error && (
                    <div>
                      <div className="mb-4">
                        <label htmlFor="claude-model" className="block text-sm font-medium text-gray-700 mb-1">
                          Claude Model
                        </label>
                        <select
                          id="claude-model"
                          name="claude-model"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          value={selectedModel}
                          onChange={handleModelChange}
                        >
                          {CLAUDE_MODELS.map((model) => (
                            <option key={model} value={model}>
                              {getClaudeModelDisplayName(model)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
                        onClick={generateCollectionCode}
                      >
                        Generate Collection
                      </button>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <p className="ml-2 text-sm text-gray-500">Generating collection code...</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error generating collection</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                              onClick={() => setError(null)}
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {powerFXCode && (
                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Generated Collection Code</h4>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1 text-green-500" aria-hidden="true" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">{powerFXCode}</pre>
                      </div>
                      
                      <div className="mt-4">
                        <div className="mb-4">
                          <label htmlFor="regenerate-claude-model" className="block text-sm font-medium text-gray-700 mb-1">
                            Claude Model for Regeneration
                          </label>
                          <select
                            id="regenerate-claude-model"
                            name="regenerate-claude-model"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            value={selectedModel}
                            onChange={handleModelChange}
                          >
                            {CLAUDE_MODELS.map((model) => (
                              <option key={model} value={model}>
                                {getClaudeModelDisplayName(model)}
                              </option>
                            ))}
                          </select>
                        </div>
                      
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={handleClose}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            onClick={generateCollectionCode}
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
