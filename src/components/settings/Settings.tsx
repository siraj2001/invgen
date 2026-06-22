import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Company } from '../../types';
import toast from 'react-hot-toast';

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Company>();
  const logoUrl = watch('logo_url');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo file is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('logo_url', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setValue('logo_url', '', { shouldDirty: true });
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    const { data, error } = await supabase.from('companies').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      toast.error('Failed to load company details');
      console.error(error);
    }
    if (data) {
      setCompanyId(data.id);
      reset(data);
    } else {
      reset({
        terms: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed.'
      });
    }
    setLoading(false);
  };

  const onSubmit = async (data: Company) => {
    if (companyId) {
      const { error } = await supabase.from('companies').update(data).eq('id', companyId);
      if (error) {
        toast.error('Failed to update settings');
        console.error(error);
      } else {
        toast.success('Company details saved successfully!');
      }
    } else {
      const { id, ...insertData } = data as any;
      const { data: newCompany, error } = await supabase.from('companies').insert([insertData]).select().single();
      if (error) {
        toast.error('Failed to save settings');
        console.error(error);
      } else if (newCompany) {
        setCompanyId(newCompany.id);
        toast.success('Company details saved successfully!');
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Company Settings
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This information will be displayed on your invoices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Company Logo</label>
              <div className="mt-1 flex items-center space-x-4">
                {logoUrl ? (
                  <div className="relative h-24 w-48 border rounded flex items-center justify-center overflow-hidden bg-gray-50">
                    <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                    <button type="button" onClick={removeLogo} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                      <span className="sr-only">Remove</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-sm">No logo</span>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Upload Logo
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="mt-1">
                <input type="text" {...register('name', { required: true })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="gstin" className="block text-sm font-medium text-gray-700">GSTIN</label>
              <div className="mt-1">
                <input type="text" {...register('gstin')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN Number</label>
              <div className="mt-1">
                <input type="text" {...register('pan')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" {...register('email')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1">
                <input type="text" {...register('phone')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Company Address</label>
              <div className="mt-1">
                <textarea {...register('address')} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your bank details for receiving payments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <div className="mt-1">
                <input type="text" {...register('bank_name')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <div className="mt-1">
                <input type="text" {...register('account_name')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <div className="mt-1">
                <input type="text" {...register('account_number')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
              <div className="mt-1">
                <input type="text" {...register('ifsc')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">UPI ID</label>
              <div className="mt-1">
                <input type="text" {...register('upi_id')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
              <div className="mt-1">
                <textarea {...register('terms')} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
