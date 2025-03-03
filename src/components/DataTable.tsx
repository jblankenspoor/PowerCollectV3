/**
 * DataTable Component
 * 
 * A responsive data table for displaying and managing tasks with features like:
 * - Adding/removing tasks and columns
 * - Status and priority indicators
 * - Horizontal scrolling for many columns
 * 
 * Dependencies:
 * - React (useState, useRef) for component state management
 * - uuid for generating unique identifiers
 * - Custom components for modular UI structure
 * - Custom hooks for reusable logic
 * - Tailwind CSS for styling
 */

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import custom components
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import ScrollNotification from './ScrollNotification';
import ColumnActionRow from './ColumnActionRow';

// Import custom hooks
import useTableResize from '../hooks/useTableResize';

// Import types
import { Column, Task } from '../types/dataTypes';

/**
 * Initial task data with predefined tasks for demonstration
 */
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    name: 'Quarterly launch',
    status: 'Done',
    priority: 'Low',
    startDate: '17 februari 2025',
    deadline: '20 februari 2025',
  },
  {
    id: uuidv4(),
    name: 'Customer research',
    status: 'In progress',
    priority: 'Medium',
    startDate: '21 februari 2025',
    deadline: '24 februari 2025',
  },
  {
    id: uuidv4(),
    name: 'Campaign analysis',
    status: 'To do',
    priority: 'High',
    startDate: '25 februari 2025',
    deadline: '28 februari 2025',
  },
];

/**
 * Main DataTable component
 * Manages the state and rendering of the interactive data table
 */
const DataTable: React.FC = () => {
  // State for managing tasks and their selection
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  /**
   * State for columns with fixed width settings
   * - Each column has a fixed width to ensure consistency across the table
   * - The Select column is centered while all other columns are left-aligned
   * - Width values are chosen to accommodate the content in each column
   */
  const [columns, setColumns] = useState<Column[]>([
    // Select column with sufficient width for 'Deselect All' button
    { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
    { id: 'name', title: 'NAME', type: 'name', width: 'w-48', minWidth: 'min-w-[192px]' },
    { id: 'status', title: 'STATUS', type: 'status', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
    { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
  ]);
  
  // Reference to the table container for measuring available space
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the custom table resize hook to handle scroll notification
  // We only need the showScrollNotification state for this component
  const { showScrollNotification } = useTableResize(
    tableRef,
    [columns, tasks]
  );

  /**
   * Handles the selection/deselection of a task
   * @param taskId - The unique identifier of the task
   * @param isSelected - Whether the task should be selected or deselected
   */
  const handleSelectTask = (taskId: string, isSelected: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  /**
   * Handles the selection/deselection of all tasks
   * @param selectAll - Whether to select or deselect all tasks
   */
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      // Select all tasks
      const allTaskIds = tasks.map(task => task.id);
      setSelectedTasks(new Set(allTaskIds));
    } else {
      // Deselect all tasks
      setSelectedTasks(new Set());
    }
  };

  /**
   * Adds a new task to the table
   */
  const handleAddTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      name: 'New Task',
      status: 'To do',
      priority: 'Medium',
      startDate: 'Not set',
      deadline: 'Not set',
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  /**
   * Deletes a task from the table
   * @param taskId - The unique identifier of the task to delete
   */
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  /**
   * Adds a new column to the table (helper function for creating a column)
   * @param columnName - Name of the column
   * @returns Column - The new column object
   */
  const createNewColumn = (columnName: string): Column => {
    // Generate a unique ID for the new column
    const newColumnId = `column${uuidv4().substring(0, 8)}`;
    // Return a new column with fixed width for consistency
    return {
      id: newColumnId,
      title: columnName,
      type: 'text',
      width: 'w-36', // Fixed width for consistency with other columns
      minWidth: 'min-w-[144px]',
    };
  };

  /**
   * Adds a new column to the table at the right end
   */
  const handleAddColumn = () => {
    const newColumn = createNewColumn(`COLUMN ${columns.length}`);
    
    // Add the new column to the columns array
    setColumns(prev => [...prev, newColumn]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumn.id]: 'New data',
    })));
  };

  /**
   * Adds a column to the left of the specified column index
   * @param columnIndex - Index of the column to add to the left of
   */
  const handleAddColumnLeft = (columnIndex: number) => {
    const newColumn = createNewColumn(`COLUMN L${columnIndex}`);
    
    // Insert the new column at the specified index
    setColumns(prev => [
      ...prev.slice(0, columnIndex),
      newColumn,
      ...prev.slice(columnIndex)
    ]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumn.id]: 'New data',
    })));
  };

  /**
   * Adds a column to the right of the specified column index
   * @param columnIndex - Index of the column to add to the right of
   */
  const handleAddColumnRight = (columnIndex: number) => {
    const newColumn = createNewColumn(`COLUMN R${columnIndex}`);
    
    // Insert the new column after the specified index
    setColumns(prev => [
      ...prev.slice(0, columnIndex + 1),
      newColumn,
      ...prev.slice(columnIndex + 1)
    ]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumn.id]: 'New data',
    })));
  };

  /**
   * Deletes a column from the table
   * @param columnId - ID of the column to delete
   * @param columnIndex - Index of the column to delete
   */
  const handleDeleteColumn = (columnId: string, columnIndex: number) => {
    // Don't allow deleting the select column (index 0)
    if (columnIndex === 0) return;
    
    // Remove the column from the columns array
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remove the column data from each task
    setTasks(prev => prev.map(task => {
      const newTask = {...task};
      delete newTask[columnId];
      return newTask;
    }));
  };

  /**
   * Render method for the DataTable component
   * Uses modular components for better maintainability and performance
   */
  return (
    // Main container with full width
    <div className="w-full">
      {/* Outer wrapper with relative positioning for scroll notification */}
      <div className="relative">
        {/* Scroll notification component for horizontal scrolling indication */}
        <ScrollNotification show={showScrollNotification} />
        
        {/* Table wrapper with horizontal scroll - Using inline-block to fix width to content */}
        <div 
          ref={tableRef}
          className="border border-gray-200 rounded-md bg-white shadow-sm overflow-x-auto inline-block"
          style={{ maxWidth: '100%' }} /* Ensures it doesn't exceed viewport width */
        >
        {/* Table container - w-max ensures it only takes the space it needs */}
        <div className="w-max table-fixed">
          {/* Table Header Component */}
          <TableHeader 
            columns={columns}
            allSelected={selectedTasks.size === tasks.length && tasks.length > 0}
            onSelectAll={handleSelectAll}
          />
          
          {/* Column Action Row - Provides column manipulation controls */}
          <ColumnActionRow
            columns={columns}
            onAddColumnLeft={handleAddColumnLeft}
            onAddColumnRight={handleAddColumnRight}
            onDeleteColumn={handleDeleteColumn}
          />

          {/* Table Body - Map through tasks to create rows */}
          {tasks.map(task => (
            <TableRow
              key={task.id}
              task={task}
              columns={columns}
              isSelected={selectedTasks.has(task.id)}
              onSelectTask={handleSelectTask}
              onAddColumn={handleAddColumn}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          
          {/* Add row button integrated into the table */}
          <div className="flex border-t border-gray-200">
            <div className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer" onClick={handleAddTask}>
              <div className="flex items-center justify-center text-blue-500">
                <span className="mr-1 font-medium">+</span> Add row
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DataTable;
