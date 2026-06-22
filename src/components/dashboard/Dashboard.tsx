import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Users, Box, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState({
    invoices: 0,
    quotations: 0,
    customers: 0,
    products: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [inv, quot, cust, prod] = await Promise.all([
        supabase.from('invoices').select('grand_total, status', { count: 'exact' }),
        supabase.from('quotations').select('id', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);

      let totalRevenue = 0;
      if (inv.data) {
        // Calculate revenue for non-draft invoices
        totalRevenue = inv.data
          .filter((i: any) => i.status !== 'Draft')
          .reduce((sum: number, i: any) => sum + Number(i.grand_total || 0), 0);
      }

      setStats({
        invoices: inv.count || 0,
        quotations: quot.count || 0,
        customers: cust.count || 0,
        products: prod.count || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Revenue', value: `₹ ${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Total Invoices', value: stats.invoices, icon: FileText, color: 'bg-blue-500', link: '/invoices' },
    { name: 'Quotations', value: stats.quotations, icon: FileText, color: 'bg-purple-500', link: '/quotations' },
    { name: 'Customers', value: stats.customers, icon: Users, color: 'bg-yellow-500', link: '/customers' },
    { name: 'Products/Services', value: stats.products, icon: Box, color: 'bg-pink-500', link: '/products' },
  ];

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Overview of your business performance and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="card group hover:-translate-y-1 transition-all duration-300">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-xl p-3 ${card.color} bg-opacity-10 ring-1 ring-inset ${card.color.replace('bg-', 'ring-').replace('500', '500/20')} transition-colors group-hover:bg-opacity-20`}>
                    <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-zinc-500">{card.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {card.link && (
              <div className="bg-zinc-50/50 px-5 py-3 border-t border-zinc-100">
                <div className="text-sm">
                  <Link to={card.link} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    View details &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
