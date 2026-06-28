import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center py-12 text-muted-foreground", className)}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1">
        <Icon className="h-6 w-6 text-muted-foreground/70" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground text-base">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
