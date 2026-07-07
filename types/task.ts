export interface Column {
  id: string;
  title: string;
  color: string;
  isDone: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  dueDate: string | null;
  order: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface TaskInput {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  columnId: string;
}
