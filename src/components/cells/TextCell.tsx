/**
 * TextCell Component
 * 
 * Renders a text value or text input when editing
 * 
 * @module TextCell
 */

import React from 'react';

/**
 * Props for the TextCell component
 */
interface TextCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * TextCell component for rendering and editing text values
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TextCell: React.FC<TextCellProps> = ({ 
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
  
  return isEditing ? (
    <div className="w-full h-6 flex items-center" style={containerStyle}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
        autoFocus
        style={inputStyle}
        aria-label="Edit text"
      />
    </div>
  ) : (
    <div className="h-6 flex items-center" style={containerStyle}>
      <span className="text-xs truncate w-full">{value}</span>
    </div>
  );
};

export default TextCell; 