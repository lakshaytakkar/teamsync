import { useState, useRef, useCallback, useEffect, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X, Maximize2, Minimize2, Plus, Send, Square, Trash2,
  MessageSquare, Sparkles, Clock, ChevronRight, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { VerticalContext } from "@/lib/vertical-store";
import aiIcon from "@assets/image_1772789030064.png";

interface AiConversation {
  id: string;
  title: string;
  vertical_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const SUGGESTIONS = [
  "Summarize active formations this week",
  "What tasks are overdue right now?",
  "Show me open escalations",
  "What's the compliance status?",
  "Which clients are at risk?",
  "Help me draft a client update",
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface ChatWindowProps {
  conversationId: string;
  initialMessages: AiMessage[];
  verticalId: string;
  onNewConversationId?: (id: string) => void;
  isExpanded: boolean;
}

function ChatWindow({
  conversationId,
  initialMessages,
  verticalId,
  isExpanded,
}: ChatWindowProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();

  const mappedInitial = initialMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    parts: [{ type: "text" as const, text: m.content }],
  }));

  const { messages, input, handleInputChange, handleSubmit, status, stop, setInput } =
    useChat({
      api: "/api/ai/chat",
      body: { conversationId, verticalId },
      initialMessages: mappedInitial,
      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      },
    });

  const isLoading = status === "submitted" || status === "streaming";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      setTimeout(() => formRef.current?.requestSubmit(), 50);
    },
    [setInput]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className={cn("py-4", isExpanded ? "px-8 max-w-3xl mx-auto w-full" : "px-4")}>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
                  <img src={aiIcon} alt="TeamSync AI" className="w-8 h-8" />
                </div>
              }
              title="TeamSync AI"
              description="Ask me anything about your business operations across all verticals."
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2 mx-auto">
                <img src={aiIcon} alt="TeamSync AI" className="w-8 h-8" />
              </div>
              <div className="space-y-1 mb-5">
                <h3 className="font-semibold text-base">TeamSync AI</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your intelligent co-pilot for business operations. Ask me anything.
                </p>
              </div>
              <Suggestions className="justify-center flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={handleSuggestionClick}
                    className="text-xs"
                  />
                ))}
              </Suggestions>
            </ConversationEmptyState>
          ) : (
            <>
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>{message.content}</MessageResponse>
                    ) : (
                      <span>{message.content}</span>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer className="text-sm" duration={1.5}>
                      TeamSync AI is thinking…
                    </Shimmer>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length > 0 && messages.length < 3 && (
        <div className={cn("px-4 pb-2", isExpanded && "px-8 max-w-3xl mx-auto w-full")}>
          <Suggestions>
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <Suggestion
                key={s}
                suggestion={s}
                onClick={handleSuggestionClick}
                className="text-xs"
              />
            ))}
          </Suggestions>
        </div>
      )}

      <div className={cn("border-t p-3", isExpanded && "px-8 pb-6")}>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className={cn("relative flex items-end gap-2 rounded-xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring px-3 py-2", isExpanded && "max-w-3xl mx-auto")}>
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask TeamSync AI…"
              rows={1}
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 text-sm min-h-[28px] max-h-32"
              data-testid="ai-chat-input"
            />
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                data-testid="ai-chat-stop"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="h-8 w-8 shrink-0 rounded-lg"
                data-testid="ai-chat-send"
              >
                <Send className="size-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const { currentVertical } = useContext(VerticalContext);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const { data: savedMessages = [] } = useQuery<AiMessage[]>({
    queryKey: ["/api/ai/conversations", activeConversationId, "messages"],
    enabled: !!activeConversationId,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId: currentVertical?.id }),
      });
      return res.json() as Promise<AiConversation>;
    },
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      setChatKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setActiveConversationId(null);
      setChatKey((k) => k + 1);
    },
  });

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    if (!activeConversationId) {
      await createConversationMutation.mutateAsync();
    }
  }, [activeConversationId, createConversationMutation]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
  }, []);

  const handleNewChat = useCallback(() => {
    createConversationMutation.mutate();
  }, [createConversationMutation]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setChatKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && isOpen) {
        e.preventDefault();
        handleClose();
      }
      if (e.key === "Escape" && isOpen) {
        if (isExpanded) setIsExpanded(false);
        else handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExpanded, handleClose]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center focus:outline-none"
            style={{ filter: "drop-shadow(0 4px 16px rgba(59,130,246,0.35))" }}
            aria-label="Open TeamSync AI"
            data-testid="ai-chat-trigger"
          >
            <img src={aiIcon} alt="TeamSync AI" className="w-14 h-14 object-contain" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            key="fullpage"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex bg-background"
          >
            <div className="w-[280px] flex flex-col border-r bg-sidebar shrink-0">
              <div className="flex items-center gap-2.5 px-4 py-4 border-b">
                <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                <span className="font-semibold text-sm">TeamSync AI</span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setIsExpanded(false)}
                    data-testid="ai-chat-minimize"
                    title="Compact view"
                  >
                    <Minimize2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleClose}
                    data-testid="ai-chat-close-expanded"
                    title="Close"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="p-3 border-b">
                <Button
                  className="w-full h-9 gap-2 justify-start text-sm font-medium"
                  onClick={handleNewChat}
                  disabled={createConversationMutation.isPending}
                  data-testid="ai-chat-new"
                >
                  <Plus className="size-3.5" />
                  New Chat
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                  {conversations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6 px-3">
                      Your conversations will appear here
                    </p>
                  )}
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group flex items-start gap-2 rounded-lg px-2.5 py-2 cursor-pointer text-sm transition-colors",
                        activeConversationId === conv.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      )}
                      onClick={() => handleSelectConversation(conv.id)}
                      data-testid={`ai-conversation-${conv.id}`}
                    >
                      <MessageSquare className="size-3.5 mt-0.5 shrink-0 opacity-60" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate leading-tight text-xs">
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="size-2.5 opacity-50" />
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(conv.updated_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(conv.id);
                        }}
                        data-testid={`ai-delete-conversation-${conv.id}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-3" />
                  <span>Powered by OpenAI</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <Bot className="size-4 text-primary" />
                <span className="font-semibold text-sm">
                  {conversations.find((c) => c.id === activeConversationId)?.title ?? "New Chat"}
                </span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ChevronRight className="size-3.5" />
                  <span className="capitalize">{currentVertical?.id ?? "all"}</span>
                </div>
              </div>

              {activeConversationId && (
                <ChatWindow
                  key={`expanded-${activeConversationId}-${chatKey}`}
                  conversationId={activeConversationId}
                  initialMessages={savedMessages}
                  verticalId={currentVertical?.id ?? ""}
                  isExpanded
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isExpanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[420px] flex flex-col bg-background border-l shadow-2xl"
            >
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b shrink-0">
                <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-none">TeamSync AI</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                    {currentVertical?.id ?? "All verticals"} assistant
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setIsExpanded(true)}
                    data-testid="ai-chat-expand"
                    title="Expand to full screen"
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleNewChat}
                    data-testid="ai-chat-new-drawer"
                    title="New chat"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleClose}
                    data-testid="ai-chat-close"
                    title="Close"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {activeConversationId ? (
                  <ChatWindow
                    key={`drawer-${activeConversationId}-${chatKey}`}
                    conversationId={activeConversationId}
                    initialMessages={savedMessages}
                    verticalId={currentVertical?.id ?? ""}
                    isExpanded={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Shimmer className="text-sm text-muted-foreground">
                      Starting a new conversation…
                    </Shimmer>
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 border-t shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Sparkles className="size-3" />
                    <span>Powered by OpenAI via Replit</span>
                  </div>
                  {conversations.length > 0 && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-[10px] text-primary hover:underline"
                      data-testid="ai-view-history"
                    >
                      View history ({conversations.length})
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
