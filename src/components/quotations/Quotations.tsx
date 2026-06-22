import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Quotation } from '../../types';
import { Plus, Trash2, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Quotations() {
  const [quotations, setQuotations] = useState<(Quotation & { customers: { name: string, company_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select('*, customers(name, company_name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load quotations');
      console.error(error);
    } else {
      setQuotations(data as any || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete quotation');
      } else {
        toast.success('Quotation deleted successfully!');
        fetchQuotations();
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading quotations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-zinc-900 sm:truncate sm:text-3xl sm:tracking-tight tracking-tight">
            Quotations
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Manage and view all your quotations.</p>
        </div>
        <Link
          to="/quotations/new"
          className="btn-primary"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Quotation
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="card overflow-hidden">
              {/* Mobile View (Cards) */}
              <div className="md:hidden flex flex-col">
                {quotations.map((quote) => (
                  <div key={quote.id} className="bg-white p-4 border-b border-zinc-200 last:border-b-0 flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{quote.quotation_number}</div>
                        <div className="text-xs text-zinc-500">{new Date(quote.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                        Valid: {new Date(quote.valid_until).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-700">
                      {quote.customers?.company_name || quote.customers?.name || 'Unknown'}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                      <div className="text-sm font-bold text-zinc-900">
                        ₹{Number(quote.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex space-x-4">
                        <Link to={`/quotations/${quote.id}`} className="text-zinc-400 hover:text-blue-600 transition-colors p-2 -m-2" title="View" aria-label={`View Quotation ${quote.quotation_number}`}>
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(quote.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 -m-2" title="Delete" aria-label={`Delete Quotation ${quote.quotation_number}`}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {quotations.length === 0 && (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                    <h3 className="mt-2 text-sm font-medium text-zinc-900">No quotations</h3>
                    <p className="mt-1 text-sm text-zinc-500">Get started by creating a new quotation.</p>
                    <div className="mt-6">
                      <Link to="/quotations/new" className="btn-primary">
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        New Quotation
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <table className="hidden md:table min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quote #</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valid Until</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {quotations.map((quote) => (
                    <tr key={quote.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900">
                        {quote.quotation_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                        {new Date(quote.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                        {quote.customers?.company_name || quote.customers?.name || 'Unknown'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-900 text-right">
                        ₹{Number(quote.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to={`/quotations/${quote.id}`} className="text-zinc-400 hover:text-zinc-600 mr-4 transition-colors" title="View" aria-label={`View Quotation ${quote.quotation_number}`}>
                          <Eye className="h-4 w-4 inline" />
                        </Link>
                        <button onClick={() => handleDelete(quote.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete" aria-label={`Delete Quotation ${quote.quotation_number}`}>
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-sm text-zinc-500">
                        <FileText className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                        <h3 className="mt-2 text-sm font-medium text-zinc-900">No quotations</h3>
                        <p className="mt-1 text-sm text-zinc-500">Get started by creating a new quotation.</p>
                        <div className="mt-6">
                          <Link
                            to="/quotations/new"
                            className="btn-primary"
                          >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            New Quotation
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
