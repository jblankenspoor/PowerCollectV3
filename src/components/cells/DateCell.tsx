/**
 * DateCell Component
 * 
 * Renders a date value or date input when editing
 * 
 * @module DateCell
 */

import React from 'react';
import { formatDateSafely } from '../../utils/tableUtils';

/**
 * Props for the DateCell component
 */
interface DateCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * DateCell component for rendering and editing date values
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const DateCell: React.FC<DateCellProps> = ({ 
  value, 
  isEditing, 
  onChange, 
  onBlur, 
  onKeyDown 
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
  
  // Format date for display
  const formattedValue = formatDateSafely(value);
  
  return isEditing ? (
    <div className="w-full h-6 flex items-center" style={containerStyle}>
      <input
        type="date"
        value={formattedValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
        autoFocus
        style={inputStyle}
        aria-label="Select date"
      />
    </div>
  ) : (
    <div className="h-6 flex items-center" style={containerStyle}>
      <span className="text-xs">{formattedValue}</span>
    </div>
  );
};

export default DateCell; 