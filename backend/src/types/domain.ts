import { UserRole } from './index';

export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string;
  business_name: string;
  gst_number: string | null;
  customer_type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  follow_up_date: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  note: string;
  created_by: number;
  created_by_name?: string;
  created_at: Date;
}

export interface Product {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  location: string;
  image_url: string | null;
  is_low_stock?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity_changed: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
  created_by: number;
  created_by_name?: string;
  created_at: Date;
}

export interface SalesChallanItemInput {
  product_id: number;
  quantity: number;
}

export interface SalesChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  snapshot_product_name: string;
  snapshot_sku: string;
  snapshot_unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface SalesChallan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  business_name?: string;
  total_quantity: number;
  total_amount: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  created_by: number;
  created_by_name?: string;
  created_at: Date;
  confirmed_at: Date | null;
  items?: SalesChallanItem[];
}
