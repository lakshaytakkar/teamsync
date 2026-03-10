import { useState } from "react";
import { Send, User, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/animated";
import { portalEtsClient, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface PortalMessage {
  id: number;
  clientId: number;
  sender: "client" | "team";
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

function MessageBubble({ msg }: { msg: PortalMessage }) {
  const isClient = msg.sender === "client";
  const time = new Date(msg.createdAt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-3", isClient ? "flex-row-reverse" : "")} data-testid={`message-${msg.id}`}>
      <div className={cn(
        "size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        isClient
          ? "text-white"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      )} style={isClient ? { backgroundColor: ETS_PORTAL_COLOR } : undefined}>
        {isClient ? portalEtsClient.avatar : <Shield className="size-4" />}
      </div>
      <div className={cn("max-w-[75%]", isClient ? "items-end" : "")}>
        <div className={cn("flex items-center gap-2 mb-1 flex-wrap", isClient ? "flex-row-reverse" : "")}>
          <span className="text-xs font-semibold">{msg.senderName}</span>
          {!isClient && (
            <Badge variant="outline" className="text-[9px] h-4">ETS Team</Badge>
          )}
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isClient
            ? "text-white rounded-tr-md"
            : "bg-slate-100 dark:bg-slate-800 rounded-tl-md"
        )} style={isClient ? { backgroundColor: ETS_PORTAL_COLOR } : undefined}>
          {msg.content}
        </div>
        <div className={cn("text-[10px] text-muted-foreground mt-1", isClient ? "text-right" : "")}>
          {time}
          {!msg.read && !isClient && (
            <Badge variant="destructive" className="text-[8px] h-3.5 ml-2 px-1">New</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EtsPortalMessages() {
  const [draft, setDraft] = useState("");
  const clientId = portalEtsClient.id;

  const { data, isLoading } = useQuery<{ messages: PortalMessage[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "messages"],
  });

  const messages = data?.messages || [];

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/ets-portal/client/${clientId}/messages`, {
        content,
        senderName: portalEtsClient.name,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId, "messages"] });
    },
  });

  const handleSend = () => {
    if (!draft.trim() || sendMutation.isPending) return;
    sendMutation.mutate(draft.trim());
    setDraft("");
  };

  return (
    <PageTransition className="px-4 sm:px-8 py-6 lg:px-24 flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="shrink-0 mb-4">
        <h1 className="text-2xl font-bold font-heading" data-testid="text-messages-title">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with your EazyToSell franchise team</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="size-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
              <User className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold" data-testid="text-team-name">EazyToSell Team</p>
              <p className="text-xs text-muted-foreground">Your franchise support team</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" data-testid="messages-list">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn("flex gap-3", i % 2 === 1 ? "flex-row-reverse" : "")}>
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-2 max-w-[60%]">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="size-16 rounded-full flex items-center justify-center mb-4 bg-muted">
                <Send className="size-6" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation with your ETS team below</p>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))
          )}
        </div>

        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[120px] resize-none"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!draft.trim() || sendMutation.isPending}
              className="h-11 w-11 shrink-0 text-white"
              size="icon"
              style={{ backgroundColor: ETS_PORTAL_COLOR }}
              data-testid="button-send-message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}
