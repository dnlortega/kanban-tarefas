export interface Column {
  id: string;
  title: string;
  color: string;
  isDone: boolean;
  order: number;
}

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee: TaskAssignee | null;
  dueDate: string | null;
  order: number;
  columnId: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface TaskInput {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  columnId: string;
  labelIds?: string[];
}
