/**
 * Data types for the table components
 * 
 * @module dataTypes
 */

/**
 * Available column types
 */
export type ColumnType = 'select' | 'text' | 'status' | 'priority' | 'date' | 'custom';

/**
 * Available status options
 */
export type StatusValue = 'To do' | 'In progress' | 'Done';

/**
 * Available priority levels
 */
export type PriorityValue = 'Low' | 'Medium' | 'High';

/**
 * Column definition for the DataTable
 * @interface Column
 * @property {string} id - Unique identifier for the column
 * @property {string} title - Display title for the column header
 * @property {ColumnType} type - Type of column that determines rendering
 * @property {string} width - Tailwind width class for the column
 * @property {string} [minWidth] - Optional minimum width class for the column
 */
export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  width: string;
  minWidth?: string;
}

/**
 * Base Task properties
 */
export interface BaseTask {
  id: string;
  name: string;
  status: StatusValue | string;
  priority: PriorityValue | string;
  startDate: string;
  deadline: string;
}

/**
 * Task data structure for the DataTable
 * @interface Task
 * Extends BaseTask with dynamic columns
 */
export interface Task extends BaseTask {
  [key: string]: string;
}

/**
 * Error state for form validation
 */
export interface ValidationErrors {
  [key: string]: string | null;
}
