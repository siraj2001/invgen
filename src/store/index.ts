import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Customer, Product, Invoice, Quotation } from '../types';

interface AppState {
  company: Company | null;
  setCompany: (company: Company) => void;
  
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  quotations: Quotation[];
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (quotation: Quotation) => void;
  deleteQuotation: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      company: null,
      setCompany: (company) => set({ company }),
      
      customers: [],
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map((c) => c.id === customer.id ? customer : c)
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== id)
      })),
      
      products: [],
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => p.id === product.id ? product : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      
      invoices: [],
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (invoice) => set((state) => ({
        invoices: state.invoices.map((i) => i.id === invoice.id ? invoice : i)
      })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id)
      })),
      
      quotations: [],
      addQuotation: (quotation) => set((state) => ({ quotations: [...state.quotations, quotation] })),
      updateQuotation: (quotation) => set((state) => ({
        quotations: state.quotations.map((q) => q.id === quotation.id ? quotation : q)
      })),
      deleteQuotation: (id) => set((state) => ({
        quotations: state.quotations.filter((q) => q.id !== id)
      })),
    }),
    {
      name: 'invoice-generator-storage',
    }
  )
);
