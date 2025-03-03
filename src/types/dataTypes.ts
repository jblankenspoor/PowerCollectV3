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
