/**
 * ShortcutsDialog Component
 * 
 * Displays available keyboard shortcuts to the user
 * 
 * @module ShortcutsDialog
 */

import React from 'react';

/**
 * Props for the ShortcutsDialog component
 */
interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard shortcut data structure
 */
interface Shortcut {
  key: string;
  description: string;
}

/**
 * Available keyboard shortcuts in the application
 */
const SHORTCUTS: Shortcut[] = [
  { key: 'Ctrl+V', description: 'Paste data from clipboard' },
  { key: 'Enter', description: 'Confirm edit and exit cell edit mode' },
  { key: 'Escape', description: 'Cancel edit and exit cell edit mode' },
  { key: 'Tab', description: 'Move to next cell' },
  { key: 'Shift+Tab', description: 'Move to previous cell' },
  { key: 'Ctrl+Z', description: 'Undo last action' },
  { key: 'Ctrl+Y', description: 'Redo last undone action' },
  { key: '?', description: 'Show this shortcuts dialog' }
];

/**
 * ShortcutsDialog component that displays available keyboard shortcuts
 * 
 * @param props - Component props
 * @returns JSX Element or null if not visible
 */
const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" id="dialog-title">Keyboard Shortcuts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {SHORTCUTS.map((shortcut, index) => (
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

export default ShortcutsDialog; 