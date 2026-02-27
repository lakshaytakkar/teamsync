import { useState, useMemo } from "react";
import { Search, CheckCircle2, Circle, Users, UserCheck, Percent } from "lucide-react";
import { PageBanner } from "@/components/hr/page-banner";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { events, attendees, type Attendee } from "@/lib/mock-data-events";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const ticketVariant: Record<string, "info" | "success" | "neutral" | "warning"> = {
  VIP: "warning",
  Standard: "neutral",
};

export default function CheckinPage() {
  const loading = useSimulatedLoading();
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedInState, setCheckedInState] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    attendees.forEach((a) => {
      map[a.id] = a.checkedIn;
    });
    return map;
  });

  const filteredAttendees = useMemo(() => {
    let result = attendees.filter((a) => a.eventId === selectedEventId);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedEventId, searchQuery]);

  const eventAttendees = attendees.filter((a) => a.eventId === selectedEventId);
  const totalRegistered = eventAttendees.length;
  const checkedInCount = eventAttendees.filter((a) => checkedInState[a.id]).length;
  const checkedInPercentage = totalRegistered > 0 ? Math.round((checkedInCount / totalRegistered) * 100) : 0;

  const toggleCheckIn = (id: string) => {
    setCheckedInState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner title="Event Check-in" iconSrc="/3d-icons/leave.webp" />

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Select value={selectedEventId} onValueChange={(val) => { setSelectedEventId(val); setSearchQuery(""); }}>
            <SelectTrigger className="h-9 w-auto min-w-[260px] text-sm" data-testid="select-event">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-8 text-sm"
              data-testid="input-search-attendees"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
            <StaggerItem>
              <StatsCard
                title="Total Registered"
                value={totalRegistered}
                icon={<Users className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Checked In"
                value={checkedInCount}
                change={`of ${totalRegistered} registered`}
                changeType="positive"
                icon={<UserCheck className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Check-in Rate"
                value={`${checkedInPercentage}%`}
                icon={<Percent className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="rounded-lg border bg-background">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b last:border-b-0 px-5 py-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <Fade direction="up" delay={0.1}>
            <div className="rounded-lg border bg-background" data-testid="attendee-list">
              {filteredAttendees.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <p className="text-sm font-medium text-foreground">No attendees found</p>
                  <p className="text-xs text-muted-foreground">Try selecting a different event or adjusting your search</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAttendees.map((attendee) => {
                    const isChecked = checkedInState[attendee.id] || false;
                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                        data-testid={`row-attendee-${attendee.id}`}
                      >
                        <img
                          src={getPersonAvatar(attendee.name, 32)}
                          alt={attendee.name}
                          className="size-8 rounded-full shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" data-testid={`text-attendee-name-${attendee.id}`}>{attendee.name}</p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-attendee-company-${attendee.id}`}>{attendee.company}</p>
                        </div>
                        <StatusBadge
                          status={attendee.ticketType}
                          variant={ticketVariant[attendee.ticketType] || "neutral"}
                        />
                        {isChecked && attendee.checkedInAt && (
                          <span className="text-xs text-muted-foreground hidden sm:block" data-testid={`text-checkin-time-${attendee.id}`}>
                            {attendee.checkedInAt}
                          </span>
                        )}
                        <button
                          onClick={() => toggleCheckIn(attendee.id)}
                          className="shrink-0 transition-colors"
                          data-testid={`button-toggle-checkin-${attendee.id}`}
                          aria-label={isChecked ? "Mark as not checked in" : "Mark as checked in"}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground/50" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
