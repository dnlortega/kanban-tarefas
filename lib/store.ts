import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskInput, TaskStatus } from "@/types/task";

type ColumnMap = Record<TaskStatus, string[]>;

interface KanbanState {
  tasksById: Record<string, Task>;
  columns: ColumnMap;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  setColumns: (columns: ColumnMap) => void;
  moveTask: (id: string, toStatus: TaskStatus, toIndex: number) => void;
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedTasks: Task[] = [
  {
    id: "seed-1",
    title: "Planejar sprint",
    description: "Definir escopo e prioridades da próxima sprint.",
    status: "todo",
    createdAt: Date.now(),
  },
  {
    id: "seed-2",
    title: "Revisar layout do dashboard",
    description: "Ajustar espaçamentos e cores conforme o design.",
    status: "todo",
    createdAt: Date.now(),
  },
  {
    id: "seed-3",
    title: "Implementar autenticação",
    description: "Login com e-mail e senha usando NextAuth.",
    status: "doing",
    createdAt: Date.now(),
  },
  {
    id: "seed-4",
    title: "Configurar CI/CD",
    description: "Pipeline de build e deploy automático.",
    status: "done",
    createdAt: Date.now(),
  },
];

const seedColumns: ColumnMap = {
  todo: ["seed-1", "seed-2"],
  doing: ["seed-3"],
  done: ["seed-4"],
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      tasksById: Object.fromEntries(seedTasks.map((t) => [t.id, t])),
      columns: seedColumns,

      addTask: (input) =>
        set((state) => {
          const id = createId();
          const task: Task = {
            id,
            title: input.title,
            description: input.description,
            status: input.status,
            createdAt: Date.now(),
          };
          return {
            tasksById: { ...state.tasksById, [id]: task },
            columns: {
              ...state.columns,
              [input.status]: [id, ...state.columns[input.status]],
            },
          };
        }),

      updateTask: (id, input) =>
        set((state) => {
          const existing = state.tasksById[id];
          if (!existing) return state;

          const statusChanged = existing.status !== input.status;
          const updatedTask: Task = { ...existing, ...input };

          if (!statusChanged) {
            return {
              tasksById: { ...state.tasksById, [id]: updatedTask },
            };
          }

          const fromColumn = state.columns[existing.status].filter(
            (taskId) => taskId !== id
          );
          const toColumn = [id, ...state.columns[input.status]];

          return {
            tasksById: { ...state.tasksById, [id]: updatedTask },
            columns: {
              ...state.columns,
              [existing.status]: fromColumn,
              [input.status]: toColumn,
            },
          };
        }),

      deleteTask: (id) =>
        set((state) => {
          const existing = state.tasksById[id];
          if (!existing) return state;

          const restTasks = { ...state.tasksById };
          delete restTasks[id];

          return {
            tasksById: restTasks,
            columns: {
              ...state.columns,
              [existing.status]: state.columns[existing.status].filter(
                (taskId) => taskId !== id
              ),
            },
          };
        }),

      setColumns: (columns) => set({ columns }),

      moveTask: (id, toStatus, toIndex) =>
        set((state) => {
          const existing = state.tasksById[id];
          if (!existing) return state;
          const fromStatus = existing.status;

          const fromItems = state.columns[fromStatus].filter(
            (taskId) => taskId !== id
          );
          const toItemsBase =
            fromStatus === toStatus ? fromItems : state.columns[toStatus];
          const toItems = [
            ...toItemsBase.slice(0, toIndex),
            id,
            ...toItemsBase.slice(toIndex),
          ];

          return {
            tasksById:
              fromStatus === toStatus
                ? state.tasksById
                : {
                    ...state.tasksById,
                    [id]: { ...existing, status: toStatus },
                  },
            columns: {
              ...state.columns,
              [fromStatus]: fromStatus === toStatus ? toItems : fromItems,
              [toStatus]: toItems,
            },
          };
        }),
    }),
    {
      name: "kanban-storage",
    }
  )
);
