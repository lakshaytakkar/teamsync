export interface EtsPortalClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
}

export const portalEtsClient: EtsPortalClient = {
  id: 1,
  name: "Rajesh Kumar",
  email: "rajesh@example.in",
  phone: "+91 98110 45678",
  avatar: "RK",
  city: "Delhi",
};

export const ETS_PORTAL_COLOR = "#F97316";

export const ETS_STAGE_DESCRIPTIONS: Record<string, string> = {
  "new-lead": "Your inquiry has been received and our team is reviewing your profile.",
  "qualified": "You have been qualified for the EazyToSell franchise program. Next step: package selection and proposal review.",
  "token-paid": "Token payment received! Your onboarding process has begun. Your account manager will schedule a discovery call.",
  "store-design": "Your store interior layout and design is being prepared. You'll receive 3D renders for approval soon.",
  "inventory-ordered": "Your product inventory has been confirmed with our factory partners. Production is underway.",
  "in-transit": "Your shipment is on its way from China to India. Track your container status in the Orders section.",
  "launched": "Congratulations! Your store is live and operational. Our support team is here to help you succeed.",
  "reordering": "You're now a repeat partner! Your reorder is being processed. Keep the momentum going!",
};

export const ETS_STAGE_DISPLAY_LABELS: Record<string, string> = {
  "new-lead": "Inquiry Received",
  "qualified": "Qualified",
  "token-paid": "Token Paid",
  "store-design": "Store Design",
  "inventory-ordered": "Inventory Ordered",
  "in-transit": "Shipment In Transit",
  "launched": "Store Launched",
  "reordering": "Reordering",
};

export const ETS_ORDER_STAGE_LABELS: Record<string, string> = {
  ordered: "Order Placed",
  "factory-ready": "Factory Ready",
  shipped: "Shipped",
  customs: "At Customs",
  warehouse: "In Warehouse",
  dispatched: "Dispatched",
};

export const ETS_ORDER_STAGES = ["ordered", "factory-ready", "shipped", "customs", "warehouse", "dispatched"] as const;
