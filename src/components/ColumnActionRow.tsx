import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Column } from '../types/dataTypes';

/**
 * Props for the ColumnActionRow component
 * @interface ColumnActionRowProps
 * @property {Column[]} columns - Array of column definitions
 * @property {Function} onAddColumnLeft - Function to handle adding a column to the left
 * @property {Function} onAddColumnRight - Function to handle adding a column to the right
 * @property {Function} onDeleteColumn - Function to handle deleting a column
 */
interface ColumnActionRowProps {
  columns: Column[];
  onAddColumnLeft: (columnIndex: number) => void;
  onAddColumnRight: (columnIndex: number) => void;
  onDeleteColumn: (columnId: string, columnIndex: number) => void;
}

/**
 * ColumnActionButton component for consistent button styling
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ColumnActionButton: React.FC<{
  onClick: () => void;
  tooltipText: string;
  ariaLabel: string;
  colorClass?: 'blue' | 'red';
  children: React.ReactNode;
}> = ({ onClick, tooltipText, ariaLabel, colorClass = 'blue', children }) => {
  // Map color class names based on the color prop
  const colorMapping = {
    blue: "hover:text-blue-600",
    red: "hover:text-red-600"
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`column-action-button ${colorMapping[colorClass]} tooltip-trigger`}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          const tooltip = e.currentTarget.nextElementSibling;
          if (tooltip) tooltip.classList.add('tooltip-visible');
        }}
        onMouseLeave={(e) => {
          const tooltip = e.currentTarget.nextElementSibling;
          if (tooltip) tooltip.classList.remove('tooltip-visible');
        }}
      >
        {children}
      </button>
      {/* 
       * Tooltip container - consistent with other tooltips in the application
       * - Appears on hover with no delay
       * - Positioned above the button with a small arrow pointing down
       * - Minimal width and padding for compact display
       */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-0.5 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 transition-opacity duration-100 whitespace-nowrap z-10 min-w-[80px] text-center">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

/**
 * ColumnActionRow component
 * - Provides action buttons for each column in the table
 * - Allows adding columns to the left/right and deleting columns
 * - Placed immediately below the table header
 * 
 * @param {ColumnActionRowProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ColumnActionRow: React.FC<ColumnActionRowProps> = ({ 
  columns, 
  onAddColumnLeft, 
  onAddColumnRight, 
  onDeleteColumn 
}) => {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50 py-1">
      {/* Map through all columns to create action cells */}
      {columns.map((column, index) => (
        <div 
          key={`action-${column.id}`} 
          className={`${column.width} ${column.minWidth || ''} flex items-center justify-center gap-0`}
        >
          {/* Skip delete option for essential columns (select, name) */}
          {index <= 1 ? (
            <div className="flex items-center justify-center gap-1">
              {/* Add column to the right button */}
              <ColumnActionButton
                onClick={() => onAddColumnRight(index)}
                tooltipText="Add column right"
                ariaLabel="Add column to the right"
              >
                <div className="flex items-center">
                  <ArrowRightIcon className="h-4 w-4 mr-0.5" />
                  <PlusIcon className="h-3.5 w-3.5" />
                </div>
              </ColumnActionButton>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              {/* Add column to the left button */}
              <ColumnActionButton
                onClick={() => onAddColumnLeft(index)}
                tooltipText="Add column left"
                ariaLabel="Add column to the left"
              >
                <div className="flex items-center">
                  <PlusIcon className="h-3.5 w-3.5 mr-0.5" />
                  <ArrowLeftIcon className="h-4 w-4" />
                </div>
              </ColumnActionButton>
              
              {/* Add column to the right button */}
              <ColumnActionButton
                onClick={() => onAddColumnRight(index)}
                tooltipText="Add column right"
                ariaLabel="Add column to the right"
              >
                <div className="flex items-center">
                  <ArrowRightIcon className="h-4 w-4 mr-0.5" />
                  <PlusIcon className="h-3.5 w-3.5" />
                </div>
              </ColumnActionButton>
              
              {/* Delete column button */}
              <ColumnActionButton
                onClick={() => onDeleteColumn(column.id, index)}
                tooltipText="Delete column"
                ariaLabel="Delete column"
                colorClass="red"
              >
                <div className="flex flex-col items-center justify-center -space-y-1">
                  <ArrowDownIcon className="h-3 w-3" />
                  <TrashIcon className="h-4 w-4" />
                </div>
              </ColumnActionButton>
            </div>
          )}
        </div>
      ))}
      
      {/* Empty cell for the actions column */}
      <div className="w-[130px] flex-shrink-0 border-l border-gray-200 bg-gray-50"></div>
    </div>
  );
};

export default ColumnActionRow;
