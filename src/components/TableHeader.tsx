import React from 'react';
import { Column } from '../types/dataTypes';

/**
 * Props for the TableHeader component
 * @interface TableHeaderProps
 * @property {Column[]} columns - Array of column definitions
 * @property {boolean} allSelected - Whether all items are selected
 * @property {Function} onSelectAll - Function to handle select/deselect all
 */
interface TableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  onSelectAll: (selectAll: boolean) => void;
}

/**
 * TableHeader component
 * - Renders the header row of the data table
 * - Includes the select all button and column headers
 * - Maintains consistent styling with the table body
 * 
 * @param {TableHeaderProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TableHeader: React.FC<TableHeaderProps> = ({ columns, allSelected, onSelectAll }) => {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      {/* First cell is for Select All button - centered alignment */}
      <div className={`${columns[0].width} ${columns[0].minWidth || ''} p-4 flex items-center justify-center`}>
        <button
          onClick={() => onSelectAll(!allSelected)}
          className="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      {/* Map through columns to create header cells (skip the first select column as we handle it separately) */}
      {/* All regular columns are left-aligned for better readability */}
      {columns.slice(1).map(column => (
        <div 
          key={column.id} 
          className={`${column.width} ${column.minWidth || ''} p-4 flex items-center justify-start font-medium text-gray-500 text-sm whitespace-nowrap`}
        >
          {column.title}
        </div>
      ))}
      
      {/**
       * Actions column header
       * - Width matches the action buttons container in the rows (130px)
       * - Text is centered for better alignment
       */}
      {/* Actions column header - centered alignment */}
      <div className="w-[130px] flex-shrink-0 flex items-center justify-center border-l border-gray-200 bg-gray-50 p-4">
        <span className="text-sm font-medium text-gray-500">ACTIONS</span>
      </div>
    </div>
  );
};

export default TableHeader;
