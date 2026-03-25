export interface PosProduct {
  id: string;
  name: string;
  barcode: string;
  mrp: number;
  category: string;
  emoji: string;
  inStock: number;
}

export interface PosBillItem {
  id: string;
  productId: string;
  name: string;
  mrp: number;
  quantity: number;
  lineTotal: number;
  emoji: string;
}

export interface PosHeldBill {
  id: string;
  items: PosBillItem[];
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface PosSale {
  id: string;
  receiptNumber: string;
  storeId: string;
  items: PosBillItem[];
  totalAmount: number;
  paymentMethod: "cash" | "upi" | "card";
  cashReceived?: number;
  changeReturned?: number;
  timestamp: string;
}

export const POS_STORE = {
  id: "store-001",
  name: "EazyToSell - Rajesh Store",
  address: "Shop 12, Kamla Nagar, New Delhi - 110007",
  gstin: "07AABCU9603R1ZP",
  phone: "+91 98110 45678",
  status: "active" as "active" | "setup" | "inactive",
  ownerName: "Rajesh Kumar",
};

export const POS_PRODUCTS: PosProduct[] = [
  { id: "p1", name: "Kitchen Organizer Set", barcode: "8901234567890", mrp: 599, category: "Kitchen", emoji: "🍳", inStock: 45 },
  { id: "p2", name: "LED Desk Lamp", barcode: "8901234567891", mrp: 899, category: "Electronics", emoji: "💡", inStock: 30 },
  { id: "p3", name: "Wall Clock Modern", barcode: "8901234567892", mrp: 1299, category: "Decor", emoji: "🕐", inStock: 20 },
  { id: "p4", name: "Bathroom Caddy", barcode: "8901234567893", mrp: 449, category: "Bathroom", emoji: "🚿", inStock: 55 },
  { id: "p5", name: "Spice Rack 3-Tier", barcode: "8901234567894", mrp: 349, category: "Kitchen", emoji: "🫙", inStock: 60 },
  { id: "p6", name: "Cushion Cover Set (5)", barcode: "8901234567895", mrp: 799, category: "Home", emoji: "🛋️", inStock: 35 },
  { id: "p7", name: "Phone Stand Bamboo", barcode: "8901234567896", mrp: 299, category: "Accessories", emoji: "📱", inStock: 80 },
  { id: "p8", name: "Storage Box Set (3)", barcode: "8901234567897", mrp: 699, category: "Storage", emoji: "📦", inStock: 40 },
  { id: "p9", name: "Fridge Magnet Set", barcode: "8901234567898", mrp: 199, category: "Decor", emoji: "🧲", inStock: 100 },
  { id: "p10", name: "Laundry Basket Foldable", barcode: "8901234567899", mrp: 549, category: "Home", emoji: "🧺", inStock: 25 },
  { id: "p11", name: "Cable Organizer", barcode: "8901234567900", mrp: 249, category: "Electronics", emoji: "🔌", inStock: 70 },
  { id: "p12", name: "Soap Dispenser Glass", barcode: "8901234567901", mrp: 399, category: "Bathroom", emoji: "🧴", inStock: 50 },
  { id: "p13", name: "Key Holder Wall Mount", barcode: "8901234567902", mrp: 329, category: "Decor", emoji: "🔑", inStock: 45 },
  { id: "p14", name: "Tissue Box Cover", barcode: "8901234567903", mrp: 279, category: "Home", emoji: "🧻", inStock: 60 },
  { id: "p15", name: "Wine Glass Set (4)", barcode: "8901234567904", mrp: 1499, category: "Kitchen", emoji: "🍷", inStock: 15 },
  { id: "p16", name: "Door Mat Premium", barcode: "8901234567905", mrp: 499, category: "Home", emoji: "🚪", inStock: 40 },
  { id: "p17", name: "Pen Stand Wooden", barcode: "8901234567906", mrp: 349, category: "Accessories", emoji: "✏️", inStock: 55 },
  { id: "p18", name: "Photo Frame Set (3)", barcode: "8901234567907", mrp: 899, category: "Decor", emoji: "🖼️", inStock: 30 },
  { id: "p19", name: "Towel Rack Steel", barcode: "8901234567908", mrp: 649, category: "Bathroom", emoji: "🪄", inStock: 35 },
  { id: "p20", name: "Flower Vase Ceramic", barcode: "8901234567909", mrp: 799, category: "Decor", emoji: "🏺", inStock: 20 },
];

export const QUICK_ADD_PRODUCTS = POS_PRODUCTS.slice(0, 8);

export const RECENT_SALES: PosSale[] = [
  {
    id: "s1",
    receiptNumber: "R-0001",
    storeId: "store-001",
    items: [
      { id: "i1", productId: "p1", name: "Kitchen Organizer Set", mrp: 599, quantity: 2, lineTotal: 1198, emoji: "🍳" },
      { id: "i2", productId: "p7", name: "Phone Stand Bamboo", mrp: 299, quantity: 1, lineTotal: 299, emoji: "📱" },
    ],
    totalAmount: 1497,
    paymentMethod: "upi",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "s2",
    receiptNumber: "R-0002",
    storeId: "store-001",
    items: [
      { id: "i3", productId: "p3", name: "Wall Clock Modern", mrp: 1299, quantity: 1, lineTotal: 1299, emoji: "🕐" },
    ],
    totalAmount: 1299,
    paymentMethod: "cash",
    cashReceived: 1500,
    changeReturned: 201,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "s3",
    receiptNumber: "R-0003",
    storeId: "store-001",
    items: [
      { id: "i4", productId: "p6", name: "Cushion Cover Set (5)", mrp: 799, quantity: 3, lineTotal: 2397, emoji: "🛋️" },
      { id: "i5", productId: "p9", name: "Fridge Magnet Set", mrp: 199, quantity: 5, lineTotal: 995, emoji: "🧲" },
    ],
    totalAmount: 3392,
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
];

let nextReceiptNum = 4;
export function getNextReceiptNumber(): string {
  const num = nextReceiptNum++;
  return `R-${String(num).padStart(4, "0")}`;
}

export type StockStatus = "healthy" | "low" | "out";
export type MovementType = "sale" | "receive" | "return" | "adjustment";
export type AdjustmentReason = "physical-count" | "damaged" | "found-backroom" | "lost-stolen" | "miscount-receive";

export const ADJUSTMENT_REASONS: Record<AdjustmentReason, string> = {
  "physical-count": "Physical count correction",
  "damaged": "Damaged and removed",
  "found-backroom": "Found in backroom",
  "lost-stolen": "Lost or stolen",
  "miscount-receive": "Miscounted during receive",
};

export interface InventoryItem {
  productId: string;
  storeId: string;
  currentStock: number;
  reorderThreshold: number;
  costPrice: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  storeId: string;
  productId: string;
  movementType: MovementType;
  quantityChange: number;
  referenceType: string;
  referenceId: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface StockReceiveSession {
  id: string;
  storeId: string;
  referenceNumber: string;
  items: StockReceiveItem[];
  totalItems: number;
  receivedBy: string;
  timestamp: string;
}

export interface StockReceiveItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  emoji: string;
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

export const INVENTORY: InventoryItem[] = POS_PRODUCTS.map(p => ({
  productId: p.id,
  storeId: "store-001",
  currentStock: p.inStock,
  reorderThreshold: 5,
  costPrice: Math.round(p.mrp * 0.45),
  lastUpdated: daysAgo(Math.floor(Math.random() * 5)),
}));

INVENTORY[14] = { ...INVENTORY[14], currentStock: 0 };
INVENTORY[19] = { ...INVENTORY[19], currentStock: 0 };
INVENTORY[2]  = { ...INVENTORY[2],  currentStock: 3 };
INVENTORY[9]  = { ...INVENTORY[9],  currentStock: 2 };
INVENTORY[17] = { ...INVENTORY[17], currentStock: 4 };

export function getStockStatus(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "healthy";
}

export const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string }> = {
  healthy: { label: "In Stock",   color: "#059669", bg: "#d1fae5" },
  low:     { label: "Low Stock",  color: "#d97706", bg: "#fef3c7" },
  out:     { label: "Out of Stock", color: "#dc2626", bg: "#fee2e2" },
};

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", storeId: "store-001", productId: "p1", movementType: "sale", quantityChange: -2, referenceType: "receipt", referenceId: "R-0001", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m2", storeId: "store-001", productId: "p7", movementType: "sale", quantityChange: -1, referenceType: "receipt", referenceId: "R-0001", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m3", storeId: "store-001", productId: "p3", movementType: "sale", quantityChange: -1, referenceType: "receipt", referenceId: "R-0002", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m4", storeId: "store-001", productId: "p6", movementType: "sale", quantityChange: -3, referenceType: "receipt", referenceId: "R-0003", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m5", storeId: "store-001", productId: "p9", movementType: "sale", quantityChange: -5, referenceType: "receipt", referenceId: "R-0003", performedBy: "Cashier", timestamp: daysAgo(0) },
  { id: "m6", storeId: "store-001", productId: "p1", movementType: "receive", quantityChange: 24, referenceType: "stock-receive", referenceId: "SR-001", performedBy: "Rajesh Kumar", timestamp: daysAgo(2) },
  { id: "m7", storeId: "store-001", productId: "p2", movementType: "receive", quantityChange: 12, referenceType: "stock-receive", referenceId: "SR-001", performedBy: "Rajesh Kumar", timestamp: daysAgo(2) },
  { id: "m8", storeId: "store-001", productId: "p5", movementType: "receive", quantityChange: 30, referenceType: "stock-receive", referenceId: "SR-002", performedBy: "Rajesh Kumar", timestamp: daysAgo(5) },
  { id: "m9", storeId: "store-001", productId: "p8", movementType: "receive", quantityChange: 20, referenceType: "stock-receive", referenceId: "SR-002", performedBy: "Rajesh Kumar", timestamp: daysAgo(5) },
  { id: "m10", storeId: "store-001", productId: "p3", movementType: "adjustment", quantityChange: 3, referenceType: "adjustment", referenceId: "ADJ-001", reason: "Found in backroom", performedBy: "Rajesh Kumar", timestamp: daysAgo(3) },
  { id: "m11", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -4, referenceType: "receipt", referenceId: "R-0005", performedBy: "Cashier", timestamp: daysAgo(1) },
  { id: "m12", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -6, referenceType: "receipt", referenceId: "R-0008", performedBy: "Cashier", timestamp: daysAgo(2) },
  { id: "m13", storeId: "store-001", productId: "p15", movementType: "sale", quantityChange: -5, referenceType: "receipt", referenceId: "R-0012", performedBy: "Cashier", timestamp: daysAgo(3) },
  { id: "m14", storeId: "store-001", productId: "p20", movementType: "sale", quantityChange: -8, referenceType: "receipt", referenceId: "R-0009", performedBy: "Cashier", timestamp: daysAgo(1) },
  { id: "m15", storeId: "store-001", productId: "p20", movementType: "sale", quantityChange: -12, referenceType: "receipt", referenceId: "R-0015", performedBy: "Cashier", timestamp: daysAgo(4) },
];

export const STOCK_RECEIVES: StockReceiveSession[] = [
  {
    id: "sr1", storeId: "store-001", referenceNumber: "SR-001",
    items: [
      { productId: "p1", productName: "Kitchen Organizer Set", barcode: "8901234567890", quantity: 24, emoji: "🍳" },
      { productId: "p2", productName: "LED Desk Lamp", barcode: "8901234567891", quantity: 12, emoji: "💡" },
      { productId: "p4", productName: "Bathroom Caddy", barcode: "8901234567893", quantity: 30, emoji: "🚿" },
    ],
    totalItems: 66, receivedBy: "Rajesh Kumar", timestamp: daysAgo(2),
  },
  {
    id: "sr2", storeId: "store-001", referenceNumber: "SR-002",
    items: [
      { productId: "p5", productName: "Spice Rack 3-Tier", barcode: "8901234567894", quantity: 30, emoji: "🫙" },
      { productId: "p8", productName: "Storage Box Set (3)", barcode: "8901234567897", quantity: 20, emoji: "📦" },
      { productId: "p11", productName: "Cable Organizer", barcode: "8901234567900", quantity: 40, emoji: "🔌" },
    ],
    totalItems: 90, receivedBy: "Rajesh Kumar", timestamp: daysAgo(5),
  },
];

let nextSRNum = 3;
export function getNextSRNumber(): string {
  const num = nextSRNum++;
  return `SR-${String(num).padStart(3, "0")}`;
}

export function getProductMovements(productId: string): StockMovement[] {
  return STOCK_MOVEMENTS.filter(m => m.productId === productId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDailySalesRate(productId: string): number {
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const recentSales = STOCK_MOVEMENTS.filter(m =>
    m.productId === productId && m.movementType === "sale" && new Date(m.timestamp).getTime() > twoWeeksAgo
  );
  const totalSold = recentSales.reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  return totalSold / 14;
}

let nextMovementId = STOCK_MOVEMENTS.length + 1;

export function addStockMovement(movement: Omit<StockMovement, "id">) {
  const id = `m${nextMovementId++}`;
  STOCK_MOVEMENTS.unshift({ ...movement, id });
}

export function updateInventoryStock(productId: string, newStock: number) {
  const inv = INVENTORY.find(i => i.productId === productId);
  if (inv) {
    inv.currentStock = newStock;
    inv.lastUpdated = new Date().toISOString();
  }
}

export function addReceiveToInventory(items: StockReceiveItem[], referenceId: string) {
  items.forEach(item => {
    const inv = INVENTORY.find(i => i.productId === item.productId);
    if (inv) {
      inv.currentStock += item.quantity;
      inv.lastUpdated = new Date().toISOString();
    }
    addStockMovement({
      storeId: "store-001", productId: item.productId, movementType: "receive",
      quantityChange: item.quantity, referenceType: "stock-receive", referenceId,
      performedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
    });
  });
}

export function addAdjustmentToInventory(productId: string, systemCount: number, physicalCount: number, reason: string) {
  const difference = physicalCount - systemCount;
  updateInventoryStock(productId, physicalCount);
  addStockMovement({
    storeId: "store-001", productId, movementType: "adjustment",
    quantityChange: difference, referenceType: "adjustment",
    referenceId: `ADJ-${Date.now().toString(36).toUpperCase()}`,
    reason, performedBy: "Rajesh Kumar", timestamp: new Date().toISOString(),
  });
}
