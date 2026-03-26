import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Barcode, Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Smartphone, Banknote, Printer,
  PauseCircle, PlayCircle, X, Camera,
  ArrowLeft, Receipt, CheckCircle2, IndianRupee, Package,
  Store, Lock, Sparkles, Utensils, ShoppingBag,
  Copy, Check, User, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ProductImage } from "@/components/product-image";
import {
  POS_PRODUCTS, QUICK_ADD_PRODUCTS, POS_STORE,
  getNextReceiptNumber,
  type PosProduct, type PosBillItem, type PosHeldBill, type PosSale,
} from "@/lib/mock-data-pos-ets";

const ACCENT = "#EA7E41";

function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function StoreLocked() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md text-center px-6 space-y-6">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-orange-100 flex items-center justify-center shadow-lg">
          <Lock className="w-12 h-12 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-store-locked">Store Not Active</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your store needs to be live before you can access billing and operations.
            Complete your store setup to unlock the POS system.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
          <p className="text-xs font-semibold text-orange-800 mb-1">What&apos;s next?</p>
          <p className="text-xs text-orange-700">
            Our operations team will activate your store once your setup is complete.
            You&apos;ll get a notification when it&apos;s ready.
          </p>
        </div>
        <Button variant="outline" className="gap-2" data-testid="button-go-dashboard" onClick={() => window.location.href = "/portal-ets"}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

type PaymentMethod = "cash" | "upi" | "card";
type OrderType = "dine-in" | "takeaway";

const ALL_CATEGORIES = ["All", ...Array.from(new Set(POS_PRODUCTS.map(p => p.category)))];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <LayoutGrid className="w-3.5 h-3.5" />,
  Kitchen: <Utensils className="w-3.5 h-3.5" />,
  Electronics: <Sparkles className="w-3.5 h-3.5" />,
  Decor: <Store className="w-3.5 h-3.5" />,
  Bathroom: <Package className="w-3.5 h-3.5" />,
  Home: <Store className="w-3.5 h-3.5" />,
  Accessories: <ShoppingBag className="w-3.5 h-3.5" />,
  Storage: <Package className="w-3.5 h-3.5" />,
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] ?? <Package className="w-3.5 h-3.5" />;
}

function UpiQrModal({
  total,
  store,
  onConfirm,
  onClose,
}: {
  total: number;
  store: typeof POS_STORE;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(store.upiId)}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`;
  const refCode = `UPI-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const copyRef = () => {
    navigator.clipboard.writeText(refCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        data-testid="modal-upi-qr"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Scan QR Code</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Waiting for payment from customers</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-testid="button-close-upi-modal">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center px-5 pb-4 gap-3">
          <div className="p-3 border-2 border-gray-100 rounded-2xl bg-white shadow-sm">
            <QRCodeSVG value={upiUrl} size={180} data-testid="qr-code-upi" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pay to</p>
            <p className="text-sm font-bold text-gray-800">{store.upiId}</p>
            <p className="text-2xl font-black mt-1" style={{ color: ACCENT }} data-testid="text-upi-amount">{formatINR(total)}</p>
          </div>

          <div className="w-full flex items-center gap-3 my-1">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium">Or</span>
            <Separator className="flex-1" />
          </div>

          <div className="w-full">
            <p className="text-[11px] text-muted-foreground mb-1">UPI Reference Code</p>
            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2">
              <span className="flex-1 text-sm font-mono font-semibold text-gray-700" data-testid="text-upi-ref-code">{refCode}</span>
              <button
                className="text-muted-foreground hover:text-gray-900 transition-colors"
                onClick={copyRef}
                data-testid="button-copy-upi-ref"
                title="Copy reference code"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            className="w-full h-11 font-bold rounded-xl text-white mt-1"
            style={{ background: ACCENT }}
            onClick={onConfirm}
            data-testid="button-confirm-upi-payment"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Payment Received
          </Button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({
  sale,
  store,
  onPrint,
  onNewOrder,
}: {
  sale: PosSale;
  store: typeof POS_STORE;
  onPrint: () => void;
  onNewOrder: () => void;
}) {
  const date = new Date(sale.timestamp);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const paymentLabel = sale.paymentMethod === "upi" ? "UPI" : sale.paymentMethod === "card" ? "Card" : "Cash";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" data-testid="modal-success">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center pt-8 pb-4 px-6 gap-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900" data-testid="text-sale-complete">Successfully placed an order</h3>
            <p className="text-3xl font-black mt-2" style={{ color: "#0EA5E9" }} data-testid="text-success-total">{formatINR(sale.totalAmount)}</p>
          </div>
        </div>

        <div className="mx-6 mb-4 rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
          {[
            { label: "Order ID", value: sale.id.slice(0, 12).toUpperCase() },
            { label: "Receipt Number", value: sale.receiptNumber },
            { label: "Date & Time", value: `${dateStr} ${timeStr}` },
            { label: "Payment Type", value: paymentLabel },
            { label: "Total", value: formatINR(sale.totalAmount) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs font-semibold text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-11 font-semibold gap-2"
            onClick={onPrint}
            data-testid="button-print-receipt"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
          <Button
            className="flex-1 h-11 font-bold gap-2 text-white"
            style={{ background: ACCENT }}
            onClick={onNewOrder}
            data-testid="button-new-order"
          >
            New Order
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PosBilling() {
  const { toast } = useToast();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [billItems, setBillItems] = useState<PosBillItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [barcodeError, setBarcodeError] = useState(false);

  const [heldBills, setHeldBills] = useState<PosHeldBill[]>([]);
  const [showHeldBills, setShowHeldBills] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [customerName, setCustomerName] = useState("Walk-in");
  const [editingName, setEditingName] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<PosSale | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceiptScreen, setShowReceiptScreen] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  const store = POS_STORE;

  if (store.status !== "active") {
    return <StoreLocked />;
  }

  const subtotal = billItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const serviceTax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + serviceTax;
  const totalItems = billItems.reduce((sum, item) => sum + item.quantity, 0);
  const changeAmount = cashReceived ? parseFloat(cashReceived) - totalAmount : 0;

  const filteredProducts = selectedCategory === "All"
    ? POS_PRODUCTS
    : POS_PRODUCTS.filter(p => p.category === selectedCategory);

  const focusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    focusBarcode();
  }, [focusBarcode]);

  const addProductToBill = useCallback((product: PosProduct) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.mrp }
            : i
        );
      }
      return [...prev, {
        id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        name: product.name,
        mrp: product.mrp,
        quantity: 1,
        lineTotal: product.mrp,
        image: product.image,
      }];
    });

    if (navigator.vibrate) navigator.vibrate(30);
    setBarcodeInput("");
    setSearchInput("");
    setSearchResults([]);
    setShowSearch(false);
    setBarcodeError(false);
    focusBarcode();
  }, [focusBarcode]);

  const handleBarcodeScan = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    if (!code) return;

    const product = POS_PRODUCTS.find(p => p.barcode === code);
    if (product) {
      addProductToBill(product);
    } else {
      setBarcodeError(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setTimeout(() => {
        setBarcodeError(false);
        setBarcodeInput("");
      }, 1200);
    }
  }, [barcodeInput, addProductToBill]);

  const handleSearch = useCallback((query: string) => {
    setSearchInput(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = POS_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
    setSearchResults(results);
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setBillItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty, lineTotal: newQty * item.mrp };
    }));
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const removeItem = (itemId: string) => {
    setBillItems(prev => prev.filter(i => i.id !== itemId));
    if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
  };

  const holdBill = () => {
    if (billItems.length === 0) return;
    const held: PosHeldBill = {
      id: `held-${Date.now()}`,
      items: [...billItems],
      total: totalAmount,
      itemCount: totalItems,
      createdAt: new Date().toISOString(),
    };
    setHeldBills(prev => [...prev, held]);
    setBillItems([]);
    if (navigator.vibrate) navigator.vibrate(50);
    toast({ title: "Bill held", description: `${held.itemCount} items saved. You can recall it anytime.` });
    focusBarcode();
  };

  const recallBill = (heldId: string) => {
    const held = heldBills.find(h => h.id === heldId);
    if (!held) return;
    if (billItems.length > 0) holdBill();
    setBillItems(held.items);
    setHeldBills(prev => prev.filter(h => h.id !== heldId));
    setShowHeldBills(false);
    if (navigator.vibrate) navigator.vibrate(30);
    focusBarcode();
  };

  const buildSale = (): PosSale => ({
    id: `sale-${Date.now()}`,
    receiptNumber: getNextReceiptNumber(),
    storeId: store.id,
    items: [...billItems],
    totalAmount,
    paymentMethod: paymentMethod!,
    cashReceived: paymentMethod === "cash" ? parseFloat(cashReceived) || totalAmount : undefined,
    changeReturned: paymentMethod === "cash" ? Math.max(0, changeAmount) : undefined,
    timestamp: new Date().toISOString(),
  });

  const handleMakeOrder = () => {
    if (billItems.length === 0 || !paymentMethod) return;
    if (paymentMethod === "upi") {
      setShowUpiModal(true);
    } else {
      if (paymentMethod === "cash" && parseFloat(cashReceived) < totalAmount) return;
      const sale = buildSale();
      setCompletedSale(sale);
      setShowSuccessModal(true);
    }
  };

  const handleUpiConfirm = () => {
    setShowUpiModal(false);
    const sale = buildSale();
    setCompletedSale(sale);
    setShowSuccessModal(true);
  };

  const resetBilling = () => {
    setBillItems([]);
    setCompletedSale(null);
    setPaymentMethod(null);
    setCashReceived("");
    setShowSuccessModal(false);
    setShowReceiptScreen(false);
    setCustomerName("Walk-in");
    setOrderType("dine-in");
    focusBarcode();
  };

  const printReceipt = () => {
    setShowSuccessModal(false);
    setShowReceiptScreen(true);
    setTimeout(() => window.print(), 300);
  };

  const canComplete = paymentMethod === "cash"
    ? parseFloat(cashReceived) >= totalAmount
    : paymentMethod !== null;

  if (showReceiptScreen && completedSale) {
    return <ReceiptScreen sale={completedSale} store={store} onNewSale={resetBilling} onPrint={() => window.print()} />;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full bg-[#F5F6FA] overflow-hidden print:hidden" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>

      {showUpiModal && (
        <UpiQrModal
          total={totalAmount}
          store={store}
          onConfirm={handleUpiConfirm}
          onClose={() => setShowUpiModal(false)}
        />
      )}

      {showSuccessModal && completedSale && (
        <SuccessModal
          sale={completedSale}
          store={store}
          onPrint={printReceipt}
          onNewOrder={resetBilling}
        />
      )}

      {showHeldBills && heldBills.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowHeldBills(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-sm">Held Bills ({heldBills.length})</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHeldBills(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 space-y-2 max-h-72 overflow-auto">
              {heldBills.map(held => (
                <button
                  key={held.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  onClick={() => recallBill(held.id)}
                  data-testid={`recall-bill-${held.id}`}
                >
                  <PlayCircle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{held.itemCount} items</p>
                    <p className="text-xs text-muted-foreground">{formatINR(held.total)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(held.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate" data-testid="text-store-name">{store.name}</h1>
              <p className="text-[10px] text-muted-foreground">Good day, {store.ownerName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {heldBills.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                onClick={() => setShowHeldBills(!showHeldBills)}
                data-testid="button-held-bills"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                {heldBills.length} held
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={holdBill}
              disabled={billItems.length === 0}
              data-testid="button-hold-bill"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Hold
            </Button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 bg-white border-b shrink-0 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                type="text"
                placeholder="Scan barcode or enter code..."
                value={barcodeInput}
                onChange={e => { setBarcodeInput(e.target.value); setBarcodeError(false); }}
                onKeyDown={handleBarcodeScan}
                className={cn(
                  "pl-10 h-10 text-sm font-mono transition-all",
                  barcodeError && "border-red-500 bg-red-50 ring-2 ring-red-200 animate-pulse"
                )}
                data-testid="input-barcode"
                autoComplete="off"
              />
              {barcodeError && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-600" data-testid="text-barcode-error">
                  Not found
                </span>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" data-testid="button-camera-scan">
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 150)}
              className="pl-10 h-9 text-sm"
              data-testid="input-product-search"
              autoComplete="off"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-56 overflow-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 transition-colors text-left"
                    onMouseDown={() => addProductToBill(p)}
                    data-testid={`search-result-${p.id}`}
                  >
                    <ProductImage src={p.image} alt={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: ACCENT }}>{formatINR(p.mrp)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 bg-white border-b shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ALL_CATEGORIES.map(cat => {
              const count = cat === "All" ? POS_PRODUCTS.length : POS_PRODUCTS.filter(p => p.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`category-tab-${cat.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all",
                    isActive
                      ? "text-white border-transparent shadow-sm"
                      : "text-gray-600 border-gray-200 bg-white hover:border-orange-300 hover:text-orange-600"
                  )}
                  style={isActive ? { background: ACCENT, borderColor: ACCENT } : {}}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1 py-0.5 rounded-md",
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inBill = billItems.find(i => i.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addProductToBill(product)}
                  data-testid={`product-card-${product.id}`}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-white overflow-hidden text-left transition-all active:scale-95 hover:shadow-md group relative",
                    inBill ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-100 hover:border-orange-200"
                  )}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {inBill && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow"
                        style={{ background: ACCENT }}
                        data-testid={`product-qty-badge-${product.id}`}
                      >
                        {inBill.quantity}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{product.name}</p>
                    <p className="text-sm font-black mt-1" style={{ color: ACCENT }}>{formatINR(product.mrp)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="w-80 xl:w-96 border-l bg-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            {editingName ? (
              <Input
                autoFocus
                className="h-8 text-sm font-medium flex-1"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                data-testid="input-customer-name"
              />
            ) : (
              <button
                className="flex-1 text-left"
                onClick={() => setEditingName(true)}
                data-testid="button-edit-customer-name"
              >
                <p className="text-sm font-bold text-gray-900" data-testid="text-customer-name">{customerName}</p>
                <p className="text-[10px] text-muted-foreground">Tap to edit name</p>
              </button>
            )}
          </div>

          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-1 gap-1">
            {(["dine-in", "takeaway"] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                data-testid={`button-order-type-${type}`}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  orderType === type ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {type === "dine-in" ? <Utensils className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                {type === "dine-in" ? "Dine In" : "Take Away"}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {billItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <ShoppingCart className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm font-semibold text-gray-400" data-testid="text-empty-bill">No items yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Add products from the left</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {billItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 group"
                  data-testid={`bill-item-${idx}`}
                >
                  <ProductImage src={item.image} alt={item.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatINR(item.mrp)} each</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      onClick={() => updateQuantity(item.id, -1)}
                      data-testid={`button-qty-minus-${idx}`}
                    >
                      <Minus className="w-2.5 h-2.5 text-gray-600" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-gray-900" data-testid={`text-qty-${idx}`}>{item.quantity}</span>
                    <button
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      onClick={() => updateQuantity(item.id, 1)}
                      data-testid={`button-qty-plus-${idx}`}
                    >
                      <Plus className="w-2.5 h-2.5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-xs font-black text-gray-900 w-14 text-right shrink-0" data-testid={`text-line-total-${idx}`}>
                    {formatINR(item.lineTotal)}
                  </span>
                  <button
                    className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeItem(item.id)}
                    data-testid={`button-remove-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-xs font-semibold" data-testid="text-subtotal">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">Service Tax (5%)</span>
              <span className="text-xs font-semibold" data-testid="text-service-tax">{formatINR(serviceTax)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-base font-black text-gray-900" data-testid="text-grand-total" id="text-payment-total">{formatINR(totalAmount)}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "cash" as PaymentMethod, icon: Banknote, label: "Cash" },
                { id: "upi" as PaymentMethod, icon: Smartphone, label: "UPI" },
                { id: "card" as PaymentMethod, icon: CreditCard, label: "Card" },
              ]).map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  data-testid={`button-pay-${method.id}`}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-semibold",
                    paymentMethod === method.id
                      ? "text-white border-transparent shadow-sm"
                      : "border-gray-200 text-gray-600 bg-white hover:border-orange-200 hover:text-orange-600"
                  )}
                  style={paymentMethod === method.id ? { background: ACCENT, borderColor: ACCENT } : {}}
                >
                  <method.icon className="w-4 h-4" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-200">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cash Received</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="0"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  className="pl-9 h-10 text-base font-bold"
                  data-testid="input-cash-received"
                />
              </div>
              <div className="flex gap-1.5">
                {[500, 1000, 2000].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => setCashReceived(String(amt))}
                    data-testid={`button-quick-${amt}`}
                  >
                    ₹{amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 bg-green-50 border-green-200 text-green-700"
                  onClick={() => setCashReceived(String(totalAmount))}
                  data-testid="button-exact-amount"
                >
                  Exact
                </Button>
              </div>
              {parseFloat(cashReceived) >= totalAmount && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in duration-200">
                  <span className="text-xs text-green-600 font-medium">Change to return</span>
                  <span className="text-sm font-black text-green-700" data-testid="text-change-amount">{formatINR(Math.max(0, changeAmount))}</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 animate-in slide-in-from-bottom-2 duration-200">
              <p className="text-xs text-purple-700 font-medium">Swipe card on your card machine and confirm below</p>
            </div>
          )}

          <Button
            className={cn(
              "w-full h-12 text-sm font-bold rounded-xl gap-2 transition-all",
              canComplete && billItems.length > 0
                ? "text-white shadow-md hover:opacity-90"
                : "opacity-50 cursor-not-allowed text-white"
            )}
            style={{ background: ACCENT }}
            onClick={handleMakeOrder}
            disabled={!canComplete || billItems.length === 0}
            data-testid="button-charge"
            id="button-make-order"
          >
            <ShoppingCart className="w-4 h-4" />
            {billItems.length === 0
              ? "Add items to order"
              : paymentMethod === null
              ? "Select payment method"
              : paymentMethod === "cash" && !canComplete
              ? "Enter cash amount"
              : "Make Order"}
          </Button>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center gap-3 z-30">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground" data-testid="text-item-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          <p className="text-lg font-black text-gray-900" data-testid="text-grand-total-mobile">{formatINR(totalAmount)}</p>
        </div>
        <Button
          className="h-11 px-6 font-bold rounded-xl text-white gap-2"
          style={{ background: ACCENT }}
          disabled={billItems.length === 0}
          data-testid="button-view-order"
          onClick={() => setShowMobilePanel(true)}
        >
          <ShoppingCart className="w-4 h-4" />
          Order ({totalItems})
        </Button>
      </div>

      {showMobilePanel && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobilePanel(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Order Summary</h3>
                <p className="text-xs text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMobilePanel(false)} data-testid="button-close-mobile-panel">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="flex-1 text-sm font-semibold text-gray-800">{customerName}</div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 text-xs">
                {(["dine-in", "takeaway"] as OrderType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={cn(
                      "px-3 py-1.5 font-semibold transition-all",
                      orderType === type ? "bg-white shadow text-gray-900" : "text-gray-500"
                    )}
                    data-testid={`button-mobile-order-type-${type}`}
                  >
                    {type === "dine-in" ? "Dine In" : "Take Away"}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {billItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50"
                    data-testid={`mobile-bill-item-${idx}`}
                  >
                    <ProductImage src={item.image} alt={item.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatINR(item.mrp)} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center"
                        onClick={() => updateQuantity(item.id, -1)}
                        data-testid={`button-mobile-qty-minus-${idx}`}
                      >
                        <Minus className="w-2.5 h-2.5 text-gray-600" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center"
                        onClick={() => updateQuantity(item.id, 1)}
                        data-testid={`button-mobile-qty-plus-${idx}`}
                      >
                        <Plus className="w-2.5 h-2.5 text-gray-600" />
                      </button>
                    </div>
                    <span className="text-xs font-black w-12 text-right shrink-0">{formatINR(item.lineTotal)}</span>
                    <button
                      className="w-5 h-5 flex items-center justify-center text-red-400"
                      onClick={() => removeItem(item.id)}
                      data-testid={`button-mobile-remove-${idx}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4 space-y-3 shrink-0">
              <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground">Subtotal</span>
                  <span className="text-xs font-semibold">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground">Service Tax (5%)</span>
                  <span className="text-xs font-semibold">{formatINR(serviceTax)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-base font-black text-gray-900" data-testid="text-payment-total">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "cash" as PaymentMethod, icon: Banknote, label: "Cash" },
                  { id: "upi" as PaymentMethod, icon: Smartphone, label: "UPI" },
                  { id: "card" as PaymentMethod, icon: CreditCard, label: "Card" },
                ]).map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    data-testid={`button-mobile-pay-${method.id}`}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-semibold",
                      paymentMethod === method.id
                        ? "text-white border-transparent shadow-sm"
                        : "border-gray-200 text-gray-600 bg-white"
                    )}
                    style={paymentMethod === method.id ? { background: ACCENT, borderColor: ACCENT } : {}}
                  >
                    <method.icon className="w-4 h-4" />
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-2">
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Cash received"
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                      className="pl-9 h-10 text-base font-bold"
                      data-testid="input-mobile-cash-received"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {[500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        className="flex-1 text-xs h-8 border border-gray-200 rounded-lg font-medium"
                        onClick={() => setCashReceived(String(amt))}
                        data-testid={`button-mobile-quick-${amt}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                    <button
                      className="flex-1 text-xs h-8 border border-green-200 bg-green-50 text-green-700 rounded-lg font-medium"
                      onClick={() => setCashReceived(String(totalAmount))}
                      data-testid="button-mobile-exact-amount"
                    >
                      Exact
                    </button>
                  </div>
                  {parseFloat(cashReceived) >= totalAmount && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">Change to return</span>
                      <span className="text-sm font-black text-green-700" data-testid="text-mobile-change-amount">{formatINR(Math.max(0, changeAmount))}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full h-12 font-bold rounded-xl gap-2 text-white"
                style={{ background: ACCENT }}
                onClick={() => { setShowMobilePanel(false); handleMakeOrder(); }}
                disabled={!canComplete || billItems.length === 0}
                data-testid="button-confirm-payment"
              >
                <ShoppingCart className="w-4 h-4" />
                {paymentMethod === null
                  ? "Select payment method"
                  : paymentMethod === "cash" && !canComplete
                  ? "Enter cash amount"
                  : "Make Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptScreen({ sale, store, onNewSale, onPrint }: {
  sale: PosSale;
  store: typeof POS_STORE;
  onNewSale: () => void;
  onPrint: () => void;
}) {
  const date = new Date(sale.timestamp);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="hidden print:block w-full">
        <ThermalReceipt sale={sale} store={store} dateStr={dateStr} timeStr={timeStr} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 print:hidden">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white" data-testid="text-receipt-complete">Receipt</h2>
            <p className="text-gray-400 text-sm mt-1">{sale.receiptNumber} &bull; {formatINR(sale.totalAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-b from-gray-50 to-white">
              <ThermalReceipt sale={sale} store={store} dateStr={dateStr} timeStr={timeStr} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 font-semibold"
              onClick={onPrint}
              data-testid="button-print-receipt"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button
              className="flex-1 h-12 font-bold gap-2 text-white shadow-lg"
              style={{ background: ACCENT }}
              onClick={onNewSale}
              data-testid="button-new-sale"
            >
              New Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThermalReceipt({ sale, store, dateStr, timeStr }: {
  sale: PosSale;
  store: typeof POS_STORE;
  dateStr: string;
  timeStr: string;
}) {
  return (
    <div className="receipt-thermal font-mono text-[11px] leading-snug p-4 text-center" data-testid="receipt-content">
      <p className="text-sm font-bold">{store.name}</p>
      <p className="text-[10px] text-gray-600">{store.address}</p>
      <p className="text-[10px] text-gray-600">GSTIN: {store.gstin}</p>
      <p className="text-[10px] text-gray-600">Ph: {store.phone}</p>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between text-[10px]">
        <span>{sale.receiptNumber}</span>
        <span>{dateStr} {timeStr}</span>
      </div>
      <div className="flex justify-between text-[10px]">
        <span>Payment: {sale.paymentMethod.toUpperCase()}</span>
      </div>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="text-left space-y-1">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="flex-1 truncate pr-2">
              {item.quantity > 1 && <span className="font-bold">{item.quantity}x </span>}
              {item.name}
            </span>
            <span className="font-bold shrink-0">{formatINR(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span data-testid="receipt-total">{formatINR(sale.totalAmount)}</span>
      </div>
      {sale.paymentMethod === "cash" && sale.cashReceived && (
        <>
          <div className="flex justify-between text-[10px] mt-1">
            <span>Cash Received</span>
            <span>{formatINR(sale.cashReceived)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Change</span>
            <span>{formatINR(sale.changeReturned || 0)}</span>
          </div>
        </>
      )}
      <div className="border-t border-dashed border-gray-300 my-2" />
      <p className="text-[10px] text-gray-500 mt-1">Thank you! Visit again</p>
      <p className="text-[9px] text-gray-400 mt-0.5">Powered by EazyToSell</p>
    </div>
  );
}
