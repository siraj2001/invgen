import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Quotation, Company, Customer } from '../../types';
import toast from 'react-hot-toast';
import { ArrowLeft, Printer, Download, FileText } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function QuotationPreview() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    
    const { data: compData } = await supabase.from('companies').select('*').limit(1).single();
    if (compData) setCompany(compData);

    const { data: qData, error: qErr } = await supabase
      .from('quotations')
      .select('*, items:quotation_items(*)')
      .eq('id', id)
      .single();

    if (qErr) {
      toast.error('Failed to load quotation');
    } else if (qData) {
      setQuotation(qData as any);
      
      if (qData.customer_id) {
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', qData.customer_id)
          .single();
        if (custData) setCustomer(custData);
      }
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = printRef.current;
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `${quotation?.quotation_number || 'quotation'}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        windowWidth: 800
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div className="p-8">Loading quotation...</div>;
  if (!quotation) return <div className="p-8 text-red-500">Quotation not found!</div>;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center">
          <Link to="/quotations" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">
            Quotation #{quotation.quotation_number}
          </h2>
        </div>
        <div className="space-x-3 flex items-center">
          <Link
            to={`/invoices/new?from_quotation=${quotation.id}`}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none transition-all duration-200"
          >
            <FileText className="mr-2 h-4 w-4" />
            Convert to Invoice
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* A4 Printable Container */}
      <div className="bg-zinc-100 p-8 flex justify-center print:p-0 print:bg-white overflow-x-auto">
        <div className="min-w-max">
          <div 
            ref={printRef} 
            className="bg-white p-8 shadow-lg print:shadow-none print:p-0 w-[210mm] text-[11px] text-black font-sans leading-relaxed flex flex-col"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-48 h-20 flex items-center justify-start">
              {company?.logo_url && (
                <img src={company.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">QUOTATION</h1>
              <p className="font-semibold text-sm">Quote No : {quotation.quotation_number}</p>
            </div>
          </div>

          <hr className="border-black border-t-2 mb-4" />

          {/* Company & Quote Details Box */}
          <div className="border-[1.5px] border-black flex mb-4 rounded-sm">
            <div className="w-2/3 p-3">
              <p className="font-bold text-sm uppercase mb-2">{company?.name || 'YOUR COMPANY'}</p>
              <p className="whitespace-pre-wrap">{company?.address}</p>
              <p className="mt-2 font-bold uppercase">GSTIN / TRN No : {company?.gstin || company?.pan || '-'}</p>
            </div>
            <div className="w-1/3 p-3 border-l-[1.5px] border-black">
              <div className="grid grid-cols-[80px_1fr] gap-y-2 font-bold text-xs uppercase">
                <span>DATE</span>
                <span className="text-right">{new Date(quotation.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                
                <span>VALID UNTIL</span>
                <span className="text-right">{new Date(quotation.valid_until).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
              </div>
            </div>
          </div>

          {/* Bill To Box */}
          <div className="border-[1.5px] border-black p-3 mb-4 rounded-sm">
            <p className="font-bold uppercase text-xs mb-2">QUOTATION FOR</p>
            <hr className="border-black border-t-[1.5px] -mx-3 mb-3" />
            <p className="font-bold mb-1">{customer?.company_name || customer?.name || '-'}</p>
            <p className="whitespace-pre-wrap mb-2">{customer?.billing_address || '-'}</p>
            <div className="space-y-1">
              <p><span className="font-bold uppercase">GSTIN / TRN No:</span> {customer?.gstin || '-'}</p>
              <p><span className="font-bold">Contact Email:</span> {customer?.email || '-'}</p>
              <p><span className="font-bold">Contact Number:</span> {customer?.phone || '-'}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-2 border-[1.5px] border-black border-collapse text-xs">
            <thead>
              <tr className="border-b-[1.5px] border-black">
                <th className="border-r-[1.5px] border-black p-2 font-bold text-center w-12">S.NO</th>
                <th className="border-r-[1.5px] border-black p-2 font-bold text-left">DESCRIPTION</th>
                <th className="border-r-[1.5px] border-black p-2 font-bold text-center w-20">QTY</th>
                <th className="border-r-[1.5px] border-black p-2 font-bold text-right w-24">RATE</th>
                <th className="p-2 font-bold text-right w-32">AMOUNT (INR)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item, index) => (
                <tr key={item.id || index} className="border-b border-black last:border-b-0">
                  <td className="border-r-[1.5px] border-black p-2 text-center font-bold">{index + 1}</td>
                  <td className="border-r-[1.5px] border-black p-2">
                    <p className="font-bold">{item.description}</p>
                    {item.hsn_sac && <p className="text-[10px] text-gray-600 mt-1">HSN/SAC: {item.hsn_sac}</p>}
                  </td>
                  <td className="border-r-[1.5px] border-black p-2 text-center font-bold">
                    {Number(item.quantity).toString()}
                  </td>
                  <td className="border-r-[1.5px] border-black p-2 text-right font-bold">
                    {Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-bold">
                    {(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Fill empty space if very few items */}
              {(!quotation.items || quotation.items.length < 3) && (
                 <tr className="border-b-0">
                   <td className="border-r-[1.5px] border-black p-2 text-center h-24"></td>
                   <td className="border-r-[1.5px] border-black p-2"></td>
                   <td className="border-r-[1.5px] border-black p-2 text-center"></td>
                   <td className="border-r-[1.5px] border-black p-2 text-right"></td>
                   <td className="p-2 text-right"></td>
                 </tr>
              )}
            </tbody>
          </table>

          {/* Totals Grid */}
          <div className="flex justify-end mb-4 mt-2">
            <div className="w-64 border-[1.5px] border-black rounded-sm">
              <div className="flex border-b-[1.5px] border-black">
                <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-[11px] flex items-center justify-center">SUB TOTAL</div>
                <div className="w-1/2 p-2 font-bold text-right">{Number(quotation.subtotal).toFixed(2)}</div>
              </div>
              {Number(quotation.discount) > 0 && (
                <div className="flex border-b-[1.5px] border-black">
                  <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-[11px] flex items-center justify-center">DISCOUNT</div>
                  <div className="w-1/2 p-2 font-bold text-right text-red-600">-{Number(quotation.discount).toFixed(2)}</div>
                </div>
              )}
              {Number(quotation.cgst) > 0 && (
                <div className="flex border-b-[1.5px] border-black">
                  <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-[11px] flex items-center justify-center">CGST</div>
                  <div className="w-1/2 p-2 font-bold text-right">{Number(quotation.cgst).toFixed(2)}</div>
                </div>
              )}
              {Number(quotation.sgst) > 0 && (
                <div className="flex border-b-[1.5px] border-black">
                  <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-[11px] flex items-center justify-center">SGST</div>
                  <div className="w-1/2 p-2 font-bold text-right">{Number(quotation.sgst).toFixed(2)}</div>
                </div>
              )}
              {Number(quotation.igst) > 0 && (
                <div className="flex border-b-[1.5px] border-black">
                  <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-[11px] flex items-center justify-center">IGST</div>
                  <div className="w-1/2 p-2 font-bold text-right">{Number(quotation.igst).toFixed(2)}</div>
                </div>
              )}
              <div className="flex">
                <div className="w-1/2 p-2 border-r-[1.5px] border-black font-bold uppercase text-xs flex items-center justify-center">TOTAL</div>
                <div className="w-1/2 p-2 font-bold text-right text-sm">{Number(quotation.grand_total).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="border-[1.5px] border-black p-3 mb-6 rounded-sm font-bold text-[11px]">
            AMOUNT IN WORDS: {quotation.amount_in_words}
          </div>

          {/* Scope of Work */}
          {(quotation.scope_of_work || quotation.notes) && (
            <div className="mb-4 text-[10px] whitespace-pre-wrap">
              <span className="font-bold">Scope of Work / Terms:</span><br />
              {quotation.scope_of_work || quotation.notes}
            </div>
          )}

          <div className="flex-1"></div>
          
          <hr className="border-black border-t-2 mb-4 mt-8" />

          {/* Footer Box */}
          <div className="border-[1.5px] border-black p-2 mt-auto text-center rounded-sm">
            <p className="font-bold text-[10px] uppercase">THIS IS A COMPUTER-GENERATED QUOTATION AND DOES NOT REQUIRE A SIGNATURE.</p>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
