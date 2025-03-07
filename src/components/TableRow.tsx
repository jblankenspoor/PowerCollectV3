import React, { useState, KeyboardEvent } from 'react';
import { Column, Task } from '../types/dataTypes';
import ActionCell from './ActionCell';

/**
 * Props for the TableRow component
 * @interface TableRowProps
 * @property {Task} task - Task data for this row
 * @property {Column[]} columns - Array of column definitions
 * @property {boolean} isSelected - Whether this row is selected
 * @property {Function} onSelectTask - Function to handle row selection
 * @property {Function} onAddColumn - Function to handle adding a column
 * @property {Function} onDeleteTask - Function to handle deleting the task
 * @property {Function} onUpdateTask - Function to handle updating task values
 * @property {boolean} isLastRow - Whether this is the last row in the table
 * @property {Function} onSetEditingCell - Function to set which cell is being edited
 * @property {Function} onClearEditingCell - Function to clear the editing cell state
 * @property {string|null} isEditing - Column ID if any cell in this row is being edited, null otherwise
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
 * TableRow component
 * - Renders a row in the data table
 * - Handles cell editing, selection, and other interactions
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
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

  /**
   * Handles cell value changes
   * @param columnId - The identifier of the column being edited
   * @param value - The new value for the cell
   */
  const handleCellChange = (columnId: string, value: string) => {
    onUpdateTask(task.id, columnId, value);
  };

  /**
   * Handles keyboard events for text inputs
   * @param event - The keyboard event
   * @param columnId - The identifier of the column being edited (used to identify which cell is being edited)
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLDivElement>, columnId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Use columnId to exit editing mode for the specific column
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

  /**
   * Renders a cell based on the column type
   * @param {Column} column - Column definition
   * @returns {JSX.Element} Rendered cell content
   */
  const renderCell = (column: Column) => {
    const value = task[column.id] || '';
    const isEditingThisCell = isEditing === column.id;
    
    const containerStyle = {
      width: '100%',
      minWidth: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    };
    
    const inputStyle = {
      width: '100%',
      minWidth: '100%'
    };
    
    // Render different cell types based on column.type
    switch (column.type) {
      case 'select':
        return (
          <div className="flex items-center justify-center h-full w-full">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={(e) => onSelectTask(task.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        );

      case 'status':
        const statusOptions = [
          { value: 'To do', colorClass: 'bg-red-100 text-red-800' },
          { value: 'In progress', colorClass: 'bg-yellow-100 text-yellow-800' },
          { value: 'Done', colorClass: 'bg-green-100 text-green-800' }
        ];
        const colorClass = statusOptions.find(option => option.value === value)?.colorClass || 'bg-gray-100 text-gray-800';
        
        return isEditingThisCell ? (
          <div className="w-full h-6 flex items-center" style={containerStyle}>
            <div className={`relative inline-block w-full ${isLastRow ? 'dropdown-top' : ''}`} style={containerStyle}>
              <select
                value={value}
                onChange={(e) => handleCellChange(column.id, e.target.value)}
                onBlur={() => onClearEditingCell?.()}
                onKeyDown={(e) => handleKeyDown(e, column.id)}
                className="w-full py-0 px-1 appearance-none bg-white border border-blue-500 focus:outline-none text-xs"
                autoFocus
                style={inputStyle}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.value}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-6 flex items-center" style={containerStyle}>
            <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
              {value}
            </span>
          </div>
        );

      case 'priority':
        const priorityOptions = ['Low', 'Medium', 'High'];
        const priorityColors = {
          'Low': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'High': 'bg-red-100 text-red-800'
        };
        const priorityColorClass = priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
        
        return isEditingThisCell ? (
          <div className="w-full h-6 flex items-center" style={containerStyle}>
            <div className={`relative inline-block w-full ${isLastRow ? 'dropdown-top' : ''}`} style={containerStyle}>
              <select
                value={value}
                onChange={(e) => handleCellChange(column.id, e.target.value)}
                onBlur={() => onClearEditingCell?.()}
                onKeyDown={(e) => handleKeyDown(e, column.id)}
                className="w-full py-0 px-1 appearance-none bg-white border border-blue-500 focus:outline-none text-xs"
                autoFocus
                style={inputStyle}
              >
                {priorityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-6 flex items-center" style={containerStyle}>
            <span className={`px-2 py-1 text-xs rounded-full ${priorityColorClass}`}>
              {value}
            </span>
          </div>
        );

      case 'date':
        return isEditingThisCell ? (
          <div className="w-full h-6 flex items-center" style={containerStyle}>
            <input
              type="date"
              value={value}
              onChange={(e) => handleCellChange(column.id, e.target.value)}
              onBlur={() => onClearEditingCell?.()}
              onKeyDown={(e) => handleKeyDown(e, column.id)}
              className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
              autoFocus
              style={inputStyle}
            />
          </div>
        ) : (
          <div className="h-6 flex items-center" style={containerStyle}>
            <span className="text-xs">{value}</span>
          </div>
        );

      default:
        return isEditingThisCell ? (
          <div className="w-full h-6 flex items-center" style={containerStyle}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleCellChange(column.id, e.target.value)}
              onBlur={() => onClearEditingCell?.()}
              onKeyDown={(e) => handleKeyDown(e, column.id)}
              className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
              autoFocus
              style={{
                ...inputStyle,
                // Ensure input doesn't cause column width to change
                boxSizing: 'border-box'
              }}
            />
          </div>
        ) : (
          <div className="h-6 flex items-center" style={containerStyle}>
            <span className="text-xs truncate w-full">{value}</span>
          </div>
        );
    }
  };

  // Fixed row height to ensure consistency
  const rowHeight = "h-14";

  return (
    <div className={`flex border-b border-gray-200 hover:bg-blue-50 transition-all duration-300 ${rowHeight}`}>
      {columns.map(column => {
        const isSelectColumn = column.type === 'select';
        const isHovered = hoveredCell === column.id;
        
        // Extract pixel width from minWidth CSS class for fixed sizing
        const widthMatch = column.minWidth ? column.minWidth.match(/min-w-\[(\d+)px\]/) : null;
        const pixelWidth = widthMatch ? widthMatch[1] + 'px' : 'auto';
        
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
                {renderCell(column)}
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
                {renderCell(column)}
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
