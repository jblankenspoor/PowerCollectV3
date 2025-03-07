/**
 * CellFactory Component
 * 
 * Factory component that renders the appropriate cell type based on column type
 * 
 * @module CellFactory
 */

import React from 'react';
import { Column } from '../../types/dataTypes';
import SelectCell from './SelectCell';
import TextCell from './TextCell';
import StatusCell from './StatusCell';
import PriorityCell from './PriorityCell';
import DateCell from './DateCell';

/**
 * Props for the CellFactory component
 */
interface CellFactoryProps {
  column: Column;
  taskId: string;
  value: string;
  isSelected: boolean;
  isEditing: boolean;
  isLastRow?: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
  onChange: (columnId: string, value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent, columnId: string) => void;
}

/**
 * CellFactory component that renders different cell types based on column configuration
 * 
 * @param props - Component props
 * @returns JSX Element
 */
const CellFactory: React.FC<CellFactoryProps> = ({
  column,
  taskId,
  value,
  isSelected,
  isEditing,
  isLastRow = false,
  onSelectTask,
  onChange,
  onBlur,
  onKeyDown
}) => {
  /**
   * Handle cell value changes and call parent onChange with column context
   */
  const handleChange = (newValue: string) => {
    onChange(column.id, newValue);
  };

  /**
   * Handle keydown events with column context
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown(e, column.id);
  };

  // Render cell based on column type
  switch (column.type) {
    case 'select':
      return (
        <SelectCell 
          taskId={taskId}
          isSelected={isSelected}
          onSelectTask={onSelectTask}
        />
      );
    
    case 'status':
      return (
        <StatusCell
          value={value}
          isEditing={isEditing}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          isLastRow={isLastRow}
        />
      );
    
    case 'priority':
      return (
        <PriorityCell
          value={value}
          isEditing={isEditing}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          isLastRow={isLastRow}
        />
      );
    
    case 'date':
      return (
        <DateCell
          value={value}
          isEditing={isEditing}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
      );
    
    case 'text':
    default:
      return (
        <TextCell
          value={value}
          isEditing={isEditing}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
      );
  }
};

export default CellFactory; 