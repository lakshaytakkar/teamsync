import { type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KanbanCardItem {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  badges?: Array<{ label: string; variant?: string }>;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignee?: string;
}

const priorityConfig: Record<string, { dot: string; label: string }> = {
  low: { dot: "bg-emerald-500", label: "Low" },
  medium: { dot: "bg-yellow-500", label: "Medium" },
  high: { dot: "bg-orange-500", label: "High" },
  urgent: { dot: "bg-red-500", label: "Urgent" },
};

interface KanbanCardProps {
  item: KanbanCardItem;
  onClick?: (item: KanbanCardItem) => void;
  className?: string;
}

export function KanbanCard({ item, onClick, className }: KanbanCardProps) {
  const priority = item.priority ? priorityConfig[item.priority] : null;

  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover-elevate",
        className
      )}
      onClick={() => onClick?.(item)}
      data-testid={`kanban-card-${item.id}`}
    >
      <div className="flex items-start gap-2">
        {priority && (
          <span
            className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", priority.dot)}
            data-testid={`kanban-card-priority-${item.id}`}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" data-testid={`kanban-card-title-${item.id}`}>
            {item.title}
          </p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid={`kanban-card-subtitle-${item.id}`}>
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {item.badges && item.badges.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap" data-testid={`kanban-card-badges-${item.id}`}>
          {item.badges.map((b) => (
            <Badge
              key={b.label}
              variant={(b.variant as any) ?? "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {b.label}
            </Badge>
          ))}
        </div>
      )}

      {(item.dueDate || item.assignee || item.avatar) && (
        <div className="flex items-center justify-between gap-2 mt-2">
          {item.dueDate && (
            <span className="text-[11px] text-muted-foreground" data-testid={`kanban-card-due-${item.id}`}>
              {item.dueDate}
            </span>
          )}
          {(item.assignee || item.avatar) && (
            <Avatar className="h-5 w-5 shrink-0">
              {item.avatar && <AvatarImage src={item.avatar} alt={item.assignee ?? ""} />}
              <AvatarFallback className="text-[9px]">
                {(item.assignee ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
    </Card>
  );
}

export interface KanbanColumnData {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCardItem[];
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  onCardClick?: (card: KanbanCardItem) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

export function KanbanColumn({ column, onCardClick, onAddCard, className }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-72 shrink-0 rounded-lg bg-muted/50 dark:bg-muted/30",
        className
      )}
      data-testid={`kanban-column-${column.id}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {column.color && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: column.color }}
            />
          )}
          <span className="text-sm font-semibold truncate" data-testid={`kanban-column-title-${column.id}`}>
            {column.title}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {column.cards.length}
          </Badge>
        </div>
        {onAddCard && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onAddCard(column.id)}
            data-testid={`kanban-column-add-${column.id}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2" data-testid={`kanban-column-cards-${column.id}`}>
        {column.cards.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground" data-testid={`kanban-column-empty-${column.id}`}>
            No cards
          </div>
        ) : (
          column.cards.map((card) => (
            <KanbanCard key={card.id} item={card} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onCardClick?: (card: KanbanCardItem) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

export function KanbanBoard({ columns, onCardClick, onAddCard, className }: KanbanBoardProps) {
  if (columns.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="kanban-board-empty">
        No columns
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-4 overflow-x-auto pb-4", className)}
      data-testid="kanban-board"
    >
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          onCardClick={onCardClick}
          onAddCard={onAddCard}
        />
      ))}
    </div>
  );
}
