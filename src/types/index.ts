export interface TableRow {
  id: string;
  name: string;
  status: 'Done' | 'In progress' | 'To do';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  deadline: string;
}

export interface Column {
  id: string;
  title: string;
  key: keyof TableRow;
}
