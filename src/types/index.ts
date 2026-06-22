export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  gstin: string;
  pan: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc: string;
  upi_id?: string;
  terms: string;
}

export interface Customer {
  id: string;
  name: string;
  company_name: string;
  gstin: string;
  contact_person: string;
  phone: string;
  email: string;
  billing_address: string;
  shipping_address: string;
  state: string;
  pincode: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  hsn_sac: string;
  unit_price: number;
  gst_rate: number; // 0, 5, 12, 18, 28
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  tax_amount: number;
  total_amount: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  po_number?: string;
  payment_terms: string;
  customer_id: string;
  items?: InvoiceItem[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  amount_in_words: string;
  status: InvoiceStatus;
  notes?: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id?: string;
  description: string;
  hsn_sac?: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  tax_amount: number;
  total_amount: number;
}

export interface Quotation extends Omit<Invoice, 'invoice_number' | 'due_date' | 'status' | 'po_number' | 'payment_terms'> {
  quotation_number: string;
  valid_until: string;
  scope_of_work?: string;
}
