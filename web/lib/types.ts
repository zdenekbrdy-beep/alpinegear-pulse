export type ProductMeta = {
  product_normalized: string;
  product_display: string;
  category: "Tents" | "Backpacks" | "Sleeping" | "Cookware" | "Other";
  first_order_date: string | null;
};

export type DailyRow = {
  date: string;
  product_normalized: string;
  product_raw: string;
  revenue_czk: number;
  orders: number;
  spend_czk: number;
  visual_hook: string;
  intent_framing: string;
};

export type UnmatchedRow = {
  date: string;
  campaign: string;
  product: string;
  spend_czk: string;
  visual_hook: string;
  intent_framing: string;
};

export type Snapshot = {
  generated_at: string;
  products: ProductMeta[];
  daily: DailyRow[];
  unmatched_ad_spend: UnmatchedRow[];
};
