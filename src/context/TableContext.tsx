/**
 * TableContext.tsx
 * 
 * Provides a context for managing table state across components.
 * Uses useReducer for more predictable state management.
 * 
 * @module TableContext
 * @version 1.1.0 - Added editable header titles functionality
 */

import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
 * Initial column definitions with fixed widths
 */
const initialColumns: Column[] = [
  { id: 'select', title: 'SELECT', type: 'select', width: 'w-32', minWidth: 'min-w-[128px]' },
  { id: 'name', title: 'NAME', type: 'text', width: 'w-48', minWidth: 'min-w-[192px]' },
  { id: 'status', title: 'STATUS', type: 'status', width: 'w-36', minWidth: 'min-w-[144px]' },
  { id: 'priority', title: 'PRIORITY', type: 'priority', width: 'w-36', minWidth: 'min-w-[144px]' },
  { id: 'startDate', title: 'START DATE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
  { id: 'deadline', title: 'DEADLINE', type: 'date', width: 'w-40', minWidth: 'min-w-[160px]' },
];

/**
 * HistoryEntry interface for undo/redo functionality
 */
interface HistoryEntry {
  tasks: Task[];
  columns: Column[];
}

/**
 * Table state interface
 */
interface TableState {
  tasks: Task[];
  columns: Column[];
  selectedTasks: Set<string>;
  editingCell: { taskId: string; columnId: string } | null;
  past: HistoryEntry | null;
  future: HistoryEntry | null;
  showPasteNotification: boolean;
  pasteNotificationMessage: string;
  showShortcutsDialog: boolean;
  showScrollNotification: boolean;
}

/**
 * Initial state for the table reducer
 */
const initialState: TableState = {
  tasks: initialTasks,
  columns: initialColumns,
  selectedTasks: new Set<string>(),
  editingCell: null,
  past: null,
  future: null,
  showPasteNotification: false,
  pasteNotificationMessage: '',
  showShortcutsDialog: false,
  showScrollNotification: false,
};

/**
 * Action types for the reducer
 */
export type TableAction =
  | { type: 'SELECT_TASK'; payload: { taskId: string; isSelected: boolean } }
  | { type: 'SELECT_ALL'; payload: boolean }
  | { type: 'ADD_TASK'; payload?: Partial<Task> }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; columnId: string; value: string } }
  | { type: 'ADD_COLUMN'; payload: Column }
  | { type: 'ADD_COLUMN_LEFT'; payload: number }
  | { type: 'ADD_COLUMN_RIGHT'; payload: number }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string; columnIndex: number } }
  | { type: 'UPDATE_COLUMN_TITLE'; payload: { columnId: string; title: string } }
  | { type: 'SET_EDITING_CELL'; payload: { taskId: string; columnId: string } | null }
  | { type: 'SHOW_PASTE_NOTIFICATION'; payload: { message: string } }
  | { type: 'HIDE_PASTE_NOTIFICATION' }
  | { type: 'TOGGLE_SHORTCUTS_DIALOG'; payload?: boolean }
  | { type: 'SET_SCROLL_NOTIFICATION'; payload: boolean }
  | { type: 'SAVE_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'APPLY_PASTED_DATA'; payload: { data: string[][]; startTaskId: string; startColumnId: string } };

/**
 * Reducer function for table state
 */
function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'SELECT_TASK': {
      const { taskId, isSelected } = action.payload;
      const newSelectedTasks = new Set(state.selectedTasks);

      if (isSelected) {
        newSelectedTasks.add(taskId);
      } else {
        newSelectedTasks.delete(taskId);
      }

      return {
        ...state,
        selectedTasks: newSelectedTasks
      };
    }

    case 'SELECT_ALL': {
      const selectAll = action.payload;
      const newSelectedTasks = new Set<string>();

      if (selectAll) {
        state.tasks.forEach(task => newSelectedTasks.add(task.id));
      }

      return {
        ...state,
        selectedTasks: newSelectedTasks
      };
    }

    case 'ADD_TASK': {
      const newTask: Task = {
        id: uuidv4(),
        name: '',
        status: 'To do',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...action.payload
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask]
      };
    }

    case 'DELETE_TASK': {
      const taskId = action.payload;
      const newSelectedTasks = new Set(state.selectedTasks);
      newSelectedTasks.delete(taskId);

      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
        selectedTasks: newSelectedTasks,
        editingCell: state.editingCell?.taskId === taskId ? null : state.editingCell
      };
    }

    case 'UPDATE_TASK': {
      const { taskId, columnId, value } = action.payload;
      
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, [columnId]: value }
            : task
        )
      };
    }

    case 'ADD_COLUMN': {
      const columnName = `Column ${state.columns.length}`;
      const newColumn: Column = {
        id: `column${uuidv4().substring(0, 8)}`,
        title: columnName.toUpperCase(),
        type: 'text',
        width: 'w-40',
        minWidth: 'min-w-[160px]'
      };

      return {
        ...state,
        columns: [...state.columns, newColumn]
      };
    }

    case 'ADD_COLUMN_LEFT': {
      const columnIndex = action.payload;
      const columnName = `Column ${state.columns.length}`;
      const newColumn: Column = {
        id: `column${uuidv4().substring(0, 8)}`,
        title: columnName.toUpperCase(),
        type: 'text',
        width: 'w-40',
        minWidth: 'min-w-[160px]'
      };

      const newColumns = [...state.columns];
      newColumns.splice(columnIndex, 0, newColumn);

      return {
        ...state,
        columns: newColumns
      };
    }

    case 'ADD_COLUMN_RIGHT': {
      const columnIndex = action.payload;
      const columnName = `Column ${state.columns.length}`;
      const newColumn: Column = {
        id: `column${uuidv4().substring(0, 8)}`,
        title: columnName.toUpperCase(),
        type: 'text',
        width: 'w-40',
        minWidth: 'min-w-[160px]'
      };

      const newColumns = [...state.columns];
      newColumns.splice(columnIndex + 1, 0, newColumn);

      return {
        ...state,
        columns: newColumns
      };
    }

    case 'DELETE_COLUMN': {
      const { columnId } = action.payload;
      
      // Don't allow deleting the select column or if there's only one regular column left
      if (columnId === 'select' || (state.columns.length <= 2)) {
        return state;
      }

      const newColumns = state.columns.filter(column => column.id !== columnId);

      return {
        ...state,
        columns: newColumns,
        editingCell: state.editingCell?.columnId === columnId ? null : state.editingCell
      };
    }

    case 'UPDATE_COLUMN_TITLE': {
      const { columnId, title } = action.payload;
      
      return {
        ...state,
        columns: state.columns.map(column => 
          column.id === columnId 
            ? { ...column, title: title.toUpperCase() }
            : column
        )
      };
    }

    case 'SET_EDITING_CELL': {
      return {
        ...state,
        editingCell: action.payload
      };
    }

    case 'SHOW_PASTE_NOTIFICATION': {
      return {
        ...state,
        showPasteNotification: true,
        pasteNotificationMessage: action.payload.message
      };
    }

    case 'HIDE_PASTE_NOTIFICATION': {
      return {
        ...state,
        showPasteNotification: false
      };
    }

    case 'TOGGLE_SHORTCUTS_DIALOG': {
      const newValue = action.payload !== undefined ? action.payload : !state.showShortcutsDialog;
      return {
        ...state,
        showShortcutsDialog: newValue
      };
    }

    case 'SET_SCROLL_NOTIFICATION': {
      return {
        ...state,
        showScrollNotification: action.payload
      };
    }

    case 'SAVE_HISTORY': {
      return {
        ...state,
        past: {
          tasks: JSON.parse(JSON.stringify(state.tasks)),
          columns: JSON.parse(JSON.stringify(state.columns))
        },
        future: null
      };
    }

    case 'UNDO': {
      if (!state.past) return state;

      return {
        ...state,
        tasks: state.past.tasks,
        columns: state.past.columns,
        past: null,
        future: {
          tasks: state.tasks,
          columns: state.columns
        }
      };
    }

    case 'REDO': {
      if (!state.future) return state;

      return {
        ...state,
        tasks: state.future.tasks,
        columns: state.future.columns,
        past: {
          tasks: state.tasks,
          columns: state.columns
        },
        future: null
      };
    }

    case 'APPLY_PASTED_DATA': {
      const { data, startTaskId, startColumnId } = action.payload;
      if (!data.length || !data[0].length) return state;

      // Find the starting task and column indices
      const startTaskIndex = state.tasks.findIndex(task => task.id === startTaskId);
      const startColumnIndex = state.columns.findIndex(col => col.id === startColumnId);
      
      if (startTaskIndex === -1 || startColumnIndex === -1) return state;
      
      // Create new tasks array to modify
      const newTasks = [...state.tasks];
      const newColumns = [...state.columns];
      
      // Process each row of pasted data
      for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
        const taskIndex = startTaskIndex + rowIdx;
        
        // If we need to create a new task
        if (taskIndex >= newTasks.length) {
          const newTask: Task = {
            id: uuidv4(),
            name: '',
            status: 'To do',
            priority: 'Medium',
            startDate: new Date().toISOString().split('T')[0],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          newTasks.push(newTask);
        }
        
        // Process each column of data in this row
        for (let colIdx = 0; colIdx < data[rowIdx].length; colIdx++) {
          const columnIndex = startColumnIndex + colIdx;
          
          // Skip the select column
          if (newColumns[columnIndex]?.id === 'select') continue;
          
          // If we need to create a new column
          if (columnIndex >= newColumns.length) {
            const columnName = `Column ${newColumns.length}`;
            const newColumn: Column = {
              id: `column${uuidv4().substring(0, 8)}`,
              title: columnName.toUpperCase(),
              type: 'text',
              width: 'w-40',
              minWidth: 'min-w-[160px]'
            };
            newColumns.push(newColumn);
          }
          
          // Update the task with the pasted value
          if (newColumns[columnIndex]) {
            newTasks[taskIndex][newColumns[columnIndex].id] = data[rowIdx][colIdx];
          }
        }
      }
      
      return {
        ...state,
        tasks: newTasks,
        columns: newColumns
      };
    }

    default:
      return state;
  }
}

/**
 * Context interface with state and dispatch
 */
interface TableContextType {
  state: TableState;
  dispatch: Dispatch<TableAction>;
}

// Create the context
const TableContext = createContext<TableContextType | undefined>(undefined);

/**
 * TableProvider props
 */
interface TableProviderProps {
  children: ReactNode;
}

/**
 * TableProvider component for wrapping components that need access to table state
 */
export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialState);

  // Set up notification auto-hide
  React.useEffect(() => {
    if (state.showPasteNotification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_PASTE_NOTIFICATION' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.showPasteNotification]);

  // Handle keyboard shortcuts at app level
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if an input is being edited
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Show shortcuts dialog with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'TOGGLE_SHORTCUTS_DIALOG' });
      }

      // Undo with Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }

      // Redo with Ctrl+Shift+Z or Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TableContext.Provider value={{ state, dispatch }}>
      {children}
    </TableContext.Provider>
  );
};

/**
 * Custom hook for accessing the TableContext
 * @throws {Error} If used outside of a TableProvider
 */
export const useTableContext = (): TableContextType => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}; 