/**
 * VersionDisplay Component
 * 
 * Displays the current version of the application in the bottom left corner
 * 
 * @module VersionDisplay
 * @version 6.0.0 - Updated for major version release
 */

import React from 'react';

/**
 * Props for the VersionDisplay component
 * @interface VersionDisplayProps
 * @property {string} version - The current version of the application
 */
interface VersionDisplayProps {
  version: string;
}

/**
 * Component that displays the application version in the bottom left corner
 * @param {VersionDisplayProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const VersionDisplay: React.FC<VersionDisplayProps> = ({ version }) => {
  return (
    <div className="absolute bottom-2 left-2 text-xs text-gray-500">
      v{version}
    </div>
  );
};

export default VersionDisplay; 