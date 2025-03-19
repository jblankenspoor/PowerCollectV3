/**
 * Data types for the table components
 * 
 * @module dataTypes
 * @version 4.1.2 - Added displayTitle property to Column interface
 */

/**
 * Type definitions for the application
 * @module dataTypes
 */

/**
 * Column types supported in the application
 */
export enum ColumnType {
  Select = 'select',
  Text = 'text',
  Date = 'date',
  Number = 'number'
}

/**
 * Available status options
 */
export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Blocked = 'Blocked',
  ToDo = 'To Do',
  Done = 'Done'
}

/**
 * Available priority levels
 */
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

/**
 * Priority levels for tasks
 */
export type PriorityValue = Priority;

/**
 * Status options for tasks
 */
export type StatusValue = Status;

/**
 * Column definition for the DataTable
 * @interface Column
 * @property {string} id - Unique identifier for the column
 * @property {string} title - Original title for the column as entered by the user
 * @property {ColumnType} type - Type of column that determines rendering
 * @property {number} width - Width in pixels for the column
 * @property {number} [minWidth] - Optional minimum width in pixels for the column
 */
export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  width: number;
  minWidth?: number;
}

/**
 * Base Task properties
 */
export interface BaseTask {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  startDate: string;
  deadline: string;
}

/**
 * Task interface
 */
export interface Task {
  select: boolean;
  ID: number;
  Title: string;
  Description?: string;
  Status: Status;
  Priority: Priority;
  Start_Date?: string;
  Deadline?: string;
  [key: string]: any; // Allow dynamic columns
}

/**
 * Error state for form validation
 */
export interface ValidationErrors {
  [key: string]: string | null;
}
