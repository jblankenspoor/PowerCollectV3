/**
 * Column definition for the DataTable
 * @interface Column
 * @property {string} id - Unique identifier for the column
 * @property {string} title - Display title for the column header
 * @property {string} type - Type of column (select, text, date, etc.)
 * @property {string} width - Tailwind width class for the column
 * @property {string} [minWidth] - Optional minimum width class for the column
 */
export interface Column {
  id: string;
  title: string;
  type: string;
  width: string;
  minWidth?: string;
}

/**
 * Task data structure for the DataTable
 * @interface Task
 * @property {string} id - Unique identifier for the task
 * @property {string} name - Name of the task
 * @property {string} status - Current status of the task
 * @property {string} priority - Priority level of the task
 * @property {string} startDate - Start date of the task (formatted string)
 * @property {string} deadline - Deadline of the task (formatted string)
 * @property {Record<string, string>} [additionalColumns] - Additional dynamic columns
 */
export interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  startDate: string;
  deadline: string;
  [key: string]: string;
}

/**
 * Cell coordinate in the DataTable
 * @interface CellCoordinate
 * @property {number} rowIndex - The row index in the tasks array
 * @property {number} columnIndex - The column index in the columns array
 */
export interface CellCoordinate {
  rowIndex: number;
  columnIndex: number;
}

/**
 * Cell identifier with task and column IDs
 * @interface CellIdentifier
 * @property {string} taskId - The unique identifier of the task/row
 * @property {string} columnId - The unique identifier of the column
 */
export interface CellIdentifier {
  taskId: string;
  columnId: string;
}

/**
 * Cell selection range definition
 * @interface SelectionRange
 * @property {CellCoordinate} start - Starting cell coordinate
 * @property {CellCoordinate} end - Ending cell coordinate
 */
export interface SelectionRange {
  start: CellCoordinate;
  end: CellCoordinate;
}

/**
 * Cell format options for styling
 * @interface CellFormatting
 * @property {string} [backgroundColor] - Cell background color
 * @property {string} [textColor] - Text color
 * @property {string} [fontWeight] - Font weight (normal, bold, etc.)
 * @property {string} [fontStyle] - Font style (normal, italic, etc.)
 * @property {string} [borderColor] - Cell border color
 * @property {'left' | 'center' | 'right'} [alignment] - Text alignment
 */
export interface CellFormatting {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  borderColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Formatted cell data structure
 * @interface FormattedCellData
 * @property {string} value - Cell content value
 * @property {CellFormatting} formatting - Cell styling information
 */
export interface FormattedCellData {
  value: string;
  formatting: CellFormatting;
}
