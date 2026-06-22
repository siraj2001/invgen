import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Invoice, Customer } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Save, UserPlus } from 'lucide-react';
import { CustomerModal } from '../customers/CustomerModal';

export function InvoiceForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fromQuotationId = searchParams.get('from_quotation');

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<Invoice>({
    defaultValues: {
      invoice_number: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_terms: 'Due on Receipt',
      status: 'Draft',
      items: [],
      subtotal: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      grand_total: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items') || [];
  const watchDiscount = watch('discount') || 0;

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // Recalculate totals whenever items or discount changes
  useEffect(() => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    watchItems.forEach((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const gstRate = Number(item.gst_rate) || 0;

      const totalAmount = quantity * unitPrice;
      const taxAmount = (totalAmount * gstRate) / 100;

      subtotal += totalAmount;
      // Simplified: assume intra-state (CGST + SGST) for now
      cgst += taxAmount / 2;
      sgst += taxAmount / 2;

      // Ensure the form state has the updated line item totals
      if (item.total_amount !== totalAmount || item.tax_amount !== taxAmount) {
        setValue(`items.${index}.total_amount`, totalAmount);
        setValue(`items.${index}.tax_amount`, taxAmount);
      }
    });

    const grandTotal = subtotal + cgst + sgst + igst - watchDiscount;

    setValue('subtotal', subtotal);
    setValue('cgst', cgst);
    setValue('sgst', sgst);
    setValue('igst', igst);
    setValue('grand_total', grandTotal);
    setValue('amount_in_words', numberToWords(Math.round(grandTotal)));
  }, [JSON.stringify(watchItems), watchDiscount, setValue]);


  const fetchInitialData = async () => {
    setLoading(true);
    const custRes = await supabase.from('customers').select('*');
    if (custRes.data) setCustomers(custRes.data);

    if (isEditing && id) {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('id', id)
        .single();
        
      if (error) {
        toast.error('Failed to load invoice');
      } else if (invoice) {
        reset(invoice as Invoice);
      }
    } else {
      // Generate new invoice number
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      
      const startOfDay = new Date(date.setHours(0,0,0,0)).toISOString();
      
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay);
        
      const seq = String((count || 0) + 1).padStart(3, '0');
      const generatedInvoiceNumber = `INV-SKE${yyyy}${mm}${dd}-${seq}`;
      
      setValue('invoice_number', generatedInvoiceNumber);

      if (fromQuotationId) {
        // Pre-fill from Quotation
        const { data: quotation, error: quoError } = await supabase
          .from('quotations')
          .select('*, items:quotation_items(*)')
          .eq('id', fromQuotationId)
          .single();

        if (quoError) {
          toast.error('Failed to load quotation details');
        } else if (quotation) {
          const prefilledData: any = {
            invoice_number: generatedInvoiceNumber,
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customer_id: quotation.customer_id,
            status: 'Draft',
            payment_terms: 'Due on Receipt',
            subtotal: quotation.subtotal,
            cgst: quotation.cgst,
            sgst: quotation.sgst,
            igst: quotation.igst,
            discount: quotation.discount,
            grand_total: quotation.grand_total,
            amount_in_words: quotation.amount_in_words,
            notes: quotation.notes,
            items: quotation.items ? quotation.items.map((item: any) => ({
              description: item.description,
              hsn_sac: item.hsn_sac,
              quantity: item.quantity,
              unit_price: item.unit_price,
              gst_rate: item.gst_rate,
              tax_amount: item.tax_amount,
              total_amount: item.total_amount
            })) : []
          };
          reset(prefilledData);
          toast.success('Quotation data loaded!');
        }
      }
    }
    setLoading(false);
  };


  const onSubmit = async (data: Invoice) => {
    setLoading(true);
    try {
      const { items, ...invoiceData } = data;
      
      let invoiceId = id;

      if (isEditing) {
        const { error } = await supabase.from('invoices').update(invoiceData).eq('id', id);
        if (error) throw error;
        
        // Delete existing items and re-insert
        await supabase.from('invoice_items').delete().eq('invoice_id', id);
      } else {
        const { id: _, ...insertData } = invoiceData as any;
        const { data: newInvoice, error } = await supabase.from('invoices').insert([insertData]).select().single();
        if (error) throw error;
        invoiceId = newInvoice.id;
      }

      if (items && items.length > 0 && invoiceId) {
        const itemsToInsert = items.map(item => {
          const { id: _id, ...rest } = item as any;
          return { ...rest, invoice_id: invoiceId };
        });
        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast.success(isEditing ? 'Invoice updated!' : 'Invoice created!');
      navigate('/invoices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="p-8">Loading invoice...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/invoices')} className="mr-4 text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Fill in the details below to create your invoice.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="btn-primary"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Invoice
        </button>
      </div>

      <form className="card p-8">
        {/* Top Details section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-zinc-700">Customer</label>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <UserPlus className="mr-1 h-3 w-3" /> Add New
              </button>
            </div>
            <select {...register('customer_id', { required: true })} className="input-field">
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Invoice Number</label>
            <input type="text" {...register('invoice_number', { required: true })} className="input-field mt-1 bg-zinc-50" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Invoice Date</label>
            <input type="date" {...register('date', { required: true })} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Due Date</label>
            <input type="date" {...register('due_date', { required: true })} className="input-field mt-1" />
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-10">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Items</h3>
          <div className="overflow-x-auto">
            {/* Mobile View (Stacked Cards) */}
            <div className="md:hidden space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 relative">
                  <div className="absolute top-4 right-4">
                    <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 -m-2">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4 pr-8">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Product / Description</label>
                      <textarea
                        placeholder="Enter item description..."
                        rows={2}
                        {...register(`items.${index}.description`, { required: true })}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Qty</label>
                        <input type="number" {...register(`items.${index}.quantity`, { required: true })} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Price</label>
                        <input type="number" step="0.01" {...register(`items.${index}.unit_price`, { required: true })} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">GST %</label>
                        <select {...register(`items.${index}.gst_rate`)} className="input-field">
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Total</label>
                        <div className="pt-2 font-semibold text-zinc-900">
                          ₹{Number(watch(`items.${index}.total_amount`) || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <table className="hidden md:table min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product / Description</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-24">HSN</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-24">Qty</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-32">Price</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-24">GST %</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-32">Total</th>
                  <th className="px-3 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="px-3 py-4">
                      <div className="flex flex-col space-y-2">
                        <textarea
                          placeholder="Enter item description..."
                          rows={2}
                          {...register(`items.${index}.description`, { required: true })}
                          className="input-field"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <input type="text" {...register(`items.${index}.hsn_sac`)} className="input-field text-center" />
                    </td>
                    <td className="px-3 py-4 align-top">
                      <input type="number" {...register(`items.${index}.quantity`, { required: true })} className="input-field text-right" />
                    </td>
                    <td className="px-3 py-4 align-top">
                      <input type="number" step="0.01" {...register(`items.${index}.unit_price`, { required: true })} className="input-field text-right" />
                    </td>
                    <td className="px-3 py-4 align-top">
                      <select {...register(`items.${index}.gst_rate`)} className="input-field text-right">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="px-3 py-4 align-top text-right text-sm text-gray-900 pt-6">
                      ₹{Number(watch(`items.${index}.total_amount`) || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-4 align-top pt-6">
                      <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unit_price: 0, gst_rate: 18, hsn_sac: '', tax_amount: 0, total_amount: 0 } as any)}
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </button>
        </div>

        {/* Totals Section */}
        <div className="mt-10 border-t pt-8 flex flex-col md:flex-row justify-between">
          <div className="md:w-1/2 pr-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes / Terms</label>
              <textarea {...register('notes')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="Thanks for your business..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount in Words</label>
              <p className="mt-1 text-sm text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-200">
                {watch('amount_in_words') || 'Zero Only'}
              </p>
            </div>
          </div>

          <div className="md:w-1/3 mt-6 md:mt-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">₹{Number(watch('subtotal') || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Discount (₹)</span>
              <input type="number" step="0.01" {...register('discount')} className="w-24 text-right rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1 border" />
            </div>
            {Number(watch('cgst')) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CGST</span>
                <span className="font-medium text-gray-900">₹{Number(watch('cgst') || 0).toFixed(2)}</span>
              </div>
            )}
            {Number(watch('sgst')) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SGST</span>
                <span className="font-medium text-gray-900">₹{Number(watch('sgst') || 0).toFixed(2)}</span>
              </div>
            )}
            {Number(watch('igst')) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IGST</span>
                <span className="font-medium text-gray-900">₹{Number(watch('igst') || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-3">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-gray-900">₹{Number(watch('grand_total') || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>

      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={(customer) => {
          setCustomers([...customers, customer]);
          setValue('customer_id', customer.id);
        }}
      />
    </div>
  );
}

// Simple Indian Number to Words converter
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString() as any).length > 9) return 'overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  
  return 'Rupees ' + str.trim() + ' Only';
}
