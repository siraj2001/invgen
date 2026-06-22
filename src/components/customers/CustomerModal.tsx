import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Customer } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const { register, handleSubmit, reset } = useForm<Customer>();

  useEffect(() => {
    if (customer) {
      reset(customer);
    } else {
      reset({
        name: '',
        company_name: '',
        gstin: '',
        contact_person: '',
        phone: '',
        email: '',
        billing_address: '',
        shipping_address: '',
        state: '',
        pincode: '',
      });
    }
  }, [customer, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: Customer) => {
    if (customer?.id) {
      const { error } = await supabase.from('customers').update(data).eq('id', customer.id);
      if (error) {
        toast.error('Failed to update customer');
      } else {
        toast.success('Customer updated successfully!');
        onSave({ ...data, id: customer.id });
        onClose();
      }
    } else {
      const { id, ...insertData } = data as any;
      const { data: newCustomer, error } = await supabase.from('customers').insert([insertData]).select().single();
      if (error) {
        toast.error('Failed to add customer');
      } else if (newCustomer) {
        toast.success('Customer added successfully!');
        onSave(newCustomer as Customer);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                {customer?.id ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <div className="mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Name</label>
                      <input type="text" {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input type="text" {...register('company_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                      <input type="text" {...register('gstin')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <input type="text" {...register('contact_person')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="text" {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                      <textarea {...register('billing_address')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                      <textarea {...register('shipping_address')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input type="text" {...register('state')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pincode</label>
                      <input type="text" {...register('pincode')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse border-t pt-4">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
