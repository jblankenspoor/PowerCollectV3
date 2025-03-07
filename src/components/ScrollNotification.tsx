/**
 * ScrollNotification Component
 * 
 * Shows a visual indicator when horizontal scroll is available
 * 
 * @module ScrollNotification
 */

import React from 'react';

/**
 * Props for the ScrollNotification component
 */
interface ScrollNotificationProps {
  show: boolean;
}

/**
 * ScrollNotification component that displays a visual cue for horizontal scrolling
 * 
 * @param props - Component props
 * @returns JSX Element or null if not visible
 */
const ScrollNotification: React.FC<ScrollNotificationProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div 
      className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1.5 rounded shadow-md z-10 flex items-center"
      aria-hidden="true"
    >
      <svg 
        className="w-4 h-4 mr-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 5l7 7-7 7M5 5l7 7-7 7" 
        />
      </svg>
      <span className="text-sm font-medium">Scroll to see more</span>
    </div>
  );
};

export default ScrollNotification;
