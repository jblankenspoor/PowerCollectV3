/**
 * ColumnActionRow Component
 * 
 * Provides action buttons for each column in the table
 * 
 * @module ColumnActionRow
 */

import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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
 * ColumnActionRow component that provides column manipulation tools
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
    <div className="flex border-b border-gray-200 bg-gray-50 py-1">
      {/* Map through all columns to create action cells */}
      {columns.map((column, index) => {
        const isSelectColumn = column.type === 'select';
        const pixelWidth = getPixelWidthFromClass(column.minWidth);
        
        return (
          <div 
            key={`action-${column.id}`} 
            className={`${column.width} ${column.minWidth || ''} flex items-center ${isSelectColumn ? 'justify-center' : 'justify-start'} gap-0 ${!isSelectColumn ? 'pl-4' : ''} flex-shrink-0`}
            style={{
              width: pixelWidth,
              minWidth: pixelWidth,
              maxWidth: pixelWidth,
              boxSizing: 'border-box' // Ensure padding is included in width calculation
            }}
          >
            {/* Special handling for different column types */}
            {isSelectColumn ? (
              // Select column - no actions
              <div className="flex items-center justify-start gap-1">
                {/* No actions for the Select column */}
              </div>
            ) : (
              <div className="flex items-center justify-start gap-1">
                {/* Add column to the left button */}
                <ColumnActionButton
                  onClick={() => onAddColumnLeft(index)}
                  tooltipText="Add column left"
                  ariaLabel="Add column to the left"
                >
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    <PlusIcon className="h-3.5 w-3.5" />
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                  </div>
                </ColumnActionButton>
                
                {/* Add column to the right button */}
                <ColumnActionButton
                  onClick={() => onAddColumnRight(index)}
                  tooltipText="Add column right"
                  ariaLabel="Add column to the right"
                >
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    <PlusIcon className="h-3.5 w-3.5" />
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </div>
                </ColumnActionButton>
                
                {/* Delete column button */}
                <ColumnActionButton
                  onClick={() => onDeleteColumn(column.id, index)}
                  tooltipText="Delete column"
                  ariaLabel="Delete column"
                  colorClass="red"
                >
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    <TrashIcon className="h-3.5 w-3.5" />
                    <ArrowDownIcon className="h-3.5 w-3.5" />
                  </div>
                </ColumnActionButton>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Empty cell for the actions column - centered for consistency */}
      <div className="w-[130px] flex-shrink-0 border-l border-gray-200 bg-gray-50 p-4 flex justify-center"></div>
    </div>
  );
};

export default ColumnActionRow; 