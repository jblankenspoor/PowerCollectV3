/**
 * PasteNotification Component
 * 
 * Shows a temporary success message when paste operation completes
 * 
 * @module PasteNotification
 */

import React from 'react';

/**
 * Props for the PasteNotification component
 */
interface PasteNotificationProps {
  show: boolean;
  message: string;
}

/**
 * PasteNotification component that displays a temporary success message
 * 
 * @param props - Component props
 * @returns JSX Element or null if not visible
 */
const PasteNotification: React.FC<PasteNotificationProps> = ({ show, message }) => {
  if (!show) return null;
  
  return (
    <div 
      className="absolute top-0 right-0 m-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded shadow-md transition-opacity duration-300 opacity-90 z-50"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default PasteNotification; 