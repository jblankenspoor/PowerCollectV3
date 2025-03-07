/**
 * TableHeader Component
 * 
 * Renders the header row of the data table
 * 
 * @module TableHeader
 */

import React from 'react';
import { Column } from '../../types/dataTypes';
import { getPixelWidthFromClass } from '../../utils/tableUtils';

/**
 * Props for the TableHeader component
 */
interface TableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  onSelectAll: (selectAll: boolean) => void;
}

/**
 * TableHeader component that displays column headers and select all button
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TableHeader: React.FC<TableHeaderProps> = ({ columns, allSelected, onSelectAll }) => {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      {/* First cell is for Select All button - centered alignment */}
      <div className={`${columns[0].width} ${columns[0].minWidth || ''} p-4 flex items-center justify-center flex-shrink-0`}>
        <button
          onClick={() => onSelectAll(!allSelected)}
          className="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      {/* Map through columns to create header cells (skip the first select column as we handle it separately) */}
      {columns.slice(1).map(column => {
        // Get pixel width from minWidth class
        const pixelWidth = getPixelWidthFromClass(column.minWidth);
        
        return (
          <div 
            key={column.id} 
            className={`${column.width} ${column.minWidth || ''} p-4 flex items-center justify-start font-medium text-gray-500 text-sm whitespace-nowrap flex-shrink-0`}
            style={{
              width: pixelWidth,
              minWidth: pixelWidth,
              maxWidth: pixelWidth,
              boxSizing: 'border-box' // Ensure padding is included in width calculation
            }}
          >
            {column.title}
          </div>
        );
      })}
      
      {/* Actions column header - centered alignment */}
      <div className="w-[130px] flex-shrink-0 flex items-center justify-center border-l border-gray-200 bg-gray-50 p-4">
        <span className="text-sm font-medium text-gray-500">ACTIONS</span>
      </div>
    </div>
  );
};

export default TableHeader; 