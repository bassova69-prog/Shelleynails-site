
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PiggyBank, Truck, LogOut, Menu, X, ExternalLink, Sparkles, Gift, Lock, Settings } from 'lucide-react';
import { getAdminPin } from '../services/storage';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// URL de l'image de fond (extension .png)
const BACKGROUND_URL = "https://raw.githubusercontent.com/bassova69-prog/Shelleynails-site/main/fond.png?v=bg_update_png";

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
      const currentPin = getAdminPin();
      
      if (pin === currentPin) {
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
    { path: '/admin/settings', icon: Settings, label: 'Réglages' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // --- BACKGROUND IMAGE ---
  const BackgroundLayer = () => (
    <div className="fixed inset-0 z-0 bg-[#E6E4E1] pointer-events-none">
          <img 
            src={BACKGROUND_URL}
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
    </div>
  );

  // Style commun pour les titres
  const titleStyle = {
    background: 'linear-gradient(to bottom, #F5F5F4 0%, #A8A29E 45%, #57534E 50%, #A8A29E 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))',
    WebkitTextStroke: '0.5px #44403C',
  };

  // --- ECRAN DE VERROUILLAGE ---
  if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#E6E4E1] flex items-center justify-center p-4 font-sans text-stone-800 relative overflow-hidden">
             <BackgroundLayer />
             
             <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/40 max-w-sm w-full text-center relative overflow-hidden animate-in fade-in zoom-in duration-700 z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-stone-900/90 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4A373] shadow-lg border border-[#D4A373]/30">
                        <Lock size={36} />
                    </div>
                    
                    <h1 
                        className="text-5xl font-gothic mb-2 tracking-widest transform scale-y-110"
                        style={titleStyle}
                    >
                        Espace Pro
                    </h1>
                    <p className="text-stone-600 text-sm mb-8 font-medium tracking-wide">Shelley Nails Atelier</p>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <input 
                                type="password" 
                                value={pin}
                                onChange={(e) => { setPin(e.target.value); setError(false); }}
                                className="w-full text-center text-3xl tracking-[0.5em] p-4 rounded-2xl border border-stone-300/50 focus:border-[#D4A373] focus:ring-0 outline-none bg-white/40 font-serif text-stone-900 placeholder-stone-400 transition-all shadow-inner"
                                placeholder="••••••"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-xs font-bold animate-pulse bg-red-50/50 py-2 rounded-lg border border-red-200/50">
                                Code d'accès incorrect
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-stone-900 text-[#D4A373] font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs active:scale-[0.98]"
                        >
                            <Sparkles size={16} /> Déverrouiller
                        </button>
                    </form>
                    
                    <Link to="/" className="inline-block mt-8 text-[10px] text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider border-b border-transparent hover:border-stone-900 pb-0.5 transition-all">
                        Retour au site public
                    </Link>
                </div>
             </div>
        </div>
      );
  }

  // --- LAYOUT ADMIN CONNECTÉ ---
  return (
    <div className="min-h-screen bg-[#E6E4E1] flex font-sans text-stone-800 relative overflow-hidden">
      <BackgroundLayer />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphic */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/40 backdrop-blur-2xl border-r border-white/30 shadow-2xl shadow-stone-900/5 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <div className="p-8 flex items-center justify-between">
            <div>
                <h1 
                    className="text-4xl font-gothic tracking-widest leading-none transform scale-y-110"
                    style={titleStyle}
                >
                    Shelley<br/>Nails
                </h1>
                <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em] mt-2 font-bold pl-1">Atelier Manager</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-stone-600 hover:text-stone-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 no-scrollbar">
            <div className="px-4 mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Gestion</span>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group border ${
                  isActive(item.path)
                    ? 'bg-stone-900 text-white shadow-lg border-stone-800'
                    : 'text-stone-700 hover:bg-white/40 hover:text-stone-900 border-transparent hover:border-white/30'
                }`}
              >
                <item.icon size={18} className={isActive(item.path) ? "text-[#D4A373]" : "group-hover:text-[#D4A373] transition-colors"} />
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </Link>
            ))}

            <div className="px-4 mt-8 mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Public</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-stone-700 hover:bg-white/40 hover:text-stone-900 transition-all group border border-transparent hover:border-white/30"
            >
              <ExternalLink size={18} className="group-hover:text-[#D4A373] transition-colors" />
              <span className="font-medium text-sm tracking-wide">Voir le site public</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/20 bg-white/20">
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-white/50 flex items-center justify-center text-stone-500 border border-[#D4A373]/50 shadow-sm backdrop-blur-sm">
                    <Sparkles size={16} className="text-[#D4A373] fill-[#D4A373]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-900">Shelley</p>
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Admin</p>
                </div>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('shelleynails_admin_auth');
                        setIsAuthenticated(false);
                    }}
                    className="ml-auto p-2 text-stone-500 hover:text-red-500 transition-colors"
                    title="Déconnexion"
                >
                    <LogOut size={16} />
                </button>
            </div>
          </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen">
        <header className="bg-white/40 backdrop-blur-md border-b border-white/30 p-4 flex items-center justify-between lg:hidden sticky top-0 z-30 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="text-stone-700 p-2 -ml-2">
            <Menu size={24} />
          </button>
          <span 
              className="font-gothic text-3xl tracking-widest transform scale-y-110"
              style={titleStyle}
          >
              Shelley Nails
          </span>
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
