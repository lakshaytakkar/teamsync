import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, MoreHorizontal, MessageSquare, Phone } from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailerLeads, type RetailerLead, type RetailerLeadStage } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

export default function FaireLeads() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<RetailerLeadStage | "All">("All");

  const filtered = faireRetailerLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.storeType.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All" || lead.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    );
  }

  const stages: (RetailerLeadStage | "All")[] = ["All", "Prospect", "Outreach", "Demo Scheduled", "Proposal Sent", "Partner Signed"];

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Retailer Leads</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Prospective retail partners in the acquisition funnel</p>
          </div>
          <Button style={{ backgroundColor: BRAND_COLOR }} className="text-white hover-elevate" data-testid="button-add-lead">
            Add New Lead
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: faireRetailerLeads.length },
            { label: "New Leads", value: faireRetailerLeads.filter(l => l.stage === "Prospect").length },
            { label: "Conversion Rate", value: `${Math.round((faireRetailerLeads.filter(l => l.stage === "Partner Signed").length / faireRetailerLeads.length) * 100)}%` },
            { label: "Pipeline Value", value: `$${(faireRetailerLeads.reduce((acc, curr) => acc + curr.dealValue, 0) / 1000).toFixed(1)}k` },
          ].map((stat, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
                  <Filter size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search retailers..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-leads"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                  stageFilter === stage 
                    ? "text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={stageFilter === stage ? { backgroundColor: BRAND_COLOR } : {}}
                data-testid={`filter-stage-${stage.toLowerCase().replace(" ", "-")}`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">Retailer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Source</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Stage</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Last Contact</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/20 transition-colors group">
                      <td className="p-4">
                        <div className="font-semibold">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.storeType}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{lead.location}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-normal">{lead.source}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className="font-medium"
                          style={{ 
                            backgroundColor: lead.stage === "Partner Signed" ? BRAND_COLOR : "transparent",
                            color: lead.stage === "Partner Signed" ? "white" : "inherit",
                            border: lead.stage === "Partner Signed" ? "none" : "1px solid currentColor"
                          }}
                        >
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{lead.lastContact}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-view-pipeline-${lead.id}`} onClick={() => setLocation("/faire/pipeline")}>
                            <Filter size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-contact-${lead.id}`}>
                            <Phone size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-message-${lead.id}`}>
                            <MessageSquare size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
