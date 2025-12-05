
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PiggyBank, Truck, LogOut, Menu, X, ExternalLink, Sparkles, Gift, Lock } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // --- AUTHENTIFICATION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
      // Vérifie si l'utilisateur est déjà connecté dans cette session
      const auth = sessionStorage.getItem('shelleynails_admin_auth');
      if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (pin === '1234') {
          setIsAuthenticated(true);
          sessionStorage.setItem('shelleynails_admin_auth', 'true');
          setError(false);
      } else {
          setError(true);
          setPin('');
      }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/clients', icon: Users, label: 'Clientes & Relances' },
    { path: '/admin/accounting', icon: PiggyBank, label: 'Comptabilité' },
    { path: '/admin/suppliers', icon: Truck, label: 'Fournisseurs' },
    { path: '/admin/gift-cards', icon: Gift, label: 'Cartes Cadeaux' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // --- ECRAN DE VERROUILLAGE ---
  if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4 font-sans text-stone-800">
             <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-[#D4A373] max-w-sm w-full text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4A373]"></div>
                
                <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4A373] shadow-lg border border-[#D4A373]">
                    <Lock size={32} />
                </div>
                
                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-1">Espace Pro</h1>
                <p className="text-stone-500 text-sm mb-8 font-medium">Veuillez vous identifier</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <input 
                            type="password" 
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setError(false); }}
                            className="w-full text-center text-3xl tracking-[0.5em] p-4 rounded-xl border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none bg-stone-50 font-serif text-stone-900 placeholder-stone-300 transition-all"
                            placeholder="••••"
                            maxLength={4}
                            autoFocus
                        />
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-xs font-bold animate-pulse bg-red-50 py-2 rounded-lg border border-red-100">
                            Code d'accès incorrect
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="w-full py-4 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:bg-black transition-all shadow-lg border border-[#D4A373] flex items-center justify-center gap-2 uppercase tracking-widest text-xs active:scale-[0.98]"
                    >
                        <Sparkles size={16} /> Déverrouiller
                    </button>
                </form>
                
                <Link to="/" className="inline-block mt-8 text-[10px] text-stone-400 hover:text-stone-900 font-bold uppercase tracking-wider border-b border-transparent hover:border-stone-900 pb-0.5 transition-all">
                    Retour au site public
                </Link>
             </div>
        </div>
      );
  }

  // --- LAYOUT ADMIN CONNECTÉ ---
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
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group border border-transparent ${
                  isActive(item.path)
                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-200 border-[#D4A373]'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-200'
                }`}
              >
                <item.icon size={18} className={isActive(item.path) ? "text-[#D4A373]" : "group-hover:text-[#D4A373] transition-colors"} />
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </Link>
            ))}

            <div className="px-4 mt-8 mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Public</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-all group border border-transparent hover:border-stone-200"
            >
              <ExternalLink size={18} className="group-hover:text-[#D4A373] transition-colors" />
              <span className="font-medium text-sm tracking-wide">Voir le site public</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-[#D4A373]">
                    <Sparkles size={14} className="text-[#D4A373] fill-[#D4A373]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-900">Shelley</p>
                    <p className="text-xs text-stone-400">Admin</p>
                </div>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('shelleynails_admin_auth');
                        setIsAuthenticated(false);
                    }}
                    className="ml-auto p-2 text-stone-400 hover:text-red-500 transition-colors"
                    title="Déconnexion"
                >
                    <LogOut size={16} />
                </button>
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
