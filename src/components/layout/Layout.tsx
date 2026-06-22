import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50/50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm px-4 sm:px-8 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-zinc-800 tracking-tight hidden sm:block">Workspace</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Local Database Active
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
