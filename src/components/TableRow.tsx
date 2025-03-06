import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
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
}

/**
 * CustomStatusDropdown component
 * - Renders a custom dropdown for status selection
 * - Displays options with matching status colors
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const CustomStatusDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  isLastRow?: boolean;
}> = ({ value, onChange, onClose, onKeyDown, isLastRow = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const statusOptions = [
    { value: 'To do', colorClass: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'In progress', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'Done', colorClass: 'bg-green-100 text-green-800 border-green-200' }
  ];
  
  // Find the color class for the current value
  const currentColorClass = statusOptions.find(option => option.value === value)?.colorClass || '';

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle option selection
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    onClose();
  };

  return (
    <div 
      className="relative w-full z-50" 
      ref={dropdownRef}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Selected value display - more compact */}
      <div 
        className={`flex items-center justify-between px-2 py-0.5 border rounded text-xs cursor-pointer ${currentColorClass}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ height: '22px' }}
      >
        <span className="font-medium">{value}</span>
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Dropdown options - more compact */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 border border-gray-200 rounded shadow-sm bg-white overflow-hidden ${
            isLastRow ? 'bottom-full mb-0.5' : 'top-full mt-0.5'
          }`}
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className={`px-2 py-1 text-xs cursor-pointer ${option.colorClass} hover:opacity-90 transition-all duration-150 ${value === option.value ? 'font-semibold' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TableRow component
 * - Renders a single row in the data table
 * - Includes checkbox for selection, editable cells, and action buttons
 * - Styled consistently with the table design
 * - Uses blue hover states for better visual feedback
 * 
 * @param {TableRowProps} props - Component props
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
  isLastRow = false
}) => {
  // State for tracking which cell is being edited
  const [editingCell, setEditingCell] = useState<string | null>(null);
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
   * @param columnId - The identifier of the column being edited
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLDivElement>, columnId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setEditingCell(null);
    } else if (event.key === 'Escape') {
      setEditingCell(null);
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
    const isEditing = editingCell === column.id;
    
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
        const statusColors = {
          'To do': 'bg-red-100 text-red-800',
          'In progress': 'bg-yellow-100 text-yellow-800',
          'Done': 'bg-green-100 text-green-800'
        };
        const colorClass = statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return isEditing ? (
          <div className="w-full h-6 flex items-center">
            <CustomStatusDropdown 
              value={value as string}
              onChange={(newValue) => handleCellChange(column.id, newValue)}
              onClose={() => setEditingCell(null)}
              onKeyDown={(e) => handleKeyDown(e, column.id)}
              isLastRow={isLastRow}
            />
          </div>
        ) : (
          <div className="h-6 flex items-center">
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
        
        return isEditing ? (
          <div className="w-full h-6 flex items-center">
            <div className={`relative inline-block w-full ${isLastRow ? 'dropdown-top' : ''}`}>
              <select
                value={value}
                onChange={(e) => handleCellChange(column.id, e.target.value)}
                onBlur={() => setEditingCell(null)}
                onKeyDown={(e) => handleKeyDown(e, column.id)}
                className="w-full py-0 px-1 appearance-none bg-white border border-blue-500 focus:outline-none text-xs"
                autoFocus
                style={{ height: '24px' }}
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
          <div className="h-6 flex items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${priorityColorClass}`}>
              {value}
            </span>
          </div>
        );

      case 'date':
        return isEditing ? (
          <div className="w-full h-6 flex items-center">
            <input
              type="date"
              value={value}
              onChange={(e) => handleCellChange(column.id, e.target.value)}
              onBlur={() => setEditingCell(null)}
              onKeyDown={(e) => handleKeyDown(e, column.id)}
              className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
              style={{ height: '24px' }}
              autoFocus
            />
          </div>
        ) : (
          <div className="h-6 flex items-center">
            <span className="text-xs">{value}</span>
          </div>
        );

      default:
        return isEditing ? (
          <div className="w-full h-6 flex items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => handleCellChange(column.id, e.target.value)}
              onBlur={() => setEditingCell(null)}
              onKeyDown={(e) => handleKeyDown(e, column.id)}
              className="w-full py-0 px-1 border border-blue-500 focus:outline-none text-xs"
              style={{ height: '24px' }}
              autoFocus
            />
          </div>
        ) : (
          <div className="h-6 flex items-center">
            <span className="text-xs">{value}</span>
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
        
        return (
          <div 
            key={`${task.id}-${column.id}`}
            className={`${column.width} ${column.minWidth || ''} ${rowHeight}`}
          >
            {isSelectColumn ? (
              <div className="h-full flex items-center justify-center p-4">
                {renderCell(column)}
              </div>
            ) : (
              <div 
                className={`h-full flex items-center p-4 cursor-pointer transition-all duration-300 ${isHovered ? 'bg-blue-100' : ''}`}
                onClick={() => !editingCell && setEditingCell(column.id)}
                onMouseEnter={() => handleMouseEnter(column.id)}
                onMouseLeave={handleMouseLeave}
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
