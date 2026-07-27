"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types/task";
import { getTaskComments, addComment } from "@/lib/actions/tasks";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columnTitle: string;
  isDoneColumn: boolean;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  columnTitle,
  isDoneColumn,
}: TaskDetailDialogProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && task) {
      getTaskComments(task.id).then(setComments).catch(console.error);
    }
  }, [open, task]);

  if (!task) return null;

  const overdue = isOverdue(task.dueDate, isDoneColumn);

  function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    const content = newComment.trim();
    setNewComment("");
    
    startTransition(async () => {
      try {
        await addComment(task.id, content);
        const updated = await getTaskComments(task.id);
        setComments(updated);
      } catch (err) {
        toast.error("Erro ao enviar comentário");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>Status: {columnTitle}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {task.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert max-h-32 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {task.description}
                </ReactMarkdown>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {task.assignee && (
                <div className="flex items-center gap-1.5">
                  <TaskAvatar name={task.assignee.name} />
                  <span>{task.assignee.name}</span>
                </div>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    overdue
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.labels.map(label => (
                  <span
                    key={label.id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
                    style={{ 
                      backgroundColor: `${label.color}15`, 
                      color: label.color,
                      borderColor: `${label.color}30`
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Comentários ({comments.length})</h4>
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <TaskAvatar name={comment.author.name} />
                <div className="flex flex-col bg-background border rounded-lg p-3 rounded-tl-none w-full shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">{comment.author.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">Nenhum comentário ainda.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendComment} className="flex gap-2 relative">
            <Input
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="pr-10"
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 top-1 h-7 w-7" 
              disabled={!newComment.trim() || isPending}
            >
              <Send className="size-3" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
