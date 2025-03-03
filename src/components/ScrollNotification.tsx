import React from 'react';

/**
 * Props for the ScrollNotification component
 * @interface ScrollNotificationProps
 * @property {boolean} show - Whether to show the notification
 */
interface ScrollNotificationProps {
  show: boolean;
}

/**
 * ScrollNotification component
 * - Displays a notification when horizontal scrolling is available
 * - Fades out after user scrolls
 * 
 * @param {ScrollNotificationProps} props - Component props
 * @returns {JSX.Element | null} Rendered component or null if not shown
 */
const ScrollNotification: React.FC<ScrollNotificationProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md animate-pulse">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-medium">Scroll to see more</span>
      </div>
    </div>
  );
};

export default ScrollNotification;
