import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Star, Phone, Mail, Building2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PageShell, PageHeader, StatGrid, StatCard, IndexToolbar,
  DataTableContainer, DataTH, DataTD, DataTR, DetailModal,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";

interface FaireVendor {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  whatsapp: string | null;
  is_default: boolean;
  notes: string | null;
  created_at: string | null;
}

export default function FaireVendors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ vendors: FaireVendor[] }>({
    queryKey: ["/api/faire/vendors"],
    queryFn: async () => {
      const res = await fetch("/api/faire/vendors", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const vendors = data?.vendors ?? [];

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FaireVendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [fName, setFName] = useState("");
  const [fContact, setFContact] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fWhatsapp, setFWhatsapp] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fDefault, setFDefault] = useState(false);

  function openAdd() {
    setEditing(null);
    setFName(""); setFContact(""); setFEmail(""); setFWhatsapp(""); setFNotes(""); setFDefault(false);
    setFormOpen(true);
  }

  function openEdit(v: FaireVendor) {
    setEditing(v);
    setFName(v.name); setFContact(v.contact_name ?? ""); setFEmail(v.email ?? "");
    setFWhatsapp(v.whatsapp ?? ""); setFNotes(v.notes ?? ""); setFDefault(v.is_default);
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fName.trim()) throw new Error("Name is required");
      const body = { id: editing?.id, name: fName.trim(), contact_name: fContact.trim() || null, email: fEmail.trim() || null, whatsapp: fWhatsapp.trim() || null, notes: fNotes.trim() || null, is_default: fDefault };
      return apiRequest("POST", "/api/faire/vendors", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/vendors"] });
      setFormOpen(false);
      toast({ title: editing ? "Vendor updated" : "Vendor added" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/faire/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faire/vendors"] });
      setDeleteId(null);
      toast({ title: "Vendor deleted" });
    },
    onError: () => toast({ title: "Failed to delete vendor", variant: "destructive" }),
  });

  const filtered = vendors.filter(v => {
    if (!search) return true;
    const s = search.toLowerCase();
    return v.name.toLowerCase().includes(s) || (v.contact_name ?? "").toLowerCase().includes(s) || (v.email ?? "").toLowerCase().includes(s);
  });

  const defaultVendor = vendors.find(v => v.is_default);

  return (
    <PageShell>
      <PageHeader
        title="Vendors"
        subtitle="Supplier and fulfiller directory for Faire quotations"
        actions={
          <Button onClick={openAdd} style={{ background: BRAND_COLOR }} className="text-white hover:opacity-90" data-testid="btn-add-vendor">
            <Plus size={15} className="mr-1.5" /> Add Vendor
          </Button>
        }
      />

      <Fade>
        <StatGrid cols={3}>
          <StatCard label="Total Vendors" value={isLoading ? "—" : String(vendors.length)} icon={Building2} iconBg="#EFF6FF" iconColor="#2563EB" />
          <StatCard label="Default Vendor" value={isLoading ? "—" : (defaultVendor?.name ?? "Not set")} icon={Star} iconBg="#FFFBEB" iconColor="#D97706" />
          <StatCard label="With WhatsApp" value={isLoading ? "—" : String(vendors.filter(v => v.whatsapp).length)} icon={Phone} iconBg="#ECFDF5" iconColor="#059669" />
        </StatGrid>

        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search vendors…"
          color={BRAND_COLOR}
        />

        <DataTableContainer>
          {isLoading && <div className="h-48 animate-pulse bg-muted/30 rounded" />}
          {!isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {vendors.length === 0 ? "No vendors added yet. Click 'Add Vendor' to get started." : "No vendors match your search."}
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <DataTH>Vendor</DataTH>
                  <DataTH>Contact</DataTH>
                  <DataTH>Email</DataTH>
                  <DataTH>WhatsApp</DataTH>
                  <DataTH>Status</DataTH>
                  <DataTH>Notes</DataTH>
                  <DataTH align="right">Actions</DataTH>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(v => (
                  <DataTR key={v.id} data-testid={`row-vendor-${v.id}`}>
                    <DataTD>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND_COLOR }}>
                          {v.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          {v.is_default && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#FFFBEB", color: "#D97706" }}>DEFAULT</span>
                          )}
                        </div>
                      </div>
                    </DataTD>
                    <DataTD className="text-muted-foreground">{v.contact_name ?? "—"}</DataTD>
                    <DataTD>
                      {v.email ? (
                        <a href={`mailto:${v.email}`} className="text-primary hover:underline flex items-center gap-1" data-testid={`link-email-${v.id}`}>
                          <Mail size={12} /> {v.email}
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </DataTD>
                    <DataTD>
                      {v.whatsapp ? (
                        <a
                          href={`https://wa.me/${v.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#25D366] hover:underline"
                          data-testid={`link-whatsapp-${v.id}`}
                        >
                          <SiWhatsapp size={13} /> {v.whatsapp}
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </DataTD>
                    <DataTD>
                      <Badge variant="outline" className={v.is_default ? "border-amber-200 text-amber-700 bg-amber-50" : ""}>
                        {v.is_default ? "Default" : "Active"}
                      </Badge>
                    </DataTD>
                    <DataTD>
                      <p className="text-muted-foreground max-w-xs truncate">{v.notes ?? "—"}</p>
                    </DataTD>
                    <DataTD align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(v)} data-testid={`btn-edit-vendor-${v.id}`}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteId(v.id)} data-testid={`btn-delete-vendor-${v.id}`}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </DataTD>
                  </DataTR>
                ))}
              </tbody>
            </table>
          )}
        </DataTableContainer>
      </Fade>

      {/* Add/Edit modal */}
      <DetailModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Vendor" : "Add Vendor"}
        subtitle="Supplier contact details for quotation workflow"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} style={{ background: BRAND_COLOR }} className="text-white" disabled={saveMutation.isPending} data-testid="btn-save-vendor">
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Vendor"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Vendor / Company Name *</Label>
            <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. Suprans Lifestyle" data-testid="input-vendor-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Person</Label>
              <Input value={fContact} onChange={e => setFContact(e.target.value)} placeholder="e.g. Rajesh Kumar" data-testid="input-vendor-contact" />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input value={fWhatsapp} onChange={e => setFWhatsapp(e.target.value)} placeholder="+91 98765 43210" data-testid="input-vendor-whatsapp" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="vendor@example.com" data-testid="input-vendor-email" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="e.g. Specializes in pet toys, lead time 5 days" data-testid="input-vendor-notes" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none" data-testid="checkbox-vendor-default">
            <input type="checkbox" checked={fDefault} onChange={e => setFDefault(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium">Set as default vendor for auto-quotation</span>
          </label>
        </div>
      </DetailModal>

      {/* Delete confirmation */}
      <DetailModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Vendor"
        subtitle="This action cannot be undone."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="btn-confirm-delete-vendor">
              {deleteMutation.isPending ? "Deleting…" : "Delete Vendor"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{vendors.find(v => v.id === deleteId)?.name}</span>? Any product assignments linked to this vendor will also be removed.
        </p>
      </DetailModal>
    </PageShell>
  );
}
