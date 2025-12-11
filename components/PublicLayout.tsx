
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// URL de l'image de fond stockée sur GitHub (extension .png)
const BACKGROUND_URL = "https://raw.githubusercontent.com/bassova69-prog/Shelleynails-site/main/fond.png?v=bg_update_png";

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#E6E4E1] flex flex-col font-sans selection:bg-[#4A4A4A] selection:text-white relative overflow-hidden items-center">
      
      {/* --- BACKGROUND IMAGE --- */}
      <div className="fixed inset-0 z-0 bg-[#E6E4E1]">
          {/* Image de fond */}
          <img 
            src={BACKGROUND_URL}
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Léger voile optionnel pour adoucir l'image et garder le texte lisible */}
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
      </div>
      
      {/* Conteneur principal - Format Téléphone Strict */}
      <div className="w-full max-w-md flex flex-col flex-1 relative z-10 min-h-screen overflow-y-auto">
        <div className="p-4 flex flex-col flex-1">
            {children}
        
            {/* Signature bas de page */}
            <div className="mt-12 mb-6 text-center opacity-60 mix-blend-hard-light">
                <span className="font-gothic text-2xl text-stone-800 tracking-widest drop-shadow-sm transform scale-y-110 inline-block">Shelley Nails Art</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export const BackButton: React.FC<{ label?: string, to?: string }> = ({ label = "Retour", to = "/" }) => {
    const navigate = useNavigate();
    return (
        <button 
            onClick={() => navigate(to)} 
            className="mb-6 group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-sm"
        >
            <span className="w-6 h-6 rounded-full border border-stone-500 flex items-center justify-center bg-transparent group-hover:bg-stone-800 group-hover:text-[#CDC8BE] transition-all group-hover:border-stone-800">
                <ArrowLeft size={12} />
            </span>
            {label}
        </button>
    );
};

export const SuccessMessage: React.FC<{ title: string, text: string }> = ({ title, text }) => (
    <div className="bg-[#8C867D] p-10 rounded-[2rem] text-center shadow-xl border border-stone-600 animate-in zoom-in duration-500 relative overflow-hidden max-w-xl mx-auto">
        <h2 className="text-4xl font-gothic text-white mb-4 tracking-wide">{title}</h2>
        <p className="text-[#CDC8BE] font-medium leading-relaxed">{text}</p>
    </div>
);
