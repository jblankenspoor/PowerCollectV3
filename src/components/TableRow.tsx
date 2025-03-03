import React from 'react';
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
 */
interface TableRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
  onAddColumn: () => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * TableRow component
 * - Renders a single row in the data table
 * - Includes checkbox for selection, data cells, and action buttons
 * - Styled consistently with the table design
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
  onDeleteTask 
}) => {
  /**
   * Renders a cell based on the column type
   * @param {Column} column - Column definition
   * @returns {JSX.Element} Rendered cell content
   */
  const renderCell = (column: Column) => {
    const value = task[column.id] || '';
    
    // Render different cell types based on column.type
    switch (column.type) {
      case 'select':
        return (
          <div className="flex justify-center items-center h-full w-full">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={(e) => onSelectTask(task.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        );
      case 'status':
        // Status badges with different colors based on status value
        const statusColors = {
          'To do': 'bg-red-100 text-red-800',
          'In progress': 'bg-yellow-100 text-yellow-800',
          'Done': 'bg-green-100 text-green-800'
        };
        const colorClass = statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
            {value}
          </span>
        );
      case 'priority':
        // Priority badges with different colors
        const priorityColors = {
          'Low': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'High': 'bg-red-100 text-red-800'
        };
        const priorityColorClass = priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColorClass}`}>
            {value}
          </span>
        );
      default:
        // Default cell rendering for text, name, date, etc.
        return <span>{value}</span>;
    }
  };

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Map through columns to create cells */}
      {columns.map(column => (
        <div 
          key={`${task.id}-${column.id}`}
          className={`${column.width} ${column.minWidth || ''} p-4 flex ${column.type === 'select' ? 'justify-center' : ''} items-center`}
        >
          {renderCell(column)}
        </div>
      ))}
      
      {/* Action cell with buttons */}
      <ActionCell 
        taskId={task.id}
        onAddColumn={onAddColumn}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

export default TableRow;
