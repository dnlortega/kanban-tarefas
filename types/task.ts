export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
}

export type TaskInput = Pick<Task, "title" | "description" | "status">;

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: ColumnDefinition[] = [
  { id: "todo", title: "A Fazer" },
  { id: "doing", title: "Fazendo" },
  { id: "done", title: "Concluído" },
];
