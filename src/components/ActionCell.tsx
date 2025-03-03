import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import TooltipButton from './TooltipButton';

/**
 * Props for the ActionCell component
 * @interface ActionCellProps
 * @property {string} taskId - ID of the task this cell belongs to
 * @property {Function} onAddColumn - Function to handle adding a new column
 * @property {Function} onDeleteTask - Function to handle deleting the task
 */
interface ActionCellProps {
  taskId: string;
  onAddColumn: () => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * ActionCell component
 * - Contains action buttons for a table row
 * - Includes add column and delete task buttons with tooltips
 * - Styled consistently with the table design
 * 
 * @param {ActionCellProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
/**
 * ActionCell component renders the action buttons for each row
 * - Buttons are centered for better visibility and alignment
 * - Maintains consistent styling with the rest of the table
 */
const ActionCell: React.FC<ActionCellProps> = ({ taskId, onAddColumn, onDeleteTask }) => {
  return (
    <div className="w-[130px] bg-gray-50 border-l border-gray-200 flex-shrink-0 flex items-center justify-center gap-0 p-4">
      {/* Add column button with tooltip */}
      <TooltipButton
        onClick={onAddColumn}
        icon={PlusIcon}
        tooltipText="Add column"
        ariaLabel="Add column"
        colorClass="blue"
      />
      
      {/* Delete task button with tooltip */}
      <TooltipButton
        onClick={() => onDeleteTask(taskId)}
        icon={TrashIcon}
        tooltipText="Delete row"
        ariaLabel="Delete task"
        colorClass="red"
      />
    </div>
  );
};

export default ActionCell;
