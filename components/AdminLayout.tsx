
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PiggyBank, Truck, LogOut, Menu, X, ExternalLink, Sparkles, Gift } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/clients', icon: Users, label: 'Clientes & Relances' },
    { path: '/admin/accounting', icon: PiggyBank, label: 'Comptabilité' },
    { path: '/admin/suppliers', icon: Truck, label: 'Fournisseurs' },
    { path: '/admin/gift-cards', icon: Gift, label: 'Cartes Cadeaux' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex font-sans text-stone-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-stone-100 shadow-2xl shadow-stone-100/50 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">Shelleynailss</h1>
                <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Business Manager</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-stone-400 hover:text-stone-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
            <div className="px-4 mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Gestion</span>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-200'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <item.icon size={18} className={isActive(item.path) ? "text-stone-200" : "group-hover:text-stone-900 transition-colors"} />
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </Link>
            ))}

            <div className="px-4 mt-8 mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Public</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-all group"
            >
              <ExternalLink size={18} className="group-hover:text-stone-900 transition-colors" />
              <span className="font-medium text-sm tracking-wide">Voir le site public</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Sparkles size={14} />
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-900">Shelley</p>
                    <p className="text-xs text-stone-400">Admin</p>
                </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 p-4 flex items-center justify-between lg:hidden sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-stone-600 p-2 -ml-2">
            <Menu size={24} />
          </button>
          <span className="font-bold text-stone-900 font-serif">Shelleynailss</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};