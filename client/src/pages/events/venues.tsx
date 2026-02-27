import { useState, useMemo } from "react";
import { MapPin, Users, Star, IndianRupee, Filter } from "lucide-react";
import { PageBanner } from "@/components/hr/page-banner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { venues } from "@/lib/mock-data-events";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusColors: Record<string, { dot: string; text: string }> = {
  available: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  booked: { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  maintenance: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
};

const uniqueCities = Array.from(new Set(venues.map((v) => v.city)));
const uniqueTypes = Array.from(new Set(venues.map((v) => v.type)));
const uniqueStatuses = Array.from(new Set(venues.map((v) => v.status)));

export default function VenuesPage() {
  const loading = useSimulatedLoading();
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      if (cityFilter !== "all" && v.city !== cityFilter) return false;
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [cityFilter, typeFilter, statusFilter]);

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner title="Venue Directory" iconSrc="/3d-icons/departments.webp" />

        <div className="mb-5 flex flex-wrap items-center gap-3" data-testid="venue-filters">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm" data-testid="filter-city">
              <Filter className="mr-1.5 size-3 text-muted-foreground" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm" data-testid="filter-type">
              <Filter className="mr-1.5 size-3 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm" data-testid="filter-status">
              <Filter className="mr-1.5 size-3 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border bg-background p-5">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => {
              const sc = statusColors[venue.status] || statusColors.available;
              return (
                <StaggerItem key={venue.id}>
                  <div
                    className="rounded-xl border bg-background p-5 transition-shadow duration-200 hover:shadow-md"
                    data-testid={`card-venue-${venue.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold" data-testid={`text-venue-name-${venue.id}`}>{venue.name}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={cn("size-2 rounded-full", sc.dot)} />
                        <span className={cn("text-xs font-medium capitalize", sc.text)} data-testid={`text-venue-status-${venue.id}`}>
                          {venue.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span data-testid={`text-venue-city-${venue.id}`}>{venue.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 shrink-0" />
                        <span>Capacity: </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {venue.capacity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{venue.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="size-3.5 shrink-0" />
                        <span data-testid={`text-venue-price-${venue.id}`}>{formatCurrency(venue.pricePerDay)}/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground" data-testid={`text-venue-rating-${venue.id}`}>{venue.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {venue.amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-normal"
                          data-testid={`badge-amenity-${venue.id}-${amenity.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </PageTransition>
    </div>
  );
}
