/**
 * TableRow Component
 * 
 * Renders a row in the data table with appropriate cells for each column
 * 
 * @module TableRow
 * @version 1.1.0 - Updated to use revised width utility functions
 */

import React, { useState } from 'react';
import { Column, Task } from '../../types/dataTypes';
import ActionCell from '../ActionCell';
import CellFactory from '../cells/CellFactory';
import { getPixelWidthStringFromClass, measureTextWidth, pixelWidthToMinWidthClass, pixelWidthToWidthClass } from '../../utils/tableUtils';
import { useTableContext } from '../../context/TableContext';

/**
 * Props for the TableRow component
 */
interface TableRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
  onAddColumn: () => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, columnId: string, value: string) => void;
  isLastRow?: boolean;
  onSetEditingCell?: (taskId: string, columnId: string) => void;
  onClearEditingCell?: () => void;
  isEditing?: string | null;
}

/**
 * TableRow component that renders a row with appropriate cells
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const TableRow: React.FC<TableRowProps> = ({ 
  task, 
  columns, 
  isSelected, 
  onSelectTask, 
  onAddColumn, 
  onDeleteTask,
  onUpdateTask,
  isLastRow = false,
  onSetEditingCell,
  onClearEditingCell,
  isEditing = null
}) => {
  // State for tracking which cell is being hovered
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const { dispatch } = useTableContext();

  /**
   * Handles cell value changes and checks if column width needs adjusting
   * @param columnId - The identifier of the column being edited
   * @param value - The new value for the cell
   */
  const handleCellChange = (columnId: string, value: string) => {
    onUpdateTask(task.id, columnId, value);
    
    // Check if we need to adjust column width
    const column = columns.find(col => col.id === columnId);
    if (column) {
      // Calculate width needed for the content
      const neededWidth = measureTextWidth(value);
      
      // Get current width from minWidth class
      const currentWidth = getPixelWidthStringFromClass(column.minWidth);
      const currentWidthNumber = parseInt(currentWidth === 'auto' ? '0' : currentWidth, 10);
      
      // Only update width if content needs more space
      if (neededWidth > currentWidthNumber) {
        const newMinWidthClass = pixelWidthToMinWidthClass(neededWidth);
        const newWidthClass = pixelWidthToWidthClass(neededWidth);
        
        // Update column with new width classes
        dispatch({
          type: 'UPDATE_COLUMN',
          payload: {
            columnId,
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
   * Handles keyboard events for inputs
   * @param event - The keyboard event
   * @param columnId - The identifier of the column being edited
   */
  const handleKeyDown = (event: React.KeyboardEvent, columnId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Exit editing mode for this specific column
      if (isEditing === columnId) {
        onClearEditingCell?.();
      }
    } else if (event.key === 'Escape') {
      onClearEditingCell?.();
    }
  };

  /**
   * Handles cell click to start editing
   * @param columnId - The identifier of the column to edit
   */
  const handleCellClick = (columnId: string) => {
    if (!isEditing && columnId !== 'select' && onSetEditingCell) {
      onSetEditingCell(task.id, columnId);
    }
  };

  /**
   * Handles mouse enter event for a cell
   * @param columnId - The identifier of the column being hovered
   */
  const handleMouseEnter = (columnId: string) => {
    setHoveredCell(columnId);
  };

  /**
   * Handles mouse leave event for a cell
   */
  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Fixed row height to ensure consistency
  const rowHeight = "h-14";

  return (
    <div className={`flex border-b border-gray-200 hover:bg-blue-50 transition-all duration-300 ${rowHeight}`}>
      {columns.map(column => {
        const isSelectColumn = column.type === 'select';
        const isHovered = hoveredCell === column.id;
        const isEditingThisCell = isEditing === column.id;
        
        // Get pixel width from minWidth class
        const pixelWidth = getPixelWidthStringFromClass(column.minWidth);
        
        return (
          <div 
            key={`${task.id}-${column.id}`}
            className={`${column.width} ${column.minWidth || ''} ${rowHeight} flex-shrink-0`}
            style={{ 
              width: pixelWidth,
              minWidth: pixelWidth,
              maxWidth: pixelWidth,
              overflow: 'hidden',
              boxSizing: 'border-box' // Ensure padding is included in width calculation
            }}
          >
            {isSelectColumn ? (
              <div className="h-full flex items-center justify-center p-4">
                <CellFactory
                  column={column}
                  taskId={task.id}
                  value={task[column.id] || ''}
                  isSelected={isSelected}
                  isEditing={isEditingThisCell}
                  isLastRow={isLastRow}
                  onSelectTask={onSelectTask}
                  onChange={handleCellChange}
                  onBlur={onClearEditingCell || (() => {})}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <div 
                className={`h-full flex items-center p-4 cursor-pointer transition-all duration-300 ${isHovered ? 'bg-blue-100' : ''}`}
                onClick={() => handleCellClick(column.id)}
                onMouseEnter={() => handleMouseEnter(column.id)}
                onMouseLeave={handleMouseLeave}
                style={{ 
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                <CellFactory
                  column={column}
                  taskId={task.id}
                  value={task[column.id] || ''}
                  isSelected={isSelected}
                  isEditing={isEditingThisCell}
                  isLastRow={isLastRow}
                  onSelectTask={onSelectTask}
                  onChange={handleCellChange}
                  onBlur={onClearEditingCell || (() => {})}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}
          </div>
        );
      })}
      
      <ActionCell 
        taskId={task.id}
        onAddColumn={onAddColumn}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

export default TableRow; 