/**
 * TableHeader Component
 * 
 * Renders the header row of the data table with editable column titles
 * 
 * @module TableHeader
 * @version 1.3.0 - Added column resizing based on content width
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
 */
interface TableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  onSelectAll: (selectAll: boolean) => void;
}

/**
 * TableHeader component that displays column headers and select all button
 * Column titles can be edited by clicking on them
 * Columns automatically resize to fit content
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TableHeader: React.FC<TableHeaderProps> = ({ columns, allSelected, onSelectAll }) => {
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
   * Saves the edited column title and adjusts column width if needed
   */
  const handleSave = () => {
    if (editingColumnId) {
      const column = columns.find(col => col.id === editingColumnId);
      if (!column) {
        setEditingColumnId(null);
        return;
      }
      
      // Calculate width needed for the new title
      const titleUpperCase = editValue.toUpperCase();
      const neededWidth = measureTextWidth(titleUpperCase);
      
      // Get current width from minWidth class
      const currentWidth = getPixelWidthFromClass(column.minWidth);
      
      // Only update width if new title needs more space
      if (neededWidth > currentWidth) {
        const newMinWidthClass = pixelWidthToMinWidthClass(neededWidth);
        const newWidthClass = pixelWidthToWidthClass(neededWidth);
        
        // Update column with new width classes and title
        dispatch({
          type: 'UPDATE_COLUMN',
          payload: {
            columnId: editingColumnId,
            updates: {
              title: titleUpperCase,
              width: newWidthClass,
              minWidth: newMinWidthClass
            }
          }
        });
      } else {
        // Just update the title if width is sufficient
        dispatch({
          type: 'UPDATE_COLUMN_TITLE',
          payload: {
            columnId: editingColumnId,
            title: editValue
          }
        });
      }
      
      setEditingColumnId(null);
    }
  };

  /**
   * Handles key press events in the edit input
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingColumnId(null);
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
        const pixelWidth = getPixelWidthStringFromClass(column.minWidth);
        
        return (
          <div 
            key={column.id} 
            className={`${column.width} ${column.minWidth || ''} p-4 flex items-center justify-start font-medium text-gray-500 text-sm whitespace-nowrap flex-shrink-0 ${column.id !== 'select' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
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
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="w-full px-1 py-0.5 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={`Edit ${column.title} column title`}
              />
            ) : (
              <div className="flex items-center">
                <span>{column.title}</span>
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