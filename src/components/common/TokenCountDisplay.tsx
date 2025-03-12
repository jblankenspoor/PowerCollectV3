/**
 * Token Count Display Component
 * 
 * Displays token counts for Claude API calls with a detailed breakdown
 * 
 * @module TokenCountDisplay
 * @version 5.1.9 - Updated pricing model for input and output tokens
 */

import React from 'react';
import { TokenCount } from '../../utils/tokenCounter';

/**
 * Props for TokenCountDisplay component
 */
interface TokenCountDisplayProps {
  /** Token count data */
  tokenCount: TokenCount | null;
  /** Whether the token count is currently loading */
  isLoading?: boolean;
  /** Whether to display detailed breakdown */
  showDetails?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Pricing per 1M tokens in USD
 * @see https://www.anthropic.com/pricing#anthropic-api
 */
const MODEL_PRICING = {
  'claude-3-5-haiku-20241022': {
    input: 0.80,   // $0.80 per 1M input tokens
    output: 2.40   // $2.40 per 1M output tokens
  },
  'claude-3-7-sonnet-20250219': {
    input: 3.00,   // $3.00 per 1M input tokens
    output: 15.00  // $15.00 per 1M output tokens
  }
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
 * Formats a model name to a display name
 * @param modelName - The model name
 * @returns Display name for the model
 */
const formatModelName = (modelName?: string): string => {
  if (!modelName) return '';
  
  if (modelName.includes('3-5-haiku')) {
    return 'C3.5 Haiku';
  } else if (modelName.includes('3-7-sonnet')) {
    return 'C3.7 Sonnet';
  }
  
  return modelName.split('-').pop() || '';
};

/**
 * Calculate cost for token usage based on the model
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - Claude model name
 * @returns Cost in USD
 */
const calculateCost = (inputTokens: number, outputTokens: number, model?: string): number => {
  if (!model) return 0;
  
  let pricing;
  if (model.includes('3-5-haiku')) {
    pricing = MODEL_PRICING['claude-3-5-haiku-20241022'];
  } else if (model.includes('3-7-sonnet')) {
    pricing = MODEL_PRICING['claude-3-7-sonnet-20250219'];
  } else {
    // Default to Haiku pricing if model is unknown
    pricing = MODEL_PRICING['claude-3-5-haiku-20241022'];
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
};

/**
 * Token Count Display Component
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({ 
  tokenCount, 
  isLoading = false, 
  showDetails = false,
  className = ''
}) => {
  // If no token count and not loading, don't render anything
  if (!tokenCount && !isLoading) {
    return null;
  }
  
  // Default class names
  const baseClass = "text-xs text-gray-600 rounded bg-gray-100 px-2 py-1 flex items-center";
  const combinedClassName = `${baseClass} ${className}`;
  
  // Calculate total input tokens (including system tokens)
  const totalInputTokens = tokenCount ? tokenCount.adjustedInputTokens + tokenCount.instructionTokens : 0;
  
  // Calculate cost using the updated pricing model
  const cost = tokenCount ? calculateCost(
    totalInputTokens,
    tokenCount.estimatedOutputTokens,
    tokenCount.modelName
  ) : 0;
  
  return (
    <div className={combinedClassName}>
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-3 w-3 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Calculating tokens...</span>
        </div>
      ) : (
        <div className="leading-tight">
          <div className="flex items-center">
            <svg className="h-3 w-3 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
            <span className="font-medium">{tokenCount?.adjustedTotalTokens.toLocaleString()} tokens</span>
            <span className="font-medium text-indigo-600 ml-2">
              {formatCurrency(cost)}
            </span>
            {tokenCount?.modelName && (
              <span className="ml-2 text-[10px] text-gray-500">
                {formatModelName(tokenCount.modelName)}
              </span>
            )}
          </div>
          
          {showDetails && (
            <div className="mt-1 text-[10px] text-gray-500">
              <div>
                Input: {totalInputTokens.toLocaleString()} · Output: {tokenCount?.estimatedOutputTokens.toLocaleString()}
              </div>
              <div>
                Total: {tokenCount?.adjustedTotalTokens.toLocaleString()} ({formatCurrency(cost)})
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenCountDisplay; 