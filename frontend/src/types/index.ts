export type InvoiceStatus = "draft" | "sent" | "deposit_paid" | "paid";

export interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  rate?: number;
  quantity?: number;
  amount: number;
  sort_order: number;
  is_subitem: boolean;
}

export interface LineItemInput {
  description: string;
  rate?: number | null;
  quantity?: number | null;
  amount: number;
  sort_order: number;
  is_subitem: boolean;
}

export interface Client {
  id: string;
  created_at: string;
  name: string;
  company?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  email?: string;
  phone?: string;
}

export interface Invoice {
  id: string;
  created_at: string;
  invoice_number: string;
  date: string;
  client_id: string;
  client?: Client;
  status: InvoiceStatus;
  payment_terms?: string;
  tax_rate: number;
  subtotal: number;
  total: number;
  notes?: string;
  line_items: LineItem[];
}

export interface Settings {
  id: string;
  owner_name: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  email?: string;
  phone?: string;
  website?: string;
  etransfer_email?: string;
  next_invoice_number: number;
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  deposit_paid: "Deposit Paid",
  paid: "Paid in Full",
};

export const STATUS_COLOURS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  deposit_paid: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};
