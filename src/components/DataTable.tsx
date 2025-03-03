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
import AddRowButton from './AddRowButton';
import ScrollNotification from './ScrollNotification';

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
  
  // State for columns with responsive width settings
  const [columns, setColumns] = useState<Column[]>([
    // Select column with sufficient width for 'Deselect All' button
    { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
    { id: 'name', title: 'NAME', type: 'name', width: 'w-48', minWidth: 'min-w-[150px]' },
    { id: 'status', title: 'STATUS', type: 'status', width: 'w-32', minWidth: 'min-w-[100px]' },
    { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-32', minWidth: 'min-w-[100px]' },
    { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-32', minWidth: 'min-w-[120px]' },
    { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-32', minWidth: 'min-w-[120px]' },
  ]);
  
  // Reference to the table container for measuring available space
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the custom table resize hook to handle table width and scroll notification
  const { tableWidth, showScrollNotification } = useTableResize(
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
   * Adds a new column to the table
   */
  const handleAddColumn = () => {
    const newColumnId = `column${columns.length}`;
    const newColumn: Column = {
      id: newColumnId,
      title: `COLUMN ${columns.length}`,
      type: 'text',
      width: 'w-32',
      minWidth: 'min-w-[100px]',
    };
    
    // Add the new column to the columns array
    setColumns(prev => [...prev, newColumn]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumnId]: 'New data',
    })));
  };

  /**
   * Render method for the DataTable component
   * Uses modular components for better maintainability and performance
   */
  return (
    // Main container with full width
    <div className="w-full">
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
        </div>
      </div>
      
      {/* Add row button component below the table */}
      <AddRowButton 
        onAddRow={handleAddTask}
        tableWidth={tableWidth}
      />
    </div>
  );
};

export default DataTable;
