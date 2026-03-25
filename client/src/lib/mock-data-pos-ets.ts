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
