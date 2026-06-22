
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FileSignature, Users, Package, Settings, Hexagon, X } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Quotations', href: '/quotations', icon: FileSignature },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-zinc-200/60 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:bg-white/80",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/60">
          <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Hexagon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Invoicer</h1>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  isActive
                    ? 'bg-zinc-100/80 text-zinc-900 font-semibold shadow-sm'
                    : 'text-zinc-500 font-medium hover:bg-zinc-50 hover:text-zinc-900',
                  'group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200'
                )
              }
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                  'group-hover:text-blue-500',
                  // eslint-disable-next-line
                  // @ts-ignore
                  (isActive: boolean) => (isActive ? 'text-blue-600' : 'text-zinc-400')
                )}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      </div>
    </>
  );
}
