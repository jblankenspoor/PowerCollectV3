/**
 * TableHeader Component
 * 
 * Renders the header row of the data table with editable column titles
 * 
 * @module TableHeader
 * @version 4.1.3 - Added Tab key navigation between header cells
 */

import React, { useState, useRef, useEffect } from 'react';
import { Column } from '../../types/dataTypes';
import { 
  getPixelWidthFromClass,
  getPixelWidthStringFromClass,
  measureTextWidth, 
  pixelWidthToMinWidthClass,
  pixelWidthToWidthClass
} from '../../utils/tableUtils';
import { useTableContext } from '../../context/TableContext';

/**
 * Props for the TableHeader component
 * Note: allSelected and onSelectAll are kept in the interface for future implementation
 */
interface TableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  onSelectAll: (selectAll: boolean) => void;
}

/**
 * TableHeader component that displays column headers and select all button
 * Column titles can be edited by clicking on them
 * Columns automatically resize to fit content in real-time
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => {
  const { dispatch } = useTableContext();
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (editingColumnId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingColumnId]);

  /**
   * Handles click on a column header to start editing
   * @param column - The column being edited
   */
  const handleClick = (column: Column) => {
    // Don't allow editing the select column or actions column
    if (column.id === 'select') return;
    
    setEditingColumnId(column.id);
    setEditValue(column.title);
  };

  /**
   * Handles input changes and adjusts column width in real-time
   * @param e - Change event 
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Check if we need to resize the column in real-time
    if (editingColumnId) {
      const column = columns.find(col => col.id === editingColumnId);
      if (!column) return;
      
      // Calculate width needed for the new title (use uppercase for sizing)
      const titleUpperCase = newValue.toUpperCase();
      const neededWidth = measureTextWidth(titleUpperCase);
      
      // Get current width from minWidth class
      const currentWidth = getPixelWidthFromClass(column.minWidth);
      
      // Only update width if new title needs more space
      if (neededWidth > currentWidth) {
        const newMinWidthClass = pixelWidthToMinWidthClass(neededWidth);
        const newWidthClass = pixelWidthToWidthClass(neededWidth);
        
        // Update column with new width classes in real-time
        dispatch({
          type: 'UPDATE_COLUMN',
          payload: {
            columnId: editingColumnId,
            updates: {
              width: newWidthClass,
              minWidth: newMinWidthClass
            }
          }
        });
      }
    }
  };

  /**
   * Saves the edited column title
   */
  const handleSave = () => {
    if (editingColumnId) {
      // Just update the title since width adjustments happen in real-time
      dispatch({
        type: 'UPDATE_COLUMN_TITLE',
        payload: {
          columnId: editingColumnId,
          title: editValue
        }
      });
      
      setEditingColumnId(null);
    }
  };

  /**
   * Handles key press events in the edit input
   * @param e - Keyboard event
   * @param columnIndex - Index of the current column in the filtered array
   */
  const handleKeyDown = (e: React.KeyboardEvent, columnIndex: number) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingColumnId(null);
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior
      
      // Save current cell
      handleSave();
      
      // Determine next column index
      const nextColumnIndex = e.shiftKey 
        ? columnIndex - 1  // Shift+Tab goes to previous column
        : columnIndex + 1; // Tab goes to next column
        
      // Get filtered columns (excluding select column)
      const editableColumns = columns.slice(1);
      
      // Check if next index is valid
      if (nextColumnIndex >= 0 && nextColumnIndex < editableColumns.length) {
        // Get the next column and start editing it
        const nextColumn = editableColumns[nextColumnIndex];
        setEditingColumnId(nextColumn.id);
        setEditValue(nextColumn.title);
      }
    }
  };

  /**
   * Handles clicks outside the editing input to save changes
   */
  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      {/* First cell is for Select All button - centered alignment */}
      <div className={`${columns[0].width} ${columns[0].minWidth || ''} p-4 flex items-center justify-center flex-shrink-0`}>
        <button
          disabled={true}
          className="w-full px-2 py-1 text-sm bg-gray-400 text-white rounded cursor-not-allowed relative group"
          aria-label="Select all rows (disabled)"
        >
          Select All
          
          {/* Tooltip for disabled Select All button */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            To be implemented
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </button>
      </div>
      
      {/* Map through columns to create header cells (skip the first select column as we handle it separately) */}
      {columns.slice(1).map((column, columnIndex) => {
        // Get pixel width from minWidth class
        const pixelWidth = getPixelWidthStringFromClass(column.minWidth);
        
        return (
          <div 
            key={column.id} 
            className={`${column.width} ${column.minWidth || ''} p-4 flex items-center justify-start font-medium text-gray-500 text-sm whitespace-nowrap flex-shrink-0 ${column.id !== 'select' ? 'cursor-pointer hover:bg-gray-100 group' : ''}`}
            style={{
              width: pixelWidth,
              minWidth: pixelWidth,
              maxWidth: pixelWidth,
              boxSizing: 'border-box' // Ensure padding is included in width calculation
            }}
            onClick={() => handleClick(column)}
          >
            {editingColumnId === column.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, columnIndex)}
                onBlur={handleBlur}
                className="w-full px-1 py-0.5 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={`Edit ${column.title} column title`}
              />
            ) : (
              <div className="flex items-center w-full">
                <span className="font-medium text-gray-500 text-sm">{column.displayTitle || column.title}</span>
                <span className="ml-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">✎</span>
              </div>
            )}
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