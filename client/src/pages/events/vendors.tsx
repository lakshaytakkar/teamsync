import { useState } from "react";
import { Star, Plus, Mail, Crown } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDialog } from "@/components/hr/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tourVendors, type VendorCategory } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";

const categoryConfig: Record<VendorCategory, { label: string; color: string }> = {
  ground_partner: { label: "Ground Partner", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  hotel: { label: "Hotel", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  guide: { label: "Guide", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  visa_agent: { label: "Visa Agent", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  transport: { label: "Transport", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  flights: { label: "Flights", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  insurance: { label: "Insurance", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

const categoryFilters: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ground_partner", label: "Ground Partner" },
  { key: "guide", label: "Guide" },
  { key: "visa_agent", label: "Visa Agent" },
  { key: "transport", label: "Transport" },
  { key: "flights", label: "Flights" },
  { key: "insurance", label: "Insurance" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </div>
  );
}

export default function EventsVendors() {
  const loading = useSimulatedLoading(600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const sortedVendors = [...tourVendors].sort((a, b) => {
    if (a.category === "ground_partner") return -1;
    if (b.category === "ground_partner") return 1;
    return 0;
  });

  const filtered = sortedVendors.filter((v) => categoryFilter === "all" || v.category === categoryFilter);
  const activeCount = tourVendors.filter((v) => v.status === "active").length;

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="vendors-title">Vendors & Partners</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{tourVendors.length} vendors · {activeCount} active</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: "#E91E63" }}
              data-testid="button-add-vendor"
            >
              <Plus className="size-4" />
              Add Vendor
            </Button>
          </div>
        </Fade>

        <Fade direction="up" delay={0.05} className="mb-5 flex flex-wrap gap-2">
          {categoryFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setCategoryFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${categoryFilter === f.key ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              data-testid={`filter-vendor-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </Fade>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
              </div>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((vendor) => {
              const cat = categoryConfig[vendor.category];
              const isKeyPartner = vendor.category === "ground_partner";

              return (
                <StaggerItem key={vendor.id}>
                  <div
                    className={`rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isKeyPartner ? "border-pink-300 dark:border-pink-800 ring-1 ring-pink-200 dark:ring-pink-900" : "border-border"}`}
                    data-testid={`card-vendor-${vendor.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-sm font-bold" data-testid={`text-vendor-name-${vendor.id}`}>{vendor.name}</h3>
                          {isKeyPartner && (
                            <span className="flex items-center gap-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 text-xs font-semibold">
                              <Crown className="size-2.5" />KEY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{vendor.city}, {vendor.country}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`size-2 rounded-full ${vendor.status === "active" ? "bg-green-500" : "bg-red-400"}`} />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.color}`} data-testid={`badge-cat-${vendor.id}`}>
                          {cat.label}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
                      <p className="text-sm font-medium">{vendor.contact_person}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {vendor.whatsapp && (
                          <a href={`https://wa.me/${vendor.whatsapp}`} target="_blank" rel="noreferrer" data-testid={`btn-wa-vendor-${vendor.id}`}>
                            <Button variant="ghost" size="icon" className="size-7 text-green-600 hover:bg-green-50">
                              <SiWhatsapp className="size-3.5" />
                            </Button>
                          </a>
                        )}
                        <a href={`mailto:${vendor.email}`} data-testid={`btn-email-vendor-${vendor.id}`}>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Mail className="size-4" />
                          </Button>
                        </a>
                        <a href={`tel:${vendor.phone}`} className="text-xs text-blue-500 hover:underline ml-1" data-testid={`tel-vendor-${vendor.id}`}>
                          {vendor.phone}
                        </a>
                      </div>
                    </div>

                    <div className="mb-3">
                      <StarRating rating={vendor.rating} />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {vendor.services.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                      {vendor.services.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">+{vendor.services.length - 4}</span>
                      )}
                    </div>

                    {vendor.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-3 border-t">{vendor.notes}</p>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Vendor"
          description="Add a new vendor or partner to the GoyoTours network."
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Add Vendor"
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="v-name">Vendor Name</Label>
                <Input id="v-name" placeholder="Company name" data-testid="input-vendor-name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="v-category">Category</Label>
                <Select>
                  <SelectTrigger id="v-category" data-testid="input-vendor-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="v-country">Country</Label>
                <Input id="v-country" placeholder="China / India" data-testid="input-vendor-country" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="v-city">City</Label>
                <Input id="v-city" placeholder="City" data-testid="input-vendor-city" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="v-contact">Contact Person</Label>
              <Input id="v-contact" placeholder="Full name" data-testid="input-vendor-contact" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="v-phone">Phone</Label>
                <Input id="v-phone" placeholder="+86 / +91 ..." data-testid="input-vendor-phone" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="v-wa">WhatsApp</Label>
                <Input id="v-wa" placeholder="Country code + number" data-testid="input-vendor-wa" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="v-email">Email</Label>
              <Input id="v-email" type="email" placeholder="vendor@email.com" data-testid="input-vendor-email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="v-notes">Notes</Label>
              <Input id="v-notes" placeholder="Key notes about this vendor..." data-testid="input-vendor-notes" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
