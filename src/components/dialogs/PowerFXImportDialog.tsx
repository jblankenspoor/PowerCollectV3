/**
 * PowerFX Import Dialog Component
 * 
 * Dialog for importing Power Apps Collection code and converting it to table data
 * Uses the Claude API client to convert Power Apps Collection format to table data
 * 
 * @module PowerFXImportDialog
 * @version 5.1.11 - Added detailed cost breakdown and token details display
 */

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useTableContext } from '../../context/TableContext';
import { convertPowerFXToTable, ClaudeModel, getClaudeModelDisplayName, ClaudeTokenUsage } from '../../utils/claudeApiClient';
import TokenCountDisplay from '../common/TokenCountDisplay';
import { countImportTokens, TokenCount } from '../../utils/tokenCounter';

/**
 * Props for the PowerFXImportDialog component
 * @interface PowerFXImportDialogProps
 */
interface PowerFXImportDialogProps {
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
 * Pricing per 1M tokens in USD
 * @see https://www.anthropic.com/pricing#anthropic-api
 */
const MODEL_PRICING = {
  'claude-3-5-haiku-20241022': {
    input: 0.80,   // $0.80 per 1M input tokens
    output: 4.00   // $4.00 per 1M output tokens
  },
  'claude-3-7-sonnet-20250219': {
    input: 3.00,   // $3.00 per 1M input tokens
    output: 15.00  // $15.00 per 1M output tokens
  }
};

/**
 * PowerFXImportDialog component for importing Power Apps Collection code
 * @param props - Component props
 * @returns JSX Element
 */
export default function PowerFXImportDialog({ isOpen, onClose }: PowerFXImportDialogProps) {
  // Get table context
  const { dispatch } = useTableContext();
  
  // State for Power Apps Collection code input and processing status
  const [powerFXCode, setPowerFXCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ClaudeModel>('claude-3-5-haiku-20241022');
  
  // State for token counting
  const [tokenCount, setTokenCount] = useState<TokenCount | null>(null);
  const [isCountingTokens, setIsCountingTokens] = useState<boolean>(false);
  
  // State for actual token usage from Claude API
  const [actualTokenUsage, setActualTokenUsage] = useState<ClaudeTokenUsage | null>(null);
  
  // Store the model used for import
  const [importModel, setImportModel] = useState<ClaudeModel | null>(null);

  /**
   * Update token count when PowerFX code or model changes
   */
  useEffect(() => {
    if (isOpen && powerFXCode) {
      updateTokenCount();
    }
  }, [isOpen, powerFXCode, selectedModel]);

  /**
   * Update the token count for the current PowerFX code
   */
  const updateTokenCount = async () => {
    // Only calculate tokens if there's actual code
    if (!powerFXCode.trim()) {
      setTokenCount(null);
      return;
    }
    
    setIsCountingTokens(true);
    try {
      const count = await countImportTokens(powerFXCode, selectedModel);
      setTokenCount(count);
    } catch (error) {
      console.error('Error counting tokens:', error);
    } finally {
      setIsCountingTokens(false);
    }
  };

  /**
   * Handle Power Apps Collection code input change
   * @param e - Change event
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPowerFXCode(e.target.value);
  };

  /**
   * Handle model selection change
   */
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as ClaudeModel);
    // Token count will update via useEffect
  };

  /**
   * Format percentage difference between estimated and actual token usage
   * @param estimated - Estimated token count
   * @param actual - Actual token count
   * @returns Formatted percentage difference
   */
  const formatDifference = (estimated: number, actual: number): string => {
    if (estimated === 0 || actual === 0) return 'N/A';
    
    const difference = ((actual - estimated) / estimated) * 100;
    const sign = difference >= 0 ? '+' : '';
    return `${sign}${difference.toFixed(1)}%`;
  };

  /**
   * Formats a currency value as USD
   * @param value - The value to format
   * @returns Formatted currency string
   */
  const formatCurrency = (value: number): string => {
    if (value < 0.01) {
      return '$' + value.toFixed(5);
    }
    return '$' + value.toFixed(3);
  };

  /**
   * Calculate cost for token usage based on the model
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @param model - Claude model used
   * @returns Cost in USD
   */
  const calculateCost = (inputTokens: number, outputTokens: number, model: ClaudeModel): number => {
    const pricing = MODEL_PRICING[model];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  };

  /**
   * Import Power Apps Collection code and convert to table data
   */
  const importCollectionCode = async () => {
    if (!powerFXCode.trim()) {
      setError('Please enter Power Apps Collection code to import');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Store the model used for import
      setImportModel(selectedModel);
      
      // Convert Power Apps Collection code to table data using Claude API with selected model
      const result = await convertPowerFXToTable(powerFXCode, selectedModel);
      
      // Store actual token usage
      setActualTokenUsage(result.tokenUsage);
      
      // Clear existing table and set new data
      dispatch({ type: 'IMPORT_DATA', payload: { tasks: result.tasks, columns: result.columns } });
      
      // Close dialog after successful import
      handleClose();
    } catch (err) {
      console.error('Error importing PowerFX code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setPowerFXCode('');
    setError(null);
    setImportModel(null);
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
                    <ArrowUpTrayIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Import Power Apps Collection
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Paste Power Apps collection code to convert it to a table. This will replace your current data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <label htmlFor="powerfx-code" className="block text-sm font-medium leading-6 text-gray-900">
                        Collection Code
                      </label>
                      <TokenCountDisplay 
                        tokenCount={tokenCount} 
                        isLoading={isCountingTokens}
                        showDetails={true}
                      />
                    </div>
                    <div className="mt-2">
                      <textarea
                        id="powerfx-code"
                        name="powerfx-code"
                        rows={10}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Paste your Power Apps collection code here..."
                        value={powerFXCode}
                        onChange={handleCodeChange}
                      />
                    </div>
                  </div>

                  {/* Token usage comparison if actual usage is available */}
                  {actualTokenUsage && tokenCount && importModel && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Token Usage ({getClaudeModelDisplayName(importModel)})
                      </h5>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="font-medium">Metric</div>
                        <div className="font-medium">Estimated</div>
                        <div className="font-medium">Actual</div>
                        <div className="font-medium">Cost</div>
                        
                        <div>Input Tokens</div>
                        <div>{(tokenCount.adjustedInputTokens + tokenCount.instructionTokens).toLocaleString()}</div>
                        <div className="flex items-center">
                          {actualTokenUsage.input_tokens.toLocaleString()}
                          <span className={`ml-2 text-xs ${actualTokenUsage.input_tokens > (tokenCount.adjustedInputTokens + tokenCount.instructionTokens) ? 'text-red-500' : 'text-green-500'}`}>
                            ({formatDifference((tokenCount.adjustedInputTokens + tokenCount.instructionTokens), actualTokenUsage.input_tokens)})
                          </span>
                        </div>
                        <div>
                          {formatCurrency((actualTokenUsage.input_tokens / 1_000_000) * MODEL_PRICING[importModel].input)}
                        </div>
                        
                        <div>Output Tokens</div>
                        <div>{tokenCount.estimatedOutputTokens.toLocaleString()}</div>
                        <div className="flex items-center">
                          {actualTokenUsage.output_tokens.toLocaleString()}
                          <span className={`ml-2 text-xs ${actualTokenUsage.output_tokens > tokenCount.estimatedOutputTokens ? 'text-red-500' : 'text-green-500'}`}>
                            ({formatDifference(tokenCount.estimatedOutputTokens, actualTokenUsage.output_tokens)})
                          </span>
                        </div>
                        <div>
                          {formatCurrency((actualTokenUsage.output_tokens / 1_000_000) * MODEL_PRICING[importModel].output)}
                        </div>
                        
                        <div>Total Tokens</div>
                        <div>{tokenCount.adjustedTotalTokens.toLocaleString()}</div>
                        <div className="flex items-center">
                          {actualTokenUsage.total_tokens.toLocaleString()}
                          <span className={`ml-2 text-xs ${actualTokenUsage.total_tokens > tokenCount.adjustedTotalTokens ? 'text-red-500' : 'text-green-500'}`}>
                            ({formatDifference(tokenCount.adjustedTotalTokens, actualTokenUsage.total_tokens)})
                          </span>
                        </div>
                        <div>
                          {formatCurrency(calculateCost(
                            actualTokenUsage.input_tokens,
                            actualTokenUsage.output_tokens,
                            importModel
                          ))}
                        </div>
                        
                        <div className="font-medium">Cost</div>
                        <div className="font-medium">
                          {formatCurrency(calculateCost(
                            tokenCount.adjustedInputTokens + tokenCount.instructionTokens,
                            tokenCount.estimatedOutputTokens,
                            importModel
                          ))}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(calculateCost(
                            actualTokenUsage.input_tokens,
                            actualTokenUsage.output_tokens,
                            importModel
                          ))}
                        </div>
                        <div></div>
                      </div>
                      
                      {/* Detailed token breakdown */}
                      <div className="mt-4 border-t border-gray-200 pt-3">
                        <h6 className="text-xs font-medium text-gray-700 mb-2">Detailed Token Breakdown</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Raw Input Tokens</div>
                          <div>{tokenCount.inputTokens.toLocaleString()}</div>
                          
                          <div>System Instruction Tokens</div>
                          <div>{tokenCount.instructionTokens.toLocaleString()}</div>
                          
                          <div>Input Adjustment Factor</div>
                          <div>{(tokenCount.adjustedInputTokens / tokenCount.inputTokens).toFixed(2)}x</div>
                          
                          <div>Adjusted Input Tokens</div>
                          <div>{tokenCount.adjustedInputTokens.toLocaleString()}</div>
                          
                          <div>Total Input Tokens (Adjusted + System)</div>
                          <div>{(tokenCount.adjustedInputTokens + tokenCount.instructionTokens).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Pricing: Input ${MODEL_PRICING[importModel].input.toFixed(2)}/1M tokens · Output ${MODEL_PRICING[importModel].output.toFixed(2)}/1M tokens</p>
                      </div>
                    </div>
                  )}

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

                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error importing collection</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"
                      onClick={importCollectionCode}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        'Import'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
