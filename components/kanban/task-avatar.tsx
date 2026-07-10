import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials, stringToColor } from "@/lib/utils";

interface TaskAvatarProps {
  name: string;
  className?: string;
}

export function TaskAvatar({ name, className }: TaskAvatarProps) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback
        style={{ backgroundColor: stringToColor(name), color: "white" }}
        className="text-[10px] font-semibold"
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
