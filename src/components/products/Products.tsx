import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Product>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load products');
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      reset(product);
    } else {
      setEditingId(null);
      reset({
        name: '',
        description: '',
        hsn_sac: '',
        unit_price: 0,
        gst_rate: 18,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: Product) => {
    const formattedData = {
      ...data,
      unit_price: Number(data.unit_price),
      gst_rate: Number(data.gst_rate),
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(formattedData).eq('id', editingId);
      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully!');
        fetchProducts();
        closeModal();
      }
    } else {
      // Remove id for insert to let postgres generate it
      const { id, ...insertData } = formattedData as any;
      const { error } = await supabase.from('products').insert([insertData]);
      if (error) {
        toast.error('Failed to add product');
      } else {
        toast.success('Product added successfully!');
        fetchProducts();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete product');
      } else {
        toast.success('Product deleted successfully!');
        fetchProducts();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-zinc-900 sm:truncate sm:text-3xl sm:tracking-tight tracking-tight">
            Products & Services
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your product catalog.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Item
        </button>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="card overflow-hidden">
              {/* Mobile View (Cards) */}
              <div className="md:hidden flex flex-col">
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-4 border-b border-zinc-200 last:border-b-0 flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{product.name}</div>
                        <div className="text-sm text-zinc-500">{product.description}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => openModal(product)} className="text-zinc-400 hover:text-blue-600 transition-colors p-2 -m-2" title="Edit">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 -m-2" title="Delete">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-600 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-2">
                      <div>
                        <div className="text-xs text-zinc-400">HSN/SAC</div>
                        <div>{product.hsn_sac || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-400">GST Rate</div>
                        <div>{product.gst_rate}%</div>
                      </div>
                      <div className="col-span-2 flex justify-between items-center mt-1">
                        <div className="text-xs text-zinc-400">Unit Price</div>
                        <div className="font-semibold text-zinc-900">{formatCurrency(product.unit_price)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No products found. Click "Add Item" to create one.
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <table className="hidden md:table min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name / Description</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">HSN/SAC</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Unit Price (₹)</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">GST Rate (%)</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-zinc-900">{product.name}</div>
                        <div className="text-zinc-500">{product.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">{product.hsn_sac || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-900 text-right">{formatCurrency(product.unit_price)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 text-right">{product.gst_rate}%</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => openModal(product)} className="text-zinc-400 hover:text-blue-600 mr-4 transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-12 text-center text-sm text-zinc-500">
                        No products found. Click "Add Item" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={closeModal}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                    {editingId ? 'Edit Item' : 'Add Item'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Item Name</label>
                          <input type="text" {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea {...register('description')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">HSN/SAC Code</label>
                          <input type="text" {...register('hsn_sac')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit Price (₹)</label>
                            <input type="number" step="0.01" {...register('unit_price', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">GST Rate (%)</label>
                            <select {...register('gst_rate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white">
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
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
                          onClick={closeModal}
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
      )}
    </div>
  );
}
