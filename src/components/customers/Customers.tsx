import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Customer } from '../../types';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomerModal } from './CustomerModal';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load customers');
      console.error(error);
    } else {
      setCustomers(data || []);
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete customer');
      } else {
        toast.success('Customer deleted successfully!');
        fetchCustomers();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-zinc-900 sm:truncate sm:text-3xl sm:tracking-tight tracking-tight">
            Customers
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your customer database.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </button>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="card overflow-hidden">
              {/* Mobile View (Cards) */}
              <div className="md:hidden flex flex-col">
                {customers.map((customer) => (
                  <div key={customer.id} className="bg-white p-4 border-b border-zinc-200 last:border-b-0 flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{customer.name}</div>
                        <div className="text-sm text-zinc-500">{customer.company_name}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => openModal(customer)} className="text-zinc-400 hover:text-blue-600 transition-colors p-2 -m-2" title="Edit">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 -m-2" title="Delete">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-600 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-zinc-400">Email</div>
                        <div>{customer.email || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-400">Phone</div>
                        <div>{customer.phone || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-400">GSTIN</div>
                        <div>{customer.gstin || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-400">State</div>
                        <div>{customer.state || '-'}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No customers found. Create your first customer!
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <table className="hidden md:table min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name / Company</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">GSTIN</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">State</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-zinc-900">{customer.name}</div>
                        <div className="text-zinc-500">{customer.company_name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                        <div>{customer.email}</div>
                        <div>{customer.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">{customer.gstin || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">{customer.state}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => openModal(customer)} className="text-zinc-400 hover:text-blue-600 mr-4 transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-12 text-center text-sm text-zinc-500">
                        No customers found. Create your first customer!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        customer={customers.find(c => c.id === editingId) || null}
        onSave={() => {
          fetchCustomers();
        }}
      />
    </div>
  );
}
