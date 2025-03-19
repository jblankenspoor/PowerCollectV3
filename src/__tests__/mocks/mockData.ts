/**
 * Mock data for PowerCollectV3 tests
 * 
 * This file provides mock data for tests, including sample
 * columns, tasks, and Power FX code.
 * 
 * @version 1.0.0
 */

import { Column, Task, Priority, Status, ColumnType } from '../../types/dataTypes';

/**
 * Mock columns for testing
 */
export const mockColumns: Column[] = [
  { id: 'select', title: 'Select', type: ColumnType.Select, width: 80 },
  { id: 'ID', title: 'ID', type: ColumnType.Number, width: 100 },
  { id: 'Title', title: 'Title', type: ColumnType.Text, width: 200 },
  { id: 'Description', title: 'Description', type: ColumnType.Text, width: 300 },
  { id: 'DueDate', title: 'Due Date', type: ColumnType.Date, width: 150 },
  { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 120 },
  { id: 'Status', title: 'Status', type: ColumnType.Text, width: 150 }
];

/**
 * Mock tasks for testing
 */
export const mockTasks: Task[] = [
  {
    select: false,
    ID: 1,
    Title: 'Task 1',
    Description: 'Description 1',
    DueDate: new Date('2024-04-15'),
    Priority: Priority.High,
    Status: Status.InProgress
  },
  {
    select: false,
    ID: 2,
    Title: 'Task 2',
    Description: 'Description 2',
    DueDate: new Date('2024-04-20'),
    Priority: Priority.Medium,
    Status: Status.NotStarted
  }
];

// Sample PowerFX code for testing
export const samplePowerFXCode = `// PowerCollect data collection for task management
// Schema: ID, Title, Status, Priority, Start Date, Deadline
// Made with PowerCollect https://powercollect.jacco.me

ClearCollect(
  PowerCollectData,
  [
    {
      ID: 1,
      Title: "Complete project proposal",
      Status: "In Progress",
      Priority: "High",
      "Start Date": Date(2023, 5, 15),
      Deadline: Date(2023, 5, 30)
    },
    {
      ID: 2,
      Title: "Review documentation",
      Status: "To Do",
      Priority: "Medium",
      "Start Date": Date(2023, 5, 20),
      Deadline: Date(2023, 6, 10)
    }
  ]
);`;

/**
 * Generate a large dataset for testing token limits
 */
export function generateLargeDataset(size: number = 100): { columns: Column[], tasks: Task[] } {
  const largeTasks: Task[] = [];
  
  for (let i = 0; i < size; i++) {
    const taskTitle = `Task ${i} with a relatively long title to consume more tokens in the API request`;
    largeTasks.push({
      select: false,
      ID: i + 1,
      Title: taskTitle,
      Description: `Description for ${taskTitle}`,
      Status: i % 3 === 0 ? Status.InProgress : i % 3 === 1 ? Status.ToDo : Status.Done,
      Priority: i % 3 === 0 ? Priority.High : i % 3 === 1 ? Priority.Medium : Priority.Low,
      Start_Date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      Deadline: `2023-${((i + 2) % 12) + 1}-${((i + 10) % 28) + 1}`
    });
  }

  return {
    columns: [
      { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
      { id: 'ID', title: 'ID', type: ColumnType.Number, width: 40, minWidth: 160 },
      { id: 'Title', title: 'Title', type: ColumnType.Text, width: 40, minWidth: 160 },
      { id: 'Description', title: 'Description', type: ColumnType.Text, width: 40, minWidth: 160 },
      { id: 'Status', title: 'Status', type: ColumnType.Text, width: 40, minWidth: 160 },
      { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 40, minWidth: 160 },
      { id: 'Start_Date', title: 'Start Date', type: ColumnType.Date, width: 40, minWidth: 160 },
      { id: 'Deadline', title: 'Deadline', type: ColumnType.Date, width: 40, minWidth: 160 }
    ],
    tasks: largeTasks
  };
}

/**
 * Generate a random date within a range
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random priority
 */
export function randomPriority(): Priority {
  const priorities = [Priority.High, Priority.Medium, Priority.Low];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

/**
 * Generate a random status
 */
export function randomStatus(): Status {
  const statuses = [Status.NotStarted, Status.InProgress, Status.Completed, Status.Blocked];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * Generate a random string with a prefix
 */
export function randomString(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a random dataset with specified dimensions
 */
export function generateRandomDataset(rows: number = 10, extraColumns: number = 10): { columns: Column[], tasks: Task[] } {
  const baseColumns: Column[] = [
    { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
    { id: 'ID', title: 'ID', type: ColumnType.Number, width: 40, minWidth: 160 },
    { id: 'Title', title: 'Title', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Status', title: 'Status', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Start_Date', title: 'Start Date', type: ColumnType.Date, width: 40, minWidth: 160 },
    { id: 'Deadline', title: 'Deadline', type: ColumnType.Date, width: 40, minWidth: 160 }
  ];

  const extraColumnsList: Column[] = Array.from({ length: extraColumns }, (_, i) => ({
    id: `col${i + 1}`,
    title: `Column ${i + 1}`,
    type: ColumnType.Text,
    width: 40,
    minWidth: 160
  }));

  const tasks: Task[] = Array.from({ length: rows }, (_, i) => {
    const startDate = randomDate(new Date('2024-01-01'), new Date('2024-12-31'));
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 30) + 1);

    const task: Task = {
      select: false,
      ID: i + 1,
      Title: `Task ${i + 1}`,
      Description: `Description for Task ${i + 1}`,
      Status: randomStatus(),
      Priority: randomPriority(),
      Start_Date: startDate.toISOString().split('T')[0],
      Deadline: deadline.toISOString().split('T')[0]
    };

    extraColumnsList.forEach((col) => {
      task[col.id] = randomString(col.id);
    });

    return task;
  });

  return {
    columns: [...baseColumns, ...extraColumnsList],
    tasks
  };
} 