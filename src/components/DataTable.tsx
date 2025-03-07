/**
 * DataTable Component
 * 
 * A responsive data table for displaying and managing tasks with features like:
 * - Adding/removing tasks and columns
 * - Status and priority indicators
 * - Horizontal scrolling for many columns
 * - Excel/CSV data copy-paste with auto-expansion
 * - Undo/redo functionality with 1-step history
 * 
 * Dependencies:
 * - React (useState, useRef, useEffect) for component state management
 * - uuid for generating unique identifiers
 * - Custom components for modular UI structure
 * - Custom hooks for reusable logic
 * - Tailwind CSS for styling
 */

import { useState, useRef, useEffect } from 'react';
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

// Import icons for undo/redo
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

/**
 * Initial task data with predefined tasks for demonstration
 */
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    name: 'Quarterly launch',
    status: 'Done',
    priority: 'Low',
    startDate: '2025-02-17',
    deadline: '2025-02-20',
  },
  {
    id: uuidv4(),
    name: 'Customer research',
    status: 'In progress',
    priority: 'Medium',
    startDate: '2025-02-21',
    deadline: '2025-02-24',
  },
  {
    id: uuidv4(),
    name: 'Campaign analysis',
    status: 'To do',
    priority: 'High',
    startDate: '2025-02-25',
    deadline: '2025-02-28',
  },
];

/**
 * Notification component for paste operations
 * - Shows a temporary success message when paste operation completes
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const PasteNotification: React.FC<{ show: boolean; message: string }> = ({ show, message }) => {
  if (!show) return null;
  
  return (
    <div className="absolute top-0 right-0 m-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded shadow-md transition-opacity duration-300 opacity-90 z-50">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

/**
 * Shortcuts Help Dialog component
 * - Shows available keyboard shortcuts to the user
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ShortcutsDialog: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const shortcuts = [
    { key: 'Ctrl+V', description: 'Paste data from clipboard' },
    { key: 'Enter', description: 'Confirm edit and exit cell edit mode' },
    { key: 'Escape', description: 'Cancel edit and exit cell edit mode' },
    { key: 'Tab', description: 'Move to next cell' },
    { key: 'Shift+Tab', description: 'Move to previous cell' },
    { key: '?', description: 'Show this shortcuts dialog' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between py-1 border-b border-gray-100">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{shortcut.key}</span>
              <span className="text-sm text-gray-600">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Interface for history tracking
 * @interface HistoryEntry
 * @property {Task[]} tasks - Tasks state
 * @property {Column[]} columns - Columns state
 */
interface HistoryEntry {
  tasks: Task[];
  columns: Column[];
}

/**
 * Main DataTable component
 * Manages the state and rendering of the interactive data table
 */
const DataTable: React.FC = () => {
  // State for managing tasks and their selection
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // State for tracking the cell being edited 
  const [editingCell, setEditingCell] = useState<{taskId: string, columnId: string} | null>(null);
  
  // State for paste notification
  const [showPasteNotification, setShowPasteNotification] = useState(false);
  const [pasteNotificationMessage, setPasteNotificationMessage] = useState('');
  
  // State for shortcuts dialog
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  
  /**
   * State for columns with fixed width settings
   * - Each column has a fixed width to ensure consistency across the table
   * - The Select column is centered while all other columns are left-aligned
   * - Width values are chosen to accommodate the content in each column
   */
  const [columns, setColumns] = useState<Column[]>([
    // Select column with sufficient width for 'Deselect All' button
    { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
    { id: 'name', title: 'NAME', type: 'text', width: 'w-48', minWidth: 'min-w-[192px]' },
    { id: 'status', title: 'STATUS', type: 'status', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
    { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
  ]);
  
  /**
   * History state for undo/redo functionality
   * - past: the previous state (only one step)
   * - future: the next state after undo (only one step)
   */
  const [past, setPast] = useState<HistoryEntry | null>(null);
  const [future, setFuture] = useState<HistoryEntry | null>(null);
  
  // Reference for the table container
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the custom table resize hook to handle scroll notification
  const { showScrollNotification, setShowScrollNotification } = useTableResize(
    tableRef,
    [columns, tasks]
  );

  /**
   * Manually recalculates the table width
   * This function ensures the table width is maintained after state updates
   */
  const recalculateTableWidth = () => {
    setTimeout(() => {
      if (!tableRef.current || !tableRef.current.parentElement) return;
      
      const tableContainer = tableRef.current.firstChild as HTMLElement;
      if (!tableContainer) return;
      
      // Measure the width of the table content and its container
      const contentWidth = tableContainer.getBoundingClientRect().width;
      const containerWidth = tableRef.current.parentElement.clientWidth;
      
      // Force the table width to match the content width
      tableRef.current.style.width = `${contentWidth}px`;
      
      // Show scroll notification if needed
      if (contentWidth > containerWidth + 30) {
        setShowScrollNotification(true);
      }
    }, 0);
  };

  /**
   * Saves the current state to history before making changes
   */
  const saveToHistory = () => {
    setPast({
      tasks: JSON.parse(JSON.stringify(tasks)),
      columns: JSON.parse(JSON.stringify(columns))
    });
    setFuture(null);
  };

  /**
   * Handles undo action
   * Restores the previous state if available
   */
  const handleUndo = () => {
    if (past) {
      // Save current state to future
      setFuture({
        tasks: JSON.parse(JSON.stringify(tasks)),
        columns: JSON.parse(JSON.stringify(columns))
      });
      
      // Restore past state
      setTasks(past.tasks);
      setColumns(past.columns);
      
      // Clear past
      setPast(null);
      
      // Recalculate table width after state update
      recalculateTableWidth();
    }
  };

  /**
   * Handles redo action
   * Restores the future state if available
   */
  const handleRedo = () => {
    if (future) {
      // Save current state to past
      setPast({
        tasks: JSON.parse(JSON.stringify(tasks)),
        columns: JSON.parse(JSON.stringify(columns))
      });
      
      // Restore future state
      setTasks(future.tasks);
      setColumns(future.columns);
      
      // Clear future
      setFuture(null);
      
      // Recalculate table width after state update
      recalculateTableWidth();
    }
  };

  /**
   * Updates a task's value for a specific column
   * @param taskId - The unique identifier of the task
   * @param columnId - The identifier of the column being updated
   * @param value - The new value for the cell
   */
  const handleUpdateTask = (taskId: string, columnId: string, value: string) => {
    // Save current state to history before making changes
    saveToHistory();
    
    // Update using the original approach
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          [columnId]: value
        };
      }
      return task;
    }));
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

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
    // Save current state to history before making changes
    saveToHistory();
    
    const newTask: Task = {
      id: uuidv4(),
      name: '',
      status: '',
      priority: '',
      startDate: '',
      deadline: '',
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // Recalculate table width after state update
    recalculateTableWidth();
    
    // Return the new task for potential selection
    return newTask;
  };

  /**
   * Deletes a task from the table
   * @param taskId - The unique identifier of the task to delete
   */
  const handleDeleteTask = (taskId: string) => {
    // Save current state to history before making changes
    saveToHistory();
    
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Also remove from selected tasks if present
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    
    // Recalculate table width after state update
    recalculateTableWidth();
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
   * Handles paste events for the table
   * @param event - ClipboardEvent containing the pasted data
   */
  const handlePaste = (event: React.ClipboardEvent) => {
    // Prevent default paste behavior
    event.preventDefault();
    
    // Get clipboard data as text
    const clipboardData = event.clipboardData?.getData('text/plain') || '';
    
    if (clipboardData && editingCell) {
      // Process the clipboard data
      const parsedData = parseClipboardData(clipboardData);
      
      // Apply the data to the table
      applyPastedData(parsedData, editingCell.taskId, editingCell.columnId);
    }
  };

  /**
   * Shows a notification after paste operation
   * @param rowCount - Number of rows pasted
   * @param colCount - Number of columns pasted
   */
  const showPasteSuccessNotification = (rowCount: number, colCount: number) => {
    setPasteNotificationMessage(`Successfully pasted ${rowCount} × ${colCount} data`);
    setShowPasteNotification(true);
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
      setShowPasteNotification(false);
    }, 3000);
  };

  /**
   * Apply data pasted from clipboard
   * @param data - 2D array of strings from the clipboard
   * @param startTaskId - ID of the task where paste begins
   * @param startColumnId - ID of the column where paste begins
   */
  const applyPastedData = (data: string[][], startTaskId: string, startColumnId: string) => {
    // Save current state to history before making changes
    saveToHistory();
    
    // Skip if no data to paste
    if (data.length === 0 || data[0].length === 0) return;
    
    // Find starting indices
    const startRowIndex = tasks.findIndex(task => task.id === startTaskId);
    const startColumnIndex = columns.findIndex(column => column.id === startColumnId);
    
    // Skip if invalid starting position
    if (startRowIndex === -1 || startColumnIndex === -1) return;
    
    // Calculate required dimensions
    const requiredRows = startRowIndex + data.length;
    const requiredColumns = startColumnIndex + Math.max(...data.map(row => row.length));
    
    // Create a working copy of tasks to build upon
    let updatedTasks = [...tasks];
    let updatedColumns = [...columns];
    
    // Add new rows if needed
    while (updatedTasks.length < requiredRows) {
      const newTask: Task = {
        id: uuidv4(),
        name: 'New Task',
        status: 'To do',
        priority: 'Medium',
        startDate: 'Not set',
        deadline: 'Not set',
      };
      updatedTasks.push(newTask);
    }
    
    // Add new columns if needed
    while (updatedColumns.length < requiredColumns) {
      const newColumn = createNewColumn(`COLUMN ${updatedColumns.length}`);
      updatedColumns.push(newColumn);
      
      // Add the new column data to each task
      updatedTasks = updatedTasks.map(task => ({
        ...task,
        [newColumn.id]: 'New data',
      }));
    }
    
    // Update the tasks with pasted data
    data.forEach((rowData, rowOffset) => {
      const taskIndex = startRowIndex + rowOffset;
      if (taskIndex < updatedTasks.length) {
        rowData.forEach((cellValue, colOffset) => {
          const columnIndex = startColumnIndex + colOffset;
          if (columnIndex < updatedColumns.length) {
            const columnId = updatedColumns[columnIndex].id;
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              [columnId]: cellValue
            };
          }
        });
      }
    });
    
    // Update state
    setColumns(updatedColumns);
    setTasks(updatedTasks);
    
    // Show success notification
    const rowCount = data.length;
    const colCount = Math.max(...data.map(row => row.length));
    showPasteSuccessNotification(rowCount, colCount);
    
    // Clear editing cell after paste
    setEditingCell(null);
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

  /**
   * Adds a new column to the table at the right end
   */
  const handleAddColumn = () => {
    // Save current state to history before making changes
    saveToHistory();
    
    const newColumn = createNewColumn(`COLUMN ${columns.length}`);
    
    // Add the new column to the columns array
    setColumns(prev => [...prev, newColumn]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumn.id]: 'New data',
    })));
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

  /**
   * Adds a column to the left of the specified column index
   * @param columnIndex - Index of the column to add to the left of
   */
  const handleAddColumnLeft = (columnIndex: number) => {
    // Save current state to history before making changes
    saveToHistory();
    
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
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

  /**
   * Adds a column to the right of the specified column index
   * @param columnIndex - Index of the column to add to the right of
   */
  const handleAddColumnRight = (columnIndex: number) => {
    // Save current state to history before making changes
    saveToHistory();
    
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
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

  /**
   * Deletes a column from the table
   * @param columnId - ID of the column to delete
   * @param columnIndex - Index of the column to delete
   */
  const handleDeleteColumn = (columnId: string, columnIndex: number) => {
    // Skip if trying to delete the select column (first column)
    if (columnIndex === 0) return;
    
    // Save current state to history before making changes
    saveToHistory();
    
    // Remove the column from the columns array
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remove the column data from each task
    setTasks(prev => prev.map(task => {
      const newTask = {...task};
      delete newTask[columnId];
      return newTask;
    }));
    
    // Recalculate table width after state update
    recalculateTableWidth();
  };

  /**
   * Sets the currently editing cell
   * @param taskId - The unique identifier of the task
   * @param columnId - The identifier of the column being edited
   */
  const handleSetEditingCell = (taskId: string, columnId: string) => {
    setEditingCell({ taskId, columnId });
  };

  /**
   * Clears the currently editing cell
   */
  const handleClearEditingCell = () => {
    setEditingCell(null);
  };

  /**
   * Parses clipboard data into a structured format
   * @param clipboardText - Raw text from clipboard
   * @returns 2D array of values
   */
  const parseClipboardData = (clipboardText: string): string[][] => {
    // Split by newlines to get rows
    const rows = clipboardText.split(/\r?\n/).filter(row => row.trim() !== '');
    
    // Detect delimiter (tab for Excel, comma for CSV)
    const delimiter = rows[0].includes('\t') ? '\t' : ',';
    
    // Parse each row into columns
    return rows.map(row => row.split(delimiter));
  };

  // Setup keyboard event listeners for the whole component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if it's not coming from an input element
      const target = e.target as HTMLElement;
      const isInputElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT';
      
      // Show shortcuts dialog with "?" key
      if (e.key === '?' && !isInputElement) {
        setShowShortcutsDialog(true);
        e.preventDefault();
      }
      
      // Add support for keyboard navigation between cells
      if (editingCell && (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey))) {
        const { taskId, columnId } = editingCell;
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        const columnIndex = columns.findIndex(column => column.id === columnId);
        
        // Skip navigation from non-editable columns
        if (columnIndex === 0) return; // Skip from "select" column
        
        if (e.shiftKey) {
          // Move to previous cell
          if (columnIndex > 1) { // Skip "select" column
            // Move to previous column in same row
            const prevColumnId = columns[columnIndex - 1].id;
            if (prevColumnId !== 'select') {
              e.preventDefault();
              setEditingCell({ taskId, columnId: prevColumnId });
            }
          } else if (taskIndex > 0) {
            // Move to last column of previous row
            const prevRowTaskId = tasks[taskIndex - 1].id;
            const lastColumnId = columns[columns.length - 1].id;
            e.preventDefault();
            setEditingCell({ taskId: prevRowTaskId, columnId: lastColumnId });
          }
        } else {
          // Move to next cell
          if (columnIndex < columns.length - 1) {
            // Move to next column in same row
            const nextColumnId = columns[columnIndex + 1].id;
            e.preventDefault();
            setEditingCell({ taskId, columnId: nextColumnId });
          } else if (taskIndex < tasks.length - 1) {
            // Move to first editable column of next row
            const nextRowTaskId = tasks[taskIndex + 1].id;
            // Find first editable column (skip "select")
            const firstEditableColumnId = columns.find(col => col.id !== 'select')?.id || '';
            e.preventDefault();
            setEditingCell({ taskId: nextRowTaskId, columnId: firstEditableColumnId });
          } else {
            // At the last cell, add a new row and move to its first cell
            if (e.key === 'Tab') {
              e.preventDefault();
              const newTask = handleAddTask();
              if (newTask) {
                const firstEditableColumnId = columns.find(col => col.id !== 'select')?.id || '';
                setEditingCell({ taskId: newTask.id, columnId: firstEditableColumnId });
              }
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, tasks, columns]);

  /**
   * Render method for the DataTable component
   * Uses modular components for better maintainability and performance
   */
  return (
    <div className="flex flex-col">
      {/* Table actions row with undo/redo buttons */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          {/* Undo button */}
          <button 
            onClick={handleUndo}
            disabled={!past}
            className={`px-2 py-1 rounded flex items-center ${
              past ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
            }`}
            title={past ? "Undo last action" : "Nothing to undo"}
          >
            <ArrowUturnLeftIcon className="h-5 w-5 mr-1" />
            <span>Undo</span>
          </button>
          
          {/* Redo button */}
          <button 
            onClick={handleRedo}
            disabled={!future}
            className={`px-2 py-1 rounded flex items-center ${
              future ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
            }`}
            title={future ? "Redo last undone action" : "Nothing to redo"}
          >
            <ArrowUturnRightIcon className="h-5 w-5 mr-1" />
            <span>Redo</span>
          </button>
        </div>
      </div>
      
      {/* Main container with full width */}
      <div className="w-full">
        {/* Outer wrapper with relative positioning for scroll notification */}
        <div className="relative">
          {/* Scroll notification component for horizontal scrolling indication */}
          <ScrollNotification show={showScrollNotification} />
          
          {/* Paste notification component */}
          <PasteNotification 
            show={showPasteNotification} 
            message={pasteNotificationMessage} 
          />
          
          {/* Shortcuts dialog */}
          <ShortcutsDialog 
            isOpen={showShortcutsDialog} 
            onClose={() => setShowShortcutsDialog(false)} 
          />
          
          {/* Keyboard shortcuts help button */}
          <button 
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded z-10"
            onClick={() => setShowShortcutsDialog(true)}
            title="Show keyboard shortcuts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Table wrapper with horizontal scroll - Using inline-block to fix width to content */}
          <div 
            ref={tableRef}
            className="border border-gray-200 rounded-md bg-white shadow-sm overflow-x-auto inline-block"
            style={{ maxWidth: '100%' }} /* Ensures it doesn't exceed viewport width */
            onPaste={handlePaste} /* Handle paste events at the table level */
            tabIndex={0} /* Make the div focusable to receive keyboard events */
          >
            {/* Special paste instructions when a cell is being edited */}
            {editingCell && (
              <div className="absolute top-0 right-0 p-2 bg-blue-50 text-xs text-blue-600 border-l border-b border-blue-200 rounded-bl-md z-10">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste data from Excel/CSV with Ctrl+V
                </div>
              </div>
            )}
            
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
              {tasks.map((task, index) => (
                <TableRow
                  key={task.id}
                  task={task}
                  columns={columns}
                  isSelected={selectedTasks.has(task.id)}
                  onSelectTask={handleSelectTask}
                  onAddColumn={handleAddColumn}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  isLastRow={index === tasks.length - 1}
                  onSetEditingCell={handleSetEditingCell}
                  onClearEditingCell={handleClearEditingCell}
                  isEditing={editingCell?.taskId === task.id ? editingCell.columnId : null}
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
    </div>
  );
};

export default DataTable;
