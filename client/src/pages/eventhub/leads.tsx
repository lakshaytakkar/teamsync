import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, Plus, MessageSquare, Calendar, Users as UsersIcon, IndianRupee, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/ui/animated";
import { verticals } from "@/lib/verticals-config";
import { eventInquiries } from "@/lib/mock-data-eventhub";
import { cn } from "@/lib/utils";

const EVENT_TYPES = ["All", "Corporate", "Wedding", "Social", "Conference", "Exhibition"];

export default function EventInquiries() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const eventhubVertical = verticals.find(v => v.id === "eventhub")!;

  const filteredInquiries = eventInquiries.filter(inquiry => {
    const matchesSearch = inquiry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || inquiry.eventType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Contacted": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Proposal Sent": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Qualified": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Converted": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Lost": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 px-16 py-6 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Event Inquiries</h1>
            <p className="text-muted-foreground">Incoming requests for event planning and management</p>
          </div>
          <Button 
            className="w-full md:w-auto"
            style={{ backgroundColor: eventhubVertical.color, color: "#fff" }}
            data-testid="button-add-inquiry"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Inquiry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-elevate transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                  <p className="text-2xl font-bold">{eventInquiries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                  <Plus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Today</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                  <ArrowRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                  <IndianRupee className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                  <p className="text-2xl font-bold">₹85.5L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeFilter === type
                    ? "text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                style={activeFilter === type ? { backgroundColor: eventhubVertical.color } : {}}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inquiries..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-inquiries"
            />
          </div>
        </div>

        {/* Inquiries List */}
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-lg font-bold">
                      {inquiry.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{inquiry.clientName}</h3>
                        <Badge variant="outline" className="font-normal">
                          {inquiry.id}
                        </Badge>
                        <Badge className={cn("ml-2", getStatusColor(inquiry.status))}>
                          {inquiry.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          {inquiry.eventType}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {inquiry.expectedGuests} Guests
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {inquiry.tentativeDate}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          {inquiry.budgetRange}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block mr-4">
                      <p className="text-xs text-muted-foreground mb-1">Source: {inquiry.source}</p>
                      <p className="text-xs text-muted-foreground">Created: {inquiry.createdAt}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex-1 md:flex-none no-default-hover-elevate"
                      onClick={() => setLocation(`/hub/leads/${inquiry.id}`)}
                      data-testid={`button-followup-${inquiry.id}`}
                    >
                      Follow Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No inquiries found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
