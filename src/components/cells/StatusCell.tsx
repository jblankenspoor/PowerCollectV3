/**
 * StatusCell Component
 * 
 * Renders a status badge or select dropdown when editing
 * 
 * @module StatusCell
 */

import React from 'react';
import { StatusValue } from '../../types/dataTypes';
import { getStatusColorClass } from '../../utils/tableUtils';

/**
 * Props for the StatusCell component
 */
interface StatusCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLastRow?: boolean;
}

/**
 * Status options with visual indicators
 */
const STATUS_OPTIONS: { value: StatusValue; colorClass: string }[] = [
  { value: 'To do', colorClass: 'bg-red-100 text-red-800' },
  { value: 'In progress', colorClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'Done', colorClass: 'bg-green-100 text-green-800' }
];

/**
 * StatusCell component for rendering status values with visual indicators
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const StatusCell: React.FC<StatusCellProps> = ({ 
  value, 
  isEditing, 
  onChange, 
  onBlur, 
  onKeyDown,
  isLastRow = false
}) => {
  const containerStyle = {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  };
  
  const inputStyle = {
    width: '100%',
    minWidth: '100%',
    boxSizing: 'border-box' as const
  };
  
  const colorClass = getStatusColorClass(value);
  
  return isEditing ? (
    <div className="w-full h-6 flex items-center" style={containerStyle}>
      <div className={`relative inline-block w-full ${isLastRow ? 'dropdown-top' : ''}`} style={containerStyle}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="w-full py-0 px-1 appearance-none bg-white border border-blue-500 focus:outline-none text-xs"
          autoFocus
          style={inputStyle}
          aria-label="Select status"
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  ) : (
    <div className="h-6 flex items-center" style={containerStyle}>
      <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
        {value}
      </span>
    </div>
  );
};

export default StatusCell; 