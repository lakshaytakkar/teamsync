import { useState } from "react";
import { Star, Plus, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDialog } from "@/components/hr/form-dialog";
import { chinaHotels, tourPackages } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cities = ["All", "Guangzhou", "Hong Kong", "Shanghai", "Yiwu", "Foshan", "Wuxi"];
const starFilters = ["All", "3", "4", "5"];

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function EventsHotels() {
  const loading = useSimulatedLoading(600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("All");
  const [starFilter, setStarFilter] = useState("All");

  const filtered = chinaHotels.filter((h) => {
    if (cityFilter !== "All" && h.city !== cityFilter) return false;
    if (starFilter !== "All" && h.stars !== parseInt(starFilter)) return false;
    return true;
  });

  const totalHotels = chinaHotels.length;
  const uniqueCities = new Set(chinaHotels.map((h) => h.city)).size;
  const avgRate = Math.round(chinaHotels.reduce((s, h) => s + h.our_rate_usd, 0) / chinaHotels.length);

  const getPackageName = (id: string) => {
    const p = tourPackages.find((p) => p.id === id);
    return p ? p.name.substring(0, 30) + (p.name.length > 30 ? "…" : "") : id;
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="hotels-title">China Hotel Directory</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{totalHotels} partner hotels · {uniqueCities} cities</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: "#E91E63" }}
              data-testid="button-add-hotel"
            >
              <Plus className="size-4" />
              Add Hotel
            </Button>
          </div>
        </Fade>

        {loading ? (
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <Fade direction="up" delay={0.05} className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-hotels">
              <p className="text-xl font-bold" style={{ color: "#E91E63" }}>{totalHotels}</p>
              <p className="text-xs text-muted-foreground">Partner Hotels</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-cities">
              <p className="text-xl font-bold text-foreground">{uniqueCities}</p>
              <p className="text-xs text-muted-foreground">Cities Covered</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-avg-rate">
              <p className="text-xl font-bold text-foreground">${avgRate}</p>
              <p className="text-xs text-muted-foreground">Avg Our Rate/Night</p>
            </div>
          </Fade>
        )}

        <Fade direction="up" delay={0.08} className="mb-5 flex flex-wrap gap-2">
          <div className="flex gap-1.5">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${cityFilter === city ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                data-testid={`filter-city-${city}`}
              >
                {city}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-4">
            {starFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${starFilter === s ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                data-testid={`filter-stars-${s}`}
              >
                {s === "All" ? "All Stars" : `${s}★`}
              </button>
            ))}
          </div>
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((hotel) => (
              <StaggerItem key={hotel.id}>
                <div
                  className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  data-testid={`card-hotel-${hotel.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold leading-tight" data-testid={`text-hotel-name-${hotel.id}`}>{hotel.name}</h3>
                      <p className="text-xs text-muted-foreground">{hotel.city}, {hotel.country}</p>
                    </div>
                    <div className={`size-2.5 rounded-full shrink-0 mt-1 ${hotel.status === "active" ? "bg-green-500" : "bg-red-400"}`} data-testid={`dot-status-${hotel.id}`} />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <StarDisplay count={hotel.stars} />
                    <span className="text-xs text-muted-foreground">{hotel.stars}-star</span>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-2.5 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Listed rate</span>
                      <span className="text-xs line-through text-muted-foreground">${hotel.rate_usd_per_night}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium">Our rate</span>
                      <span className="text-sm font-bold text-green-600" data-testid={`text-rate-${hotel.id}`}>${hotel.our_rate_usd}/night</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Contact</p>
                    <p className="text-sm font-medium">{hotel.contact_person}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <a
                        href={`https://wa.me/${hotel.contact_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        data-testid={`btn-wa-hotel-${hotel.id}`}
                      >
                        <Button variant="ghost" size="icon" className="size-7 text-green-600 hover:bg-green-50">
                          <SiWhatsapp className="size-3.5" />
                        </Button>
                      </a>
                      <a href={`mailto:${hotel.contact_email}`} data-testid={`btn-email-hotel-${hotel.id}`}>
                        <Button variant="ghost" size="icon" className="size-7">
                          <Mail className="size-4" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  {hotel.packages_used_in.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Used in</p>
                      <div className="flex flex-wrap gap-1">
                        {hotel.packages_used_in.map((pkgId) => (
                          <span key={pkgId} className="rounded bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 px-1.5 py-0.5 text-xs">
                            {getPackageName(pkgId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{a}</span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground self-center">+{hotel.amenities.length - 4}</span>
                    )}
                  </div>

                  {hotel.notes && (
                    <p className="mt-3 pt-3 border-t text-xs text-muted-foreground line-clamp-2">{hotel.notes}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Partner Hotel"
          description="Add a new hotel to the China directory."
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Add Hotel"
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="h-name">Hotel Name</Label>
              <Input id="h-name" placeholder="Hotel full name" data-testid="input-hotel-name" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="h-city">City</Label>
                <Input id="h-city" placeholder="Guangzhou" data-testid="input-hotel-city" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="h-country">Country</Label>
                <Input id="h-country" placeholder="China" defaultValue="China" data-testid="input-hotel-country" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="h-stars">Stars</Label>
                <Select>
                  <SelectTrigger id="h-stars" data-testid="input-hotel-stars">
                    <SelectValue placeholder="★" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3-star</SelectItem>
                    <SelectItem value="4">4-star</SelectItem>
                    <SelectItem value="5">5-star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="h-listed-rate">Listed Rate (USD/night)</Label>
                <Input id="h-listed-rate" type="number" placeholder="e.g. 150" data-testid="input-hotel-rate" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="h-our-rate">Our Rate (USD/night)</Label>
                <Input id="h-our-rate" type="number" placeholder="e.g. 120" data-testid="input-hotel-our-rate" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="h-contact">Contact Person</Label>
              <Input id="h-contact" placeholder="Name (Title)" data-testid="input-hotel-contact" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="h-phone">Phone</Label>
                <Input id="h-phone" placeholder="+86 ..." data-testid="input-hotel-phone" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="h-email">Email</Label>
                <Input id="h-email" type="email" placeholder="hotel@email.com" data-testid="input-hotel-email" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="h-notes">Notes</Label>
              <Input id="h-notes" placeholder="Any special notes about this hotel..." data-testid="input-hotel-notes" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
