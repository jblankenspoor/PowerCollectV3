/**
 * DataTable Component
 * 
 * A responsive data table for displaying and managing tasks with features like:
 * - Adding/removing tasks and columns
 * - Status and priority indicators
 * - Horizontal scrolling for many columns
 * - Excel/CSV data copy-paste with auto-expansion
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
import { Column, Task, CellCoordinate, SelectionRange, CellIdentifier, HistoryState, ActionType } from '../types/dataTypes';

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
 * Notification component for copy operations
 * - Shows a temporary success message when copy operation completes
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const CopyNotification: React.FC<{ show: boolean; message: string }> = ({ show, message }) => {
  if (!show) return null;
  
  return (
    <div className="absolute top-14 right-0 m-4 p-3 bg-blue-100 border border-blue-200 text-blue-800 rounded shadow-md transition-opacity duration-300 opacity-90 z-50">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

/**
 * Notification component for undo/redo operations
 * - Shows a temporary success message when undo/redo operation completes
 * - Includes timestamp and action details for better tracking
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const UndoRedoNotification: React.FC<{ 
  show: boolean; 
  message: string;
  timestamp?: string;
  actionType?: string;
  success?: boolean;
}> = ({ show, message, timestamp, actionType, success = true }) => {
  if (!show) return null;
  
  const statusColor = success ? 'bg-purple-100 border-purple-200 text-purple-800' : 'bg-red-100 border-red-200 text-red-800';
  
  return (
    <div className={`absolute top-28 right-0 m-4 p-3 ${statusColor} rounded shadow-md transition-opacity duration-300 opacity-90 z-50`}>
      <div className="flex items-center">
        {success ? (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <div>
          <div className="font-medium">{message}</div>
          {(timestamp || actionType) && (
            <div className="text-xs mt-1 opacity-80">
              {actionType && <span className="bg-white bg-opacity-30 px-1 py-0.5 rounded">{actionType}</span>}
              {timestamp && <span className="ml-1">{timestamp}</span>}
            </div>
          )}
        </div>
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
    { key: 'Ctrl+V / Cmd+V', description: 'Paste data from clipboard' },
    { key: 'Ctrl+C / Cmd+C', description: 'Copy selected cells to clipboard' },
    { key: 'Ctrl+Z / Cmd+Z', description: 'Undo last action' },
    { key: 'Ctrl+Y / Cmd+Y', description: 'Redo previously undone action' },
    { key: 'Drag mouse', description: 'Select range of cells' },
    { key: 'Enter', description: 'Confirm edit and exit cell edit mode' },
    { key: 'Escape', description: 'Cancel edit or clear selection' },
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
 * UndoRedoToolbar component
 * - Provides buttons for undo and redo operations
 * - Shows history information in tooltips
 * 
 * @param props - Component props
 * @returns {JSX.Element} Rendered component
 */
const UndoRedoToolbar: React.FC<{ 
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoTooltip: string;
  redoTooltip: string;
}> = ({ canUndo, canRedo, onUndo, onRedo, undoTooltip, redoTooltip }) => {
  return (
    <div className="absolute top-2 left-32 p-1 bg-white border border-gray-200 rounded shadow-sm z-10 flex items-center space-x-1">
      <div className="relative group">
        <button 
          className={`p-1.5 rounded flex items-center justify-center ${
            canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
          }`}
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
            {undoTooltip}
          </div>
          <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -ml-1"></div>
        </div>
      </div>
      
      <div className="relative group">
        <button 
          className={`p-1.5 rounded flex items-center justify-center ${
            canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
          }`}
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block">
          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
            {redoTooltip}
          </div>
          <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -ml-1"></div>
        </div>
      </div>
    </div>
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
  
  // State for columns with fixed width settings
  const [columns, setColumns] = useState<Column[]>([
    // Select column with sufficient width for 'Deselect All' button
    { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
    { id: 'name', title: 'NAME', type: 'text', width: 'w-48', minWidth: 'min-w-[192px]' },
    { id: 'status', title: 'STATUS', type: 'status', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-36', minWidth: 'min-w-[144px]' },
    { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
    { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
  ]);
  
  // State for tracking the cell being edited 
  const [editingCell, setEditingCell] = useState<CellIdentifier | null>(null);
  
  // State for paste notification
  const [showPasteNotification, setShowPasteNotification] = useState(false);
  const [pasteNotificationMessage, setPasteNotificationMessage] = useState('');
  
  // State for shortcuts dialog
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // State for cell selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [copyNotificationMessage, setCopyNotificationMessage] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  // State for the undo/redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [undoNotificationMessage, setUndoNotificationMessage] = useState('');
  const [undoNotificationTimestamp, setUndoNotificationTimestamp] = useState('');
  const [undoNotificationActionType, setUndoNotificationActionType] = useState('');
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [undoNotificationSuccess, setUndoNotificationSuccess] = useState(true);
  
  // Flag to prevent history recording while performing undo/redo
  const isUndoRedoOperationRef = useRef(false);
  
  // Store the current tasks and columns for proper history recording
  const tasksRef = useRef<Task[]>([]);
  const columnsRef = useRef<Column[]>([]);
  
  // Update refs when state changes
  useEffect(() => {
    tasksRef.current = tasks;
    columnsRef.current = columns;
  }, [tasks, columns]);
  
  // Generate a unique action ID for history entries
  const generateActionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Reference for the table container
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the custom table resize hook to handle scroll notification
  const { showScrollNotification } = useTableResize(
    tableRef,
    [columns, tasks]
  );

  /**
   * Records an action to the history stack with unique timestamp
   * @param description - Description of the action
   * @param type - Type of action performed
   * @param beforeState - Optional state before the action
   * @param afterState - Optional state after the action
   */
  const recordAction = (
    description: string, 
    type: ActionType, 
    beforeState?: { tasks?: Task[], columns?: Column[] },
    afterState?: { tasks?: Task[], columns?: Column[] }
  ) => {
    // Skip recording if we're in the middle of an undo/redo operation
    if (isUndoRedoOperationRef.current) return;
    
    try {
      // Generate timestamp with high precision
      const now = new Date();
      const actionId = generateActionId();
      const formattedTime = now.toISOString();
      
      console.log(`Recording action: ${description} [${type}] with ID ${actionId}`);
      
      // Determine the states to save
      const tasksBeforeAction = beforeState?.tasks || tasksRef.current;
      const columnsBeforeAction = beforeState?.columns || columnsRef.current;
      
      const tasksAfterAction = afterState?.tasks || tasks;
      const columnsAfterAction = afterState?.columns || columns;
      
      // Create new history entry
      const newEntry: HistoryState = {
        tasks: JSON.parse(JSON.stringify(tasksAfterAction)),
        columns: JSON.parse(JSON.stringify(columnsAfterAction)),
        tasksBefore: JSON.parse(JSON.stringify(tasksBeforeAction)),
        columnsBefore: JSON.parse(JSON.stringify(columnsBeforeAction)),
        timestamp: now.getTime(),
        description,
        actionType: type,
        actionId,
        formattedTime
      };
      
      // Update history state immediately using functional updates
      setHistory(prevHistory => {
        // Get only the history up to the current index
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        return [...newHistory, newEntry];
      });
      
      // Update the history index
      setHistoryIndex(prevIndex => prevIndex + 1);
      
      // Log for debugging
      console.log(`Recorded action: ${description} [${type}] at ${formattedTime} with ID ${actionId}`);
    } catch (error) {
      console.error('Error recording action:', error);
      showUndoRedoNotification(`Error recording action: ${description}`, 'ERROR', false);
    }
  };

  /**
   * Shows a notification after undo/redo operation
   * @param message - Notification message
   * @param actionType - Type of action performed
   * @param success - Whether the operation was successful
   */
  const showUndoRedoNotification = (message: string, actionType?: string, success: boolean = true) => {
    try {
      const timestamp = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
      
      // Cancel any existing notification hide timeouts
      if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
      }
      
      setUndoNotificationMessage(message);
      setUndoNotificationTimestamp(timestamp);
      setUndoNotificationActionType(actionType || '');
      setUndoNotificationSuccess(success);
      setShowUndoNotification(true);
      
      // Hide the notification after 4 seconds
      window.notificationTimeout = setTimeout(() => {
        setShowUndoNotification(false);
      }, 4000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  /**
   * Gets tooltip text for undo button
   */
  const getUndoTooltip = () => {
    if (historyIndex <= 0) return "Nothing to undo";
    const prevAction = history[historyIndex];
    const time = prevAction.formattedTime ? 
      new Date(prevAction.formattedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) :
      '';
    return `Undo: ${prevAction.description} (${time})`;
  };

  /**
   * Gets tooltip text for redo button
   */
  const getRedoTooltip = () => {
    if (historyIndex >= history.length - 1) return "Nothing to redo";
    const nextAction = history[historyIndex + 1];
    const time = nextAction.formattedTime ? 
      new Date(nextAction.formattedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) :
      '';
    return `Redo: ${nextAction.description} (${time})`;
  };

  /**
   * Performs an undo operation
   */
  const handleUndo = () => {
    if (historyIndex > 0) {
      try {
        // Set flag to prevent recording during undo
        isUndoRedoOperationRef.current = true;
        
        // Get the previous state
        const prevIndex = historyIndex - 1;
        const prevState = history[prevIndex];
        const currentState = history[historyIndex];
        
        console.log(`Undoing action: ${currentState.description} [${currentState.actionType}] with ID ${currentState.actionId}`);
        
        // Apply the previous state
        const prevTasks = JSON.parse(JSON.stringify(prevState.tasks));
        const prevColumns = JSON.parse(JSON.stringify(prevState.columns));
        
        // Update state
        setTasks(prevTasks);
        setColumns(prevColumns);
        setHistoryIndex(prevIndex);
        
        // Show notification with timestamp and action type
        showUndoRedoNotification(
          `Undone: ${currentState.description}`, 
          currentState.actionType,
          true
        );
        
        // Clear any selection
        clearSelection();
        
        // Reset the flag after state updates
        setTimeout(() => {
          isUndoRedoOperationRef.current = false;
        }, 50);
        
        console.log(`Undo complete for: ${currentState.description} [${currentState.actionType}]`);
      } catch (error) {
        console.error('Error performing undo:', error);
        isUndoRedoOperationRef.current = false;
        
        // Show error notification
        showUndoRedoNotification('Error performing undo operation', 'ERROR', false);
      }
    }
  };

  /**
   * Performs a redo operation
   */
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      try {
        // Set flag to prevent recording during redo
        isUndoRedoOperationRef.current = true;
        
        // Get the next state
        const nextIndex = historyIndex + 1;
        const nextState = history[nextIndex];
        
        console.log(`Redoing action: ${nextState.description} [${nextState.actionType}] with ID ${nextState.actionId}`);
        
        // Apply the next state
        const nextTasks = JSON.parse(JSON.stringify(nextState.tasks));
        const nextColumns = JSON.parse(JSON.stringify(nextState.columns));
        
        // Update state
        setTasks(nextTasks);
        setColumns(nextColumns);
        setHistoryIndex(nextIndex);
        
        // Show notification with timestamp and action type
        showUndoRedoNotification(
          `Redone: ${nextState.description}`, 
          nextState.actionType,
          true
        );
        
        // Clear any selection
        clearSelection();
        
        // Reset the flag after state updates
        setTimeout(() => {
          isUndoRedoOperationRef.current = false;
        }, 50);
        
        console.log(`Redo complete for: ${nextState.description} [${nextState.actionType}]`);
      } catch (error) {
        console.error('Error performing redo:', error);
        isUndoRedoOperationRef.current = false;
        
        // Show error notification
        showUndoRedoNotification('Error performing redo operation', 'ERROR', false);
      }
    }
  };

  /**
   * Updates a task's value for a specific column
   * @param taskId - The unique identifier of the task
   * @param columnId - The identifier of the column being updated
   * @param value - The new value for the cell
   * @param recordHistory - Whether to record this change in history (default: true)
   */
  const handleUpdateTask = (taskId: string, columnId: string, value: string, recordHistory = true) => {
    const oldTask = tasks.find(task => task.id === taskId);
    const oldValue = oldTask ? oldTask[columnId] : '';
    
    // Skip if value hasn't changed
    if (oldValue === value) return;
    
    // Save the state before the update
    const tasksBefore = [...tasks];
    
    // Update the state
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          [columnId]: value
        };
      }
      return task;
    }));
    
    // Record action in history after the update
    if (recordHistory && !isUndoRedoOperationRef.current && oldTask) {
      // Get column title for better description
      const column = columns.find(col => col.id === columnId);
      const columnTitle = column ? column.title : columnId;
      
      // Get task name for better description
      const taskName = oldTask ? oldTask.name : taskId;
      
      // Wait for state update to complete
      setTimeout(() => {
        recordAction(
          `Edit ${columnTitle} of "${taskName}"`, 
          ActionType.EDIT_CELL,
          { tasks: tasksBefore }
        );
      }, 0);
    }
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
   * @returns The newly created task
   */
  const handleAddTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      name: 'New Row',
      status: 'To do',
      priority: 'Medium',
      startDate: 'Not set',
      deadline: 'Not set',
    };
    
    // Save current state before modification
    const oldTasks = [...tasks];
    
    // Update state
    setTasks(prev => [...prev, newTask]);
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Add new row`, ActionType.ADD_ROW, { tasks: oldTasks });
    }
    
    return newTask;
  };

  /**
   * Deletes a task from the table
   * @param taskId - The unique identifier of the task to delete
   */
  const handleDeleteTask = (taskId: string) => {
    // Find task before deletion for history recording
    const taskToDelete = tasks.find(task => task.id === taskId);
    const taskName = taskToDelete ? taskToDelete.name : taskId;
    
    // Save current state before modification
    const oldTasks = [...tasks];
    const oldSelectedTasks = new Set(selectedTasks);
    
    // Update state
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Delete row "${taskName}"`, ActionType.DELETE_ROW, { tasks: oldTasks });
    }
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
    // Save current state before modification
    const oldColumns = [...columns];
    const oldTasks = [...tasks];
    
    const newColumn = createNewColumn(`COLUMN ${columns.length}`);
    
    // Add the new column to the columns array
    setColumns(prev => [...prev, newColumn]);
    
    // Add the new column data to each task
    setTasks(prev => prev.map(task => ({
      ...task,
      [newColumn.id]: 'New data',
    })));
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Add column "${newColumn.title}"`, ActionType.ADD_COLUMN, { columns: oldColumns, tasks: oldTasks });
    }
  };

  /**
   * Adds a column to the left of the specified column index
   * @param columnIndex - Index of the column to add to the left of
   */
  const handleAddColumnLeft = (columnIndex: number) => {
    // Save current state before modification
    const oldColumns = [...columns];
    const oldTasks = [...tasks];
    
    const newColumn = createNewColumn(`COLUMN L${columnIndex}`);
    
    // Get the reference column for better description
    const referenceColumn = columns[columnIndex];
    const referenceColumnTitle = referenceColumn ? referenceColumn.title : `column ${columnIndex}`;
    
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
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Add column "${newColumn.title}" to the left of "${referenceColumnTitle}"`, ActionType.ADD_COLUMN, { columns: oldColumns, tasks: oldTasks });
    }
  };

  /**
   * Adds a column to the right of the specified column index
   * @param columnIndex - Index of the column to add to the right of
   */
  const handleAddColumnRight = (columnIndex: number) => {
    // Save current state before modification
    const oldColumns = [...columns];
    const oldTasks = [...tasks];
    
    const newColumn = createNewColumn(`COLUMN R${columnIndex}`);
    
    // Get the reference column for better description
    const referenceColumn = columns[columnIndex];
    const referenceColumnTitle = referenceColumn ? referenceColumn.title : `column ${columnIndex}`;
    
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
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Add column "${newColumn.title}" to the right of "${referenceColumnTitle}"`, ActionType.ADD_COLUMN, { columns: oldColumns, tasks: oldTasks });
    }
  };

  /**
   * Deletes a column from the table
   * @param columnId - ID of the column to delete
   * @param columnIndex - Index of the column to delete
   */
  const handleDeleteColumn = (columnId: string, columnIndex: number) => {
    // Don't allow deleting the select column (index 0)
    if (columnIndex === 0) return;
    
    // Save current state before modification
    const oldColumns = [...columns];
    const oldTasks = [...tasks];
    
    // Find column before deletion for history recording
    const columnToDelete = columns.find(col => col.id === columnId);
    const columnTitle = columnToDelete ? columnToDelete.title : columnId;
    
    // Remove the column from the columns array
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remove the column data from each task
    setTasks(prev => prev.map(task => {
      const newTask = {...task};
      delete newTask[columnId];
      return newTask;
    }));
    
    // Record action in history
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Delete column "${columnTitle}"`, ActionType.DELETE_COLUMN, { columns: oldColumns, tasks: oldTasks });
    }
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
   * Converts task ID and column ID to row and column indices
   * @param taskId - The task ID to convert
   * @param columnId - The column ID to convert
   * @returns The corresponding cell coordinate
   */
  const getCellCoordinate = (taskId: string, columnId: string): CellCoordinate | null => {
    const rowIndex = tasks.findIndex(task => task.id === taskId);
    const columnIndex = columns.findIndex(column => column.id === columnId);
    
    if (rowIndex === -1 || columnIndex === -1) return null;
    
    return { rowIndex, columnIndex };
  };

  /**
   * Converts row and column indices to task ID and column ID
   * @param rowIndex - The row index to convert
   * @param columnIndex - The column index to convert
   * @returns The corresponding cell identifier
   */
  const getCellIdentifier = (rowIndex: number, columnIndex: number): CellIdentifier | null => {
    if (rowIndex < 0 || rowIndex >= tasks.length || 
        columnIndex < 0 || columnIndex >= columns.length) {
      return null;
    }
    
    return {
      taskId: tasks[rowIndex].id,
      columnId: columns[columnIndex].id
    };
  };

  /**
   * Starts cell selection process
   * @param taskId - The task ID where selection starts
   * @param columnId - The column ID where selection starts
   */
  const handleStartSelection = (taskId: string, columnId: string) => {
    const coordinate = getCellCoordinate(taskId, columnId);
    if (!coordinate) return;

    // Don't start selection on the select column
    if (columnId === 'select') return;
    
    setSelectionRange({
      start: coordinate,
      end: coordinate
    });
    setIsSelecting(true);
  };

  /**
   * Updates the selection range as the user drags
   * @param taskId - The current task ID under the mouse
   * @param columnId - The current column ID under the mouse
   */
  const handleUpdateSelection = (taskId: string, columnId: string) => {
    if (!isSelecting || !selectionRange) return;
    
    const coordinate = getCellCoordinate(taskId, columnId);
    if (!coordinate) return;

    // Don't include the select column in the selection
    if (columnId === 'select') return;
    
    setSelectionRange({
      ...selectionRange,
      end: coordinate
    });
  };

  /**
   * Ends the selection process
   */
  const handleEndSelection = () => {
    setIsSelecting(false);
  };

  /**
   * Clears the current selection
   */
  const clearSelection = () => {
    setSelectionRange(null);
  };

  /**
   * Checks if a cell is within the current selection range
   * @param taskId - The task ID to check
   * @param columnId - The column ID to check
   * @returns True if the cell is selected
   */
  const isCellSelected = (taskId: string, columnId: string): boolean => {
    if (!selectionRange) return false;
    
    const coordinate = getCellCoordinate(taskId, columnId);
    if (!coordinate) return false;
    
    const { start, end } = selectionRange;
    
    // Calculate the actual range boundaries
    const minRow = Math.min(start.rowIndex, end.rowIndex);
    const maxRow = Math.max(start.rowIndex, end.rowIndex);
    const minCol = Math.min(start.columnIndex, end.columnIndex);
    const maxCol = Math.max(start.columnIndex, end.columnIndex);
    
    // Check if the cell is within the range
    return (
      coordinate.rowIndex >= minRow && 
      coordinate.rowIndex <= maxRow && 
      coordinate.columnIndex >= minCol && 
      coordinate.columnIndex <= maxCol
    );
  };

  /**
   * Extracts data from the current selection range
   * @returns 2D array of selected cell values
   */
  const extractSelectedData = (): string[][] => {
    if (!selectionRange) return [];
    
    const { start, end } = selectionRange;
    
    // Calculate the actual range boundaries
    const minRow = Math.min(start.rowIndex, end.rowIndex);
    const maxRow = Math.max(start.rowIndex, end.rowIndex);
    const minCol = Math.min(start.columnIndex, end.columnIndex);
    const maxCol = Math.max(start.columnIndex, end.columnIndex);
    
    // Extract data from the range
    const data: string[][] = [];
    
    for (let i = minRow; i <= maxRow; i++) {
      const row: string[] = [];
      for (let j = minCol; j <= maxCol; j++) {
        // Skip select column
        if (columns[j].id === 'select') continue;
        
        const cellValue = tasks[i][columns[j].id] || '';
        row.push(cellValue);
      }
      data.push(row);
    }
    
    return data;
  };

  /**
   * Shows a notification after copy operation
   * @param rowCount - Number of rows copied
   * @param colCount - Number of columns copied
   */
  const showCopySuccessNotification = (rowCount: number, colCount: number) => {
    setCopyNotificationMessage(`Successfully copied ${rowCount} × ${colCount} cells to clipboard`);
    setShowCopyNotification(true);
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
      setShowCopyNotification(false);
    }, 3000);
  };

  /**
   * Handles copying selected data to the clipboard
   */
  const handleCopy = () => {
    if (!selectionRange) return;
    
    // Extract data from selected range
    const data = extractSelectedData();
    if (data.length === 0 || data[0].length === 0) return;
    
    // Convert to TSV format for Excel compatibility
    const tsvData = data.map(row => row.join('\t')).join('\n');
    
    // Write to clipboard using Clipboard API
    navigator.clipboard.writeText(tsvData)
      .then(() => {
        showCopySuccessNotification(data.length, data[0].length);
        // Clear selection after successful copy
        clearSelection();
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
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
   * Apply pasted data to the table, expanding as needed
   * @param data - 2D array of values from clipboard
   * @param startTaskId - ID of the task where paste begins
   * @param startColumnId - ID of the column where paste begins
   */
  const applyPastedData = (data: string[][], startTaskId: string, startColumnId: string) => {
    // Skip if no data to paste
    if (data.length === 0 || data[0].length === 0) return;
    
    // Find starting indices
    const startRowIndex = tasks.findIndex(task => task.id === startTaskId);
    const startColumnIndex = columns.findIndex(column => column.id === startColumnId);
    
    // Skip if invalid starting position
    if (startRowIndex === -1 || startColumnIndex === -1) return;
    
    // Save current state before modification
    const originalTasks = JSON.parse(JSON.stringify(tasks));
    const originalColumns = JSON.parse(JSON.stringify(columns));
    
    // Calculate required dimensions
    const requiredRows = startRowIndex + data.length;
    const requiredColumns = startColumnIndex + Math.max(...data.map(row => row.length));
    
    // Create a working copy of tasks to build upon
    let updatedTasks = [...tasks];
    let updatedColumns = [...columns];
    
    // Track if we added new rows or columns
    let addedRows = 0;
    let addedColumns = 0;
    
    // Add new rows if needed
    while (updatedTasks.length < requiredRows) {
      const newTask: Task = {
        id: uuidv4(),
        name: 'New Row',
        status: 'To do',
        priority: 'Medium',
        startDate: 'Not set',
        deadline: 'Not set',
      };
      updatedTasks.push(newTask);
      addedRows++;
    }
    
    // Add new columns if needed
    while (updatedColumns.length < requiredColumns) {
      const newColumn = createNewColumn(`COLUMN ${updatedColumns.length}`);
      updatedColumns.push(newColumn);
      addedColumns++;
      
      // Add the new column data to each task
      updatedTasks = updatedTasks.map(task => ({
        ...task,
        [newColumn.id]: 'New data',
      }));
    }
    
    // First update columns if needed (as a separate action)
    if (addedColumns > 0) {
      setColumns(updatedColumns);
      
      // Record column addition as a separate action
      if (!isUndoRedoOperationRef.current) {
        recordAction(`Add ${addedColumns} new column${addedColumns > 1 ? 's' : ''} for pasted data`, ActionType.ADD_COLUMN, { 
          columns: originalColumns,
          tasks: originalTasks 
        });
      }
    }
    
    // Then add rows if needed (as a separate action)
    if (addedRows > 0) {
      setTasks(updatedTasks);
      
      // Record row addition as a separate action
      if (!isUndoRedoOperationRef.current) {
        recordAction(`Add ${addedRows} new row${addedRows > 1 ? 's' : ''} for pasted data`, ActionType.ADD_ROW, {
          columns: updatedColumns,
          tasks: originalTasks
        });
      }
    }
    
    // Finally, update the tasks with pasted data (as a separate action)
    let updatedTasksWithPastedData = [...updatedTasks];
    data.forEach((rowData, rowOffset) => {
      const taskIndex = startRowIndex + rowOffset;
      if (taskIndex < updatedTasksWithPastedData.length) {
        rowData.forEach((cellValue, colOffset) => {
          const columnIndex = startColumnIndex + colOffset;
          if (columnIndex < updatedColumns.length) {
            const columnId = updatedColumns[columnIndex].id;
            updatedTasksWithPastedData[taskIndex] = {
              ...updatedTasksWithPastedData[taskIndex],
              [columnId]: cellValue
            };
          }
        });
      }
    });
    
    // Update state with pasted data
    setTasks(updatedTasksWithPastedData);
    
    // Show success notification
    const rowCount = data.length;
    const colCount = Math.max(...data.map(row => row.length));
    showPasteSuccessNotification(rowCount, colCount);
    
    // Record paste action separately
    if (!isUndoRedoOperationRef.current) {
      recordAction(`Paste ${rowCount}×${colCount} data values`, ActionType.PASTE, {
        columns: updatedColumns,
        tasks: addedRows > 0 ? updatedTasks : originalTasks
      });
    }
    
    // Clear editing cell after paste
    setEditingCell(null);
  };

  // Initialize history with initial state
  useEffect(() => {
    if (history.length === 0 && tasks.length > 0) {
      try {
        console.log('Initializing history with initial state');
        
        // Create initial history entry
        const now = new Date();
        const initialState: HistoryState = {
          tasks: JSON.parse(JSON.stringify(tasks)),
          columns: JSON.parse(JSON.stringify(columns)),
          tasksBefore: JSON.parse(JSON.stringify(tasks)),
          columnsBefore: JSON.parse(JSON.stringify(columns)),
          timestamp: now.getTime(),
          description: "Initial state",
          actionType: ActionType.INITIAL,
          actionId: generateActionId(),
          formattedTime: now.toISOString()
        };
        
        setHistory([initialState]);
        setHistoryIndex(0);
        
        console.log('History initialized with initial state');
      } catch (error) {
        console.error('Error initializing history:', error);
      }
    }
  }, [tasks, columns, history.length]);

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
      
      // Copy selected data with Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isInputElement) {
        e.preventDefault();
        handleCopy();
      }
      
      // Undo with Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !isInputElement) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo with Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Clear selection with Escape
      if (e.key === 'Escape' && !isInputElement && !editingCell) {
        e.preventDefault();
        clearSelection();
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
    
    // Add mouse up listener to end selection
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleEndSelection();
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [editingCell, tasks, columns, isSelecting, selectionRange, historyIndex, history]);

  // Clear any pending timeouts when unmounting
  useEffect(() => {
    return () => {
      if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
      }
    };
  }, []);

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
        
        {/* Paste notification component */}
        <PasteNotification 
          show={showPasteNotification} 
          message={pasteNotificationMessage} 
        />
        
        {/* Copy notification component */}
        <CopyNotification 
          show={showCopyNotification} 
          message={copyNotificationMessage} 
        />
        
        {/* Undo/Redo notification component */}
        <UndoRedoNotification 
          show={showUndoNotification} 
          message={undoNotificationMessage}
          timestamp={undoNotificationTimestamp}
          actionType={undoNotificationActionType}
          success={undoNotificationSuccess}
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
        
        {/* Undo/Redo toolbar */}
        <UndoRedoToolbar
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          undoTooltip={getUndoTooltip()}
          redoTooltip={getRedoTooltip()}
        />
        
        {/* Selection controls */}
        {selectionRange && (
          <div className="absolute top-2 left-2 p-2 bg-white border border-gray-200 rounded shadow-sm z-10 flex items-center space-x-2">
            <button 
              className="p-1 text-gray-700 hover:bg-blue-50 rounded flex items-center"
              onClick={handleCopy}
              title="Copy selected cells to clipboard"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
            <button 
              className="p-1 text-gray-700 hover:bg-gray-100 rounded flex items-center"
              onClick={clearSelection}
              title="Clear the current cell selection"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear selection
            </button>
          </div>
        )}
        
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
                onStartSelection={handleStartSelection}
                onUpdateSelection={handleUpdateSelection}
                isCellInSelection={isCellSelected}
                isSelecting={isSelecting}
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

// Add notification timeout to window object for proper cleanup
declare global {
  interface Window {
    notificationTimeout?: number;
  }
}

export default DataTable;
