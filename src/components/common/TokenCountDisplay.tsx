/**
 * Token Count Display Component
 * 
 * Displays token counts for Claude API calls with a detailed breakdown
 * 
 * @module TokenCountDisplay
 * @version 5.1.0 - Initial implementation of token counter display
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
  
  return (
    <div className={combinedClassName}>
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-3 w-3 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Counting tokens...</span>
        </div>
      ) : (
        <div className="leading-tight">
          <div className="flex items-center">
            <svg className="h-3 w-3 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{tokenCount?.totalTokens.toLocaleString()} tokens</span>
          </div>
          
          {showDetails && (
            <div className="mt-1 text-[10px] text-gray-500">
              <div>Input: {tokenCount?.inputTokens.toLocaleString()}</div>
              <div>System: {tokenCount?.instructionTokens.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenCountDisplay; 