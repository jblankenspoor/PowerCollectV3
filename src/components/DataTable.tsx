/**
 * DataTable Component
 * 
 * A responsive data table for displaying and managing tasks with features like:
 * - Adding/removing tasks and columns
 * - Status and priority indicators
 * - Horizontal scrolling for many columns
 * 
 * Dependencies:
 * - React (useState, useEffect, useRef) for component state and lifecycle
 * - uuid for generating unique identifiers
 * - @heroicons/react for UI icons
 * - Tailwind CSS for styling
 */

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Define types for status and priority to ensure type safety
type Status = 'Done' | 'In progress' | 'To do';
type Priority = 'Low' | 'Medium' | 'High';

// Column interface defines the structure for table columns
interface Column {
  id: string;       // Unique identifier for the column
  title: string;    // Display title in the header
  type: 'name' | 'status' | 'priority' | 'date' | 'text' | 'select';  // Column data type
  width: string;    // CSS width class
  minWidth?: string; // Minimum width for responsive behavior
}

// Task interface defines the structure for task data
interface Task {
  id: string;       // Unique identifier for the task
  name: string;     // Task name
  status: Status;   // Current status
  priority: Priority; // Priority level
  startDate: string; // Start date as string
  deadline: string;  // Deadline as string
  [key: string]: string; // Allow dynamic properties for custom columns
}

// Initial task data
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
 * StatusBadge component displays a colored badge for task status
 * - Green for Done
 * - Yellow for In progress
 * - Red for To do
 */
const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  
  if (status === 'Done') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (status === 'In progress') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else { // To do
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  
  return (
    <span className={`inline-block px-2 py-1 rounded-md text-xs ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

/**
 * PriorityBadge component displays a colored badge for task priority
 * - Yellow for Low
 * - Orange for Medium
 * - Red for High
 */
const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  let bgColor = '';
  let textColor = '';
  
  if (priority === 'Low') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (priority === 'Medium') {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
  } else { // High
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  
  return (
    <span className={`inline-block px-2 py-1 rounded-md text-xs ${bgColor} ${textColor}`}>
      {priority}
    </span>
  );
};

/**
 * Main DataTable component
 * Manages the state and rendering of the interactive data table
 */
const DataTable: React.FC = () => {
  // State for managing tasks and their selection
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // State for columns with responsive width settings - adjusted to be narrower
  const [columns, setColumns] = useState<Column[]>([
    // Select column with sufficient width for 'Deselect All' button
    { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
    { id: 'name', title: 'NAME', type: 'name', width: 'w-48', minWidth: 'min-w-[150px]' },
    { id: 'status', title: 'STATUS', type: 'status', width: 'w-32', minWidth: 'min-w-[100px]' },
    { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-32', minWidth: 'min-w-[100px]' },
    { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-32', minWidth: 'min-w-[120px]' },
    { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-32', minWidth: 'min-w-[120px]' },
  ]);
  
  // State to track if horizontal scrolling is needed
  const [showScrollNotification, setShowScrollNotification] = useState(false);
  
  // Reference to the table container for measuring available space
  const tableRef = useRef<HTMLDivElement>(null);

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
   * Handles selecting or deselecting all tasks
   * @param selectAll - Whether to select or deselect all tasks
   */
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  /**
   * Removes a task from the table and from selection if selected
   * @param taskId - The unique identifier of the task to delete
   */
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  // Function to handle adding a new column
  const handleAddColumn = () => {
    const newColumnId = `column_${uuidv4()}`;
    const newColumn: Column = {
      id: newColumnId,
      title: 'New Column',
      type: 'text',
      width: 'w-32',
      minWidth: 'min-w-[120px]'
    };
    
    // Add the column definition
    setColumns([...columns, newColumn]);
    
    // Add empty values for the new column to all tasks
    setTasks(tasks.map(task => ({
      ...task,
      [newColumnId]: ''
    })));
  };

  /**
   * Adds a new task to the table with default values
   * Creates dates in Dutch format with the current date as start
   * and current date + 3 days as deadline
   */
  const handleAddTask = () => {
    const today = new Date();
    const newTask: Task = {
      id: uuidv4(),
      name: 'New Task',
      status: 'To do',
      priority: 'Medium',
      startDate: today.toLocaleDateString('nl-NL', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      deadline: new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    };
    setTasks([...tasks, newTask]);
  };

  // Effect to adjust table layout on window resize and ensure horizontal scrolling works
  useEffect(() => {
    const handleResize = () => {
      // Force table to recalculate its layout on resize
      if (tableRef.current && tableRef.current.parentElement) {
        // Get the actual width of content
        const tableContainer = tableRef.current.firstChild as HTMLElement;
        if (!tableContainer) return;
        
        // Set the width of the outer container to match its content
        // This ensures no extra whitespace is displayed
        const contentWidth = tableContainer.getBoundingClientRect().width;
        tableRef.current.style.width = `${contentWidth}px`;
        
        // Ensure scrollbar appears when needed
        const containerWidth = tableRef.current.parentElement.clientWidth || 0;
        
        if (contentWidth > containerWidth) {
          tableRef.current.parentElement.classList.add('overflow-x-auto');
          setShowScrollNotification(true);
        } else {
          setShowScrollNotification(false);
        }
      }
    };
    
    // Initial setup
    setTimeout(handleResize, 100); // Slight delay to ensure DOM is ready
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns.length]); // Re-run when columns change
  
  // Effect to handle scroll events and hide notification after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (showScrollNotification && tableRef.current?.parentElement) {
        // Hide notification after user has scrolled horizontally
        const scrollLeft = tableRef.current.parentElement.scrollLeft;
        if (scrollLeft > 50) {
          setShowScrollNotification(false);
        }
      }
    };
    
    // Add scroll listener to the table's parent element
    const parentElement = tableRef.current?.parentElement;
    if (parentElement) {
      parentElement.addEventListener('scroll', handleScroll);
      return () => parentElement.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollNotification]);

  return (
    // Main container with full width
    <div className="w-full">
      {/* Scroll notification - appears when horizontal scrolling is needed */}
      {showScrollNotification && (
        <div className="flex justify-end mb-2">
          <div className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md animate-pulse inline-flex items-center">
            <span>Scroll right to see more columns</span>
            <span className="ml-1 text-lg">→</span>
          </div>
        </div>
      )}
      {/* Table wrapper with horizontal scroll - Using inline-block to fix width to content */}
      <div 
        ref={tableRef}
        className="border border-gray-200 rounded-md bg-white shadow-sm overflow-x-auto inline-block"
        style={{ maxWidth: '100%' }} /* Ensures it doesn't exceed viewport width */
      >
        {/* Table container - w-max ensures it only takes the space it needs */}
        <div className="w-max table-fixed">
          {/* Table Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {/* First cell is for Select All button */}
            <div className={`${columns[0].width} ${columns[0].minWidth || ''} p-4 flex justify-center items-center`}>
              <button
                onClick={() => handleSelectAll(selectedTasks.size < tasks.length)}
                className="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {/* Map through columns to create header cells (skip the first select column as we handle it separately) */}
            {columns.slice(1).map(column => (
              <div 
                key={column.id} 
                className={`${column.width} ${column.minWidth || ''} p-4 flex items-center font-medium text-gray-500 text-sm whitespace-nowrap`}
              >
                {column.title}
              </div>
            ))}
            {/**
             * Action buttons header container
             * - Contains space for the add column and delete buttons that will appear in rows
             * - Fixed width ensures consistent layout
             * - flex-shrink-0 prevents it from collapsing when space is limited
             */}
            <div className="w-[100px] flex-shrink-0 flex items-center justify-center border-l border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-500">ACTIONS</span>
            </div>
          </div>

          {/* Table Body */}
          {tasks.map(task => (
            <div key={task.id} className="group relative">
              {/* Row content with trash can */}
              <div className="flex border-b border-gray-200">
                {/* First cell for checkbox */}
                <div 
                  className={`${columns[0].width} ${columns[0].minWidth || ''} p-4 flex-shrink-0 flex justify-center items-center hover:bg-blue-50/80 overflow-hidden`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                {/* Map through remaining columns to create cells for this row */}
                {columns.slice(1).map(column => (
                  <div 
                    key={column.id} 
                    className={`${column.width} ${column.minWidth || ''} p-4 flex-shrink-0 flex items-center hover:bg-blue-50/80 overflow-hidden`}
                  >
                    {column.type === 'status' ? (
                      <StatusBadge status={task[column.id] as Status} />
                    ) : column.type === 'priority' ? (
                      <PriorityBadge priority={task[column.id] as Priority} />
                    ) : task[column.id]}
                  </div>
                ))}
                {/**
                 * Action buttons container
                 * - Contains both add column and delete buttons next to each other
                 * - Fixed width ensures consistent layout
                 * - flex-shrink-0 prevents it from collapsing when space is limited
                 * - border-l provides visual separation from data cells
                 */}
                <div className="w-[100px] bg-gray-50 border-l border-gray-200 flex-shrink-0 flex items-center justify-center gap-2">
                  {/**
                   * Add column button
                   * - Triggers handleAddColumn function when clicked
                   * - Positioned next to the delete button for better UX
                   * - Uses subtle hover effect for better user feedback
                   */}
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors duration-200 rounded-md"
                    aria-label="Add column"
                    title="Add column"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                  
                  {/**
                   * Delete task button
                   * - Triggers handleDeleteTask function when clicked
                   * - Positioned next to the add column button
                   * - Uses red hover color to indicate destructive action
                   */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors duration-200 rounded-md"
                    aria-label="Delete task"
                    title="Delete row"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Task Button */}
          {/* Add task button at the bottom of the table */}
          <div className="flex w-full">
            <button
              onClick={handleAddTask}
              className="flex-1 flex justify-center items-center p-4 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Add task"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            {/* Add a spacer to ensure proper alignment with the action buttons */}
            <div className="w-[100px] bg-gray-50 border-t border-gray-200 shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
