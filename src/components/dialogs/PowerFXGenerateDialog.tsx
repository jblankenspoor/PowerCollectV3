/**
 * PowerFX Generate Dialog Component
 * 
 * Dialog for generating PowerFX code from the current table data
 * Uses the Claude API client to convert table data to PowerFX format
 * 
 * @module PowerFXGenerateDialog
 * @version 1.0.0 - Initial implementation
 */

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { convertTableToPowerFX } from '../../utils/claudeApiClient';

/**
 * Props for the PowerFXGenerateDialog component
 */
interface PowerFXGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PowerFXGenerateDialog component for generating PowerFX code
 * @param props - Component props
 * @returns JSX Element
 */
export default function PowerFXGenerateDialog({ isOpen, onClose }: PowerFXGenerateDialogProps) {
  // Get table data from context
  const { state: { tasks, columns } } = useTableContext();
  
  // State for PowerFX code and loading status
  const [powerFXCode, setPowerFXCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Generate PowerFX code from the current table data
   */
  const generatePowerFXCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert table data to PowerFX using Claude API
      const code = await convertTableToPowerFX(tasks, columns);
      setPowerFXCode(code);
    } catch (err) {
      console.error('Error generating PowerFX code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
                      Generate PowerFX Code
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Generate PowerFX code for creating a collection in Power Apps from your table data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4">
                  {!powerFXCode && !isLoading && !error && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
                      onClick={generatePowerFXCode}
                    >
                      Generate PowerFX
                    </button>
                  )}

                  {isLoading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <p className="ml-2 text-sm text-gray-500">Generating PowerFX code...</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error generating PowerFX code</h3>
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
                        <h4 className="text-sm font-medium text-gray-900">Generated PowerFX Code</h4>
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
                      <div className="mt-4 flex justify-end space-x-3">
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
                          onClick={generatePowerFXCode}
                        >
                          Regenerate
                        </button>
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
