/**
 * Mock data for PowerCollectV3 tests
 * 
 * This file provides mock data for tests, including sample
 * columns, tasks, and Power FX code.
 * 
 * @version 1.0.0
 */

import { Column, Task } from '../../types/dataTypes';

// Mock columns for testing
export const mockColumns: Column[] = [
  {
    id: 'select',
    title: 'SELECT',
    type: 'select',
    width: 'w-32',
    minWidth: 'min-w-[128px]'
  },
  {
    id: 'taskId',
    title: 'ID',
    type: 'text',
    width: 'w-24',
    minWidth: 'min-w-[96px]'
  },
  {
    id: 'title',
    title: 'Title',
    type: 'text',
    width: 'w-64',
    minWidth: 'min-w-[256px]'
  },
  {
    id: 'status',
    title: 'Status',
    type: 'text',
    width: 'w-40',
    minWidth: 'min-w-[160px]'
  },
  {
    id: 'priority',
    title: 'Priority',
    type: 'text',
    width: 'w-32',
    minWidth: 'min-w-[128px]'
  },
  {
    id: 'startDate',
    title: 'Start Date',
    type: 'date',
    width: 'w-40',
    minWidth: 'min-w-[160px]'
  },
  {
    id: 'deadline',
    title: 'Deadline',
    type: 'date',
    width: 'w-40',
    minWidth: 'min-w-[160px]'
  }
];

// Mock tasks for testing
export const mockTasks: Task[] = [
  {
    id: '1',
    select: 'false',
    taskId: '1',
    name: 'Complete project proposal',
    title: 'Complete project proposal',
    status: 'In Progress',
    priority: 'High',
    startDate: '2023-05-15',
    deadline: '2023-05-30'
  },
  {
    id: '2',
    select: 'false',
    taskId: '2',
    name: 'Review documentation',
    title: 'Review documentation',
    status: 'To Do',
    priority: 'Medium',
    startDate: '2023-05-20',
    deadline: '2023-06-10'
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

// Large dataset for testing token limits
export const generateLargeDataset = (): Task[] => {
  const largeTasks: Task[] = [];
  for (let i = 1; i <= 100; i++) {
    const taskTitle = `Task ${i} with a relatively long title to consume more tokens in the API request`;
    largeTasks.push({
      id: i.toString(),
      select: 'false',
      taskId: i.toString(),
      name: taskTitle,
      title: taskTitle,
      status: i % 3 === 0 ? 'In Progress' : i % 3 === 1 ? 'To Do' : 'Done',
      priority: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
      startDate: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      deadline: `2023-${((i + 2) % 12) + 1}-${((i + 10) % 28) + 1}`
    });
  }
  return largeTasks;
}; 