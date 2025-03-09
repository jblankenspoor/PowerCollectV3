/**
 * DataTable Component
 * 
 * A responsive data table for displaying and managing tasks with features like:
 * - Adding/removing tasks and columns
 * - Status and priority indicators
 * - Horizontal scrolling for many columns
 * - Excel/CSV data copy-paste with auto-expansion
 * - Undo/redo functionality with 1-step history
 * - Import/export functionality for Excel and CSV files
 * - Data preview before import
 * 
 * @module DataTable
 * @version 1.1.6 - Fixed duplicate notifications and Select column preservation
 */

import React, { useRef, useEffect } from 'react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Column } from '../../types/dataTypes';

// Import refactored components
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import ColumnActionRow from './ColumnActionRow';
import ScrollNotification from '../ScrollNotification';
import PasteNotification from '../notifications/PasteNotification';
import ShortcutsDialog from '../notifications/ShortcutsDialog';
import { ImportDataDialog, ExportDataDialog, ImportPreviewDialog } from '../dialogs';

// Import context and utilities
import { useTableContext } from '../../context/TableContext';
import useTableResize from '../../hooks/useTableResize';
import { parseClipboardData } from '../../utils/tableUtils';

/**
 * DataTable component - The main table component using the context
 * 
 * @returns JSX Element
 */
const DataTable: React.FC = () => {
  // Use the table context for state management
  const { state, dispatch } = useTableContext();
  
  // Destructure state for easier access
  const { 
    tasks, 
    columns, 
    selectedTasks, 
    editingCell, 
    past, 
    future,
    showPasteNotification,
    pasteNotificationMessage,
    showShortcutsDialog,
    showScrollNotification,
    showImportPreviewDialog,
    importPreviewData,
    importPreviewSourceType,
    importPreviewFileName
  } = state;

  // Reference for the table container
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the custom table resize hook to handle scroll notification
  useTableResize(
    tableRef,
    [columns, tasks]
  );

  // Effect to recalculate table width when dependencies change
  useEffect(() => {
    recalculateTableWidth();
  }, [columns, tasks, editingCell]);

  /**
   * Manually recalculates the table width
   */
  const recalculateTableWidth = () => {
    setTimeout(() => {
      if (!tableRef.current || !tableRef.current.parentElement) return;
      
      // Get the current scroll position before recalculation
      const scrollElement = tableRef.current.parentElement;
      const currentScrollLeft = scrollElement.scrollLeft;
      
      const tableContainer = tableRef.current.firstChild as HTMLElement;
      if (!tableContainer) return;
      
      // Measure the width of the table content and its container
      const contentWidth = tableContainer.scrollWidth;
      const containerWidth = tableRef.current.parentElement.clientWidth;
      
      // Let the fit-content and w-fit classes handle the width naturally
      // This prevents the extra space at the end of the table
      
      // Restore the scroll position
      scrollElement.scrollLeft = currentScrollLeft;
      
      // Show scroll notification if needed
      if (contentWidth > containerWidth + 30) {
        dispatch({ type: 'SET_SCROLL_NOTIFICATION', payload: true });
      }
    }, 0);
  };

  /**
   * Handles undo action
   */
  const handleUndo = () => {
    if (past) {
      dispatch({ type: 'UNDO' });
    }
  };

  /**
   * Handles redo action
   */
  const handleRedo = () => {
    if (future) {
      dispatch({ type: 'REDO' });
    }
  };

  /**
   * Handles selection of a single task
   */
  const handleSelectTask = (taskId: string, isSelected: boolean) => {
    dispatch({ 
      type: 'SELECT_TASK', 
      payload: { taskId, isSelected } 
    });
  };

  /**
   * Handles selection/deselection of all tasks
   */
  const handleSelectAll = (selectAll: boolean) => {
    dispatch({ type: 'SELECT_ALL', payload: selectAll });
  };

  /**
   * Adds a new task
   */
  const handleAddTask = () => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    dispatch({ type: 'ADD_TASK' });
  };

  /**
   * Deletes a task by ID
   */
  const handleDeleteTask = (taskId: string) => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  /**
   * Updates a task's field value
   */
  const handleUpdateTask = (taskId: string, columnId: string, value: string) => {
    dispatch({ 
      type: 'UPDATE_TASK', 
      payload: { taskId, columnId, value } 
    });
  };

  /**
   * Adds a new column to the end
   */
  const handleAddColumn = () => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    
    // Create a new column with default values
    const columnName = `Column ${columns.length}`;
    const newColumn: Column = {
      id: `column${Math.random().toString(36).substring(2, 10)}`,
      title: columnName.toUpperCase(),
      type: 'text',
      width: 'w-40',
      minWidth: 'min-w-[160px]'
    };
    
    dispatch({ type: 'ADD_COLUMN', payload: newColumn });
  };

  /**
   * Adds a column to the left of a specified column
   */
  const handleAddColumnLeft = (columnIndex: number) => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    dispatch({ type: 'ADD_COLUMN_LEFT', payload: columnIndex });
  };

  /**
   * Adds a column to the right of a specified column
   */
  const handleAddColumnRight = (columnIndex: number) => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    dispatch({ type: 'ADD_COLUMN_RIGHT', payload: columnIndex });
  };

  /**
   * Deletes a column
   */
  const handleDeleteColumn = (columnId: string, columnIndex: number) => {
    // Save current state to history before modification
    dispatch({ type: 'SAVE_HISTORY' });
    dispatch({ 
      type: 'DELETE_COLUMN', 
      payload: { columnId, columnIndex } 
    });
  };

  /**
   * Sets the currently editing cell
   */
  const handleSetEditingCell = (taskId: string, columnId: string) => {
    dispatch({ 
      type: 'SET_EDITING_CELL', 
      payload: { taskId, columnId } 
    });
  };

  /**
   * Clears the currently editing cell
   */
  const handleClearEditingCell = () => {
    dispatch({ type: 'SET_EDITING_CELL', payload: null });
  };

  /**
   * Handles paste events for data import
   */
  const handlePaste = (event: React.ClipboardEvent) => {
    // Only handle paste if a cell is being edited
    if (!editingCell) return;
    
    try {
      // Prevent default paste behavior
      event.preventDefault();
      
      // Get the clipboard text
      const clipboardText = event.clipboardData.getData('text');
      if (!clipboardText.trim()) return;
      
      // Parse clipboard data
      const data = parseClipboardData(clipboardText);
      if (!data.length || !data[0].length) return;
      
      // Save current state to history before modification
      dispatch({ type: 'SAVE_HISTORY' });
      
      // Apply pasted data starting from the currently editing cell
      dispatch({
        type: 'APPLY_PASTED_DATA',
        payload: {
          data,
          startTaskId: editingCell.taskId,
          startColumnId: editingCell.columnId
        }
      });
      
      // Show success notification
      const rowCount = data.length;
      const colCount = data[0].length;
      const message = `Successfully pasted ${rowCount}×${colCount} data.`;
      
      dispatch({
        type: 'SHOW_PASTE_NOTIFICATION',
        payload: { message }
      });
      
      // Clear editing state
      handleClearEditingCell();
    } catch (error) {
      console.error('Error handling paste:', error);
      
      // Show error notification
      dispatch({
        type: 'SHOW_PASTE_NOTIFICATION',
        payload: { message: 'Error pasting data. Please try again.' }
      });
    }
  };

  /**
   * Toggles the shortcuts dialog
   */
  const toggleShortcutsDialog = () => {
    dispatch({ type: 'TOGGLE_SHORTCUTS_DIALOG' });
  };

  /**
   * Handle import button click
   */
  const handleImportClick = () => {
    dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: true });
  };

  /**
   * Handle import preview confirmation
   * This actually performs the import after user confirms via the preview dialog
   */
  const handleImportConfirm = () => {
    if (importPreviewData) {
      // Actually import the data now
      dispatch({
        type: 'IMPORT_DATA',
        payload: {
          tasks: importPreviewData.tasks,
          columns: importPreviewData.columns
        }
      });
      
      // Close both import and preview dialogs
      dispatch({ type: 'TOGGLE_IMPORT_PREVIEW_DIALOG', payload: false });
      dispatch({ type: 'TOGGLE_IMPORT_DIALOG', payload: false });
      
      // Show success notification
      dispatch({ 
        type: 'SHOW_PASTE_NOTIFICATION', 
        payload: { message: 'Data imported successfully!' } 
      });
    }
  };

  /**
   * Handle canceling the import preview
   */
  const handleImportCancel = () => {
    dispatch({ type: 'TOGGLE_IMPORT_PREVIEW_DIALOG', payload: false });
  };

  /**
   * Render method for the DataTable component
   * Uses modular components for better maintainability and performance
   */
  return (
    <div className="relative w-full">
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-2">
          {/* Existing undo/redo buttons */}
          <button 
            onClick={handleUndo}
            disabled={!past}
            className={`p-1.5 rounded ${
              past ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!future}
            className={`p-1.5 rounded ${
              future ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <ArrowUturnRightIcon className="h-5 w-5" />
          </button>
          
          {/* Import/Export buttons */}
          <div className="border-l border-gray-300 mx-2 h-6 self-center"></div>
          
          <button
            onClick={handleImportClick}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-100 flex items-center"
            title="Import data from Excel or CSV"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="ml-1 text-sm">Import</span>
          </button>
          
          <button
            disabled={true}
            className="p-1.5 rounded text-gray-400 cursor-not-allowed flex items-center relative group"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span className="ml-1 text-sm">Export</span>
            
            {/* Tooltip for disabled export button */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              To be implemented
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
          
          {/* Keyboard shortcuts button */}
          <button
            onClick={toggleShortcutsDialog}
            className="p-1.5 rounded text-gray-700 hover:bg-gray-100 flex items-center"
            title="Keyboard shortcuts"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span className="ml-1 text-sm">Shortcuts</span>
          </button>
        </div>
      </div>
      
      {/* Main container with full width */}
      <div className="w-full">
        {/* Outer wrapper with relative positioning for notifications */}
        <div className="relative">
          {/* Table wrapper with horizontal scroll */}
          <div 
            ref={tableRef}
            className="border border-gray-200 rounded-md bg-white shadow-sm overflow-x-auto"
            style={{ 
              maxWidth: '100%',
              width: 'fit-content' /* Use fit-content to remove extra space */
            }}
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
            
            {/* Table container */}
            <div className="w-fit table-fixed">
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
                <div 
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  onClick={handleAddTask}
                  role="button"
                  aria-label="Add new row"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-center text-blue-500">
                    <span className="mr-1 font-medium">+</span> Add row
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications and Dialogs */}
      {showPasteNotification && (
        <PasteNotification 
          show={showPasteNotification} 
          message={pasteNotificationMessage} 
        />
      )}
      
      {showShortcutsDialog && (
        <ShortcutsDialog 
          isOpen={showShortcutsDialog} 
          onClose={toggleShortcutsDialog} 
        />
      )}
      
      {showScrollNotification && (
        <ScrollNotification 
          show={showScrollNotification} 
        />
      )}
      
      {/* Import/Export Dialogs */}
      <ImportDataDialog />
      <ExportDataDialog />
      <ImportPreviewDialog 
        isOpen={showImportPreviewDialog}
        onClose={handleImportCancel}
        onConfirm={handleImportConfirm}
        previewData={importPreviewData || { tasks: [], columns: [] }}
        sourceType={importPreviewSourceType || 'excel'}
        fileName={importPreviewFileName}
      />
    </div>
  );
};

export default DataTable; 