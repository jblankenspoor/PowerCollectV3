/**
 * SelectCell Component
 * 
 * Renders a checkbox cell for row selection
 * Currently disabled as per requirements
 * 
 * @module SelectCell
 * @version 0.1.1 - Disabled checkboxes
 */

import React from 'react';

/**
 * Props for the SelectCell component
 */
interface SelectCellProps {
  taskId: string;
  isSelected: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
}

/**
 * SelectCell component for rendering a checkbox in table rows
 * Checkboxes are currently disabled as per requirements
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const SelectCell: React.FC<SelectCellProps> = ({ taskId, isSelected, onSelectTask }) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={(e) => onSelectTask(taskId, e.target.checked)}
        className="h-4 w-4 text-blue-600 rounded opacity-50 cursor-not-allowed"
        aria-label={`Select row ${taskId}`}
        disabled={true}
      />
    </div>
  );
};

export default SelectCell; 