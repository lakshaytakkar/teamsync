import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Hash, 
  Users, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  detectVerticalFromUrl 
} from "@/lib/verticals-config";
import { 
  chatChannels, 
  chatMessages, 
  verticalMembers,
  type ChatChannel,
  type ChatMessage
} from "@/lib/mock-data-shared";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLoading } from "@/components/ui/page-loading";

export default function UniversalChat() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);
  
  const [activeTab, setActiveTab] = useState<"channel" | "dm">("channel");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter channels/DMs by vertical
  const filteredChannels = useMemo(() => {
    if (!vertical) return [];
    return chatChannels.filter(c => c.verticalId === vertical.id && c.type === "channel");
  }, [vertical]);

  const filteredDMs = useMemo(() => {
    if (!vertical) return [];
    return chatChannels.filter(c => c.verticalId === vertical.id && c.type === "dm");
  }, [vertical]);

  // Set default active channel
  useEffect(() => {
    if (!activeChannelId) {
      const pinned = filteredChannels.find(c => c.isPinned);
      if (pinned) {
        setActiveChannelId(pinned.id);
      } else if (filteredChannels.length > 0) {
        setActiveChannelId(filteredChannels[0].id);
      }
    }
  }, [filteredChannels, activeChannelId]);

  const activeChannel = useMemo(() => {
    return chatChannels.find(c => c.id === activeChannelId);
  }, [activeChannelId]);

  const messages = useMemo(() => {
    if (!activeChannelId) return [];
    return chatMessages.filter(m => m.channelId === activeChannelId);
  }, [activeChannelId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, this would be a mutation
    setMessageText("");
  };

  const filteredList = useMemo(() => {
    const list = activeTab === "channel" ? filteredChannels : filteredDMs;
    if (!searchQuery) return list;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, filteredChannels, filteredDMs, searchQuery]);

  if (loading) return <PageLoading />;
  if (!vertical) return <div>Vertical not found</div>;

  return (
    <PageTransition className="h-full px-16 py-6 lg:px-24 flex gap-6 overflow-hidden">
      {/* Left Sidebar */}
      <aside 
        className="w-[380px] shrink-0 flex flex-col bg-card border rounded-xl shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none overflow-hidden"
      >
        <div className="p-5 border-b space-y-4">
          <h2 className="text-base font-semibold">Team Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-chats"
            />
          </div>
          
          <div className="flex p-1 bg-muted rounded-lg border">
            <button
              onClick={() => setActiveTab("channel")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "channel" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-channels"
            >
              <Hash className="h-4 w-4" />
              Channels
            </button>
            <button
              onClick={() => setActiveTab("dm")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "dm" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-dms"
            >
              <Users className="h-4 w-4" />
              Direct Messages
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/50">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveChannelId(item.id)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                  activeChannelId === item.id ? "bg-muted" : ""
                )}
                data-testid={item.type === "channel" ? `channel-item-${item.id}` : `dm-item-${item.id}`}
              >
                {item.type === "channel" ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 border border-primary/20 rounded-lg text-primary">
                    <Hash className="h-5 w-5" />
                  </div>
                ) : (
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={getPersonAvatar(item.name)} alt={item.name} />
                    <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[14px] truncate">
                      {item.type === "channel" ? `#${item.name}` : item.name}
                    </span>
                    {item.type === "dm" && (
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {item.lastMessageTime}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-muted-foreground truncate">
                    {item.lastMessage || item.description}
                  </p>
                </div>

                {item.unreadCount > 0 && (
                  <div className="h-[18px] min-w-[18px] flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px] font-medium px-1">
                    {item.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Right Content Panel */}
      <main 
        className="flex-1 flex flex-col bg-card border rounded-xl shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none overflow-hidden"
      >
        {activeChannel ? (
          <>
            {/* Header */}
            <header className="h-[72px] px-6 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                {activeChannel.type === "channel" ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 border border-primary/20 rounded-lg text-primary">
                    <Hash className="h-5 w-5" />
                  </div>
                ) : (
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={getPersonAvatar(activeChannel.name)} alt={activeChannel.name} />
                    <AvatarFallback>{activeChannel.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold truncate">
                    {activeChannel.type === "channel" ? `#${activeChannel.name}` : activeChannel.name}
                  </h3>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {activeChannel.description || "Active now"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-muted/30">
              <ScrollArea className="h-full p-6">
                <div className="space-y-6">
                  {messages.map((msg, idx) => {
                    const showHeader = idx === 0 || messages[idx - 1].senderName !== msg.senderName;
                    
                    return (
                      <Fade 
                        key={msg.id} 
                        direction="up" 
                        distance={10} 
                        delay={idx * 0.05}
                        className={cn(
                          "flex gap-3",
                          msg.isMe ? "flex-row-reverse" : "flex-row"
                        )}
                        data-testid={`message-${msg.id}`}
                      >
                        {!msg.isMe && (
                          <Avatar className="h-8 w-8 shrink-0 mt-1 border">
                            <AvatarImage src={getPersonAvatar(msg.senderName)} alt={msg.senderName} />
                            <AvatarFallback>{msg.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={cn(
                          "flex flex-col gap-1.5 max-w-[70%]",
                          msg.isMe ? "items-end" : "items-start"
                        )}>
                          {showHeader && (
                            <div className="flex items-center gap-2 px-1">
                              <span className="text-[13px] font-semibold">{msg.senderName}</span>
                              <span className="text-[11px] text-muted-foreground">{msg.timestamp}</span>
                            </div>
                          )}
                          <div className={cn(
                            "rounded-xl px-4 py-2.5 text-[14px] shadow-sm",
                            msg.isMe 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-card text-foreground"
                          )}>
                            {msg.content}
                          </div>
                        </div>
                      </Fade>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Bar */}
            <div className="border-t px-6 py-4 shrink-0 flex items-center gap-3 bg-card">
              <div className="flex-1 relative">
                <Input 
                  placeholder={`Message ${activeChannel.type === "channel" ? "#" + activeChannel.name : activeChannel.name}`}
                  className="pr-20 h-11 bg-muted/50 border-none focus-visible:ring-1"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  data-testid="input-message"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                className="h-11 px-6 shadow-sm"
                data-testid="btn-send"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <p className="text-sm">Select a channel or message to start chatting</p>
          </div>
        )}
      </main>
    </PageTransition>
  );
}

// Missing icon from lucide
import { MessageCircle } from "lucide-react";
