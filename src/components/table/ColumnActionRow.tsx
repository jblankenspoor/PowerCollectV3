/**
 * ColumnActionRow Component
 * 
 * Provides action buttons for each column in the table
 * 
 * @module ColumnActionRow
 * @version 1.0.2 - Fixed build errors with unused imports
 */

import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Column } from '../../types/dataTypes';
import { getPixelWidthFromClass } from '../../utils/tableUtils';

/**
 * Props for the ColumnActionRow component
 */
interface ColumnActionRowProps {
  columns: Column[];
  onAddColumnLeft: (columnIndex: number) => void;
  onAddColumnRight: (columnIndex: number) => void;
  onDeleteColumn: (columnId: string, columnIndex: number) => void;
}

/**
 * ColumnActionButton component for consistent button styling
 */
interface ColumnActionButtonProps {
  onClick: () => void;
  tooltipText: string;
  ariaLabel: string;
  colorClass?: 'blue' | 'red';
  children: React.ReactNode;
}

/**
 * ColumnActionButton component
 */
const ColumnActionButton: React.FC<ColumnActionButtonProps> = ({
  onClick,
  tooltipText,
  ariaLabel,
  colorClass = 'blue',
  children
}) => {
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
      {/* Tooltip container */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-0.5 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 transition-opacity duration-100 whitespace-nowrap z-10 min-w-[80px] text-center">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

/**
 * ColumnActionRow component to display column-specific action buttons
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const ColumnActionRow: React.FC<ColumnActionRowProps> = ({ 
  columns, 
  onAddColumnLeft, 
  onAddColumnRight, 
  onDeleteColumn 
}) => {
  return (
    <div className="flex">
      {columns.map((column, index) => {
        // Calculate width based on column settings
        let width = 0;
        if (column.width) {
          width = getPixelWidthFromClass(column.width);
        }
        
        // Ensure minimum width for buttons to prevent overlapping
        const actionWidth = Math.max(width, 120);
        
        return (
          <div 
            key={column.id}
            className="flex flex-shrink-0 justify-center items-center relative"
            style={{ width: `${actionWidth}px` }}
          >
            <div className="flex space-x-1 absolute z-10">
              {/* Left button - Don't show for first column if it's SELECT type */}
              {!(index === 0 && column.type === 'select') && (
                <ColumnActionButton
                  onClick={() => onAddColumnLeft(index)}
                  tooltipText="Add column to the left"
                  ariaLabel="Add column to the left"
                >
                  <ArrowLeftIcon className="h-3 w-3" />
                  <PlusIcon className="h-3 w-3" />
                </ColumnActionButton>
              )}
              
              {/* Right button */}
              <ColumnActionButton
                onClick={() => onAddColumnRight(index)}
                tooltipText="Add column to the right"
                ariaLabel="Add column to the right"
              >
                <PlusIcon className="h-3 w-3" />
                <ArrowRightIcon className="h-3 w-3" />
              </ColumnActionButton>
              
              {/* Delete button - Don't show for essential columns */}
              {column.type !== 'select' && (
                <ColumnActionButton
                  onClick={() => onDeleteColumn(column.id, index)}
                  tooltipText="Delete column"
                  ariaLabel="Delete column"
                  colorClass="red"
                >
                  <TrashIcon className="h-3 w-3" />
                </ColumnActionButton>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ColumnActionRow; 