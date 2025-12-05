import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans selection:bg-[#D4A373] selection:text-white relative overflow-hidden items-center">
      
      {/* --- BACKGROUND ARTISTIQUE (Airbrush Effect) --- */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-40"></div>
      
      {/* Formes floues (Blobs) */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E8DCC4] rounded-full blur-[100px] opacity-60 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#FADADD] rounded-full blur-[120px] opacity-40"></div>
      <div className="fixed top-[40%] right-[-20%] w-[400px] h-[400px] bg-[#D4A373] rounded-full blur-[100px] opacity-20"></div>

      {/* Conteneur principal - Format Téléphone Strict */}
      <div className="w-full max-w-md flex flex-col flex-1 relative z-10 bg-white/30 min-h-screen shadow-2xl overflow-y-auto">
        <div className="p-6 flex flex-col flex-1">
            {children}
        
            {/* Signature bas de page */}
            <div className="mt-12 mb-6 text-center opacity-60">
                <span className="font-cursive text-3xl text-stone-800">Shelley Nails Art</span>
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
            className="mb-6 group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
        >
            <span className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white/50 backdrop-blur-sm group-hover:bg-white group-hover:scale-110 transition-all">
                <ArrowLeft size={14} />
            </span>
            {label}
        </button>
    );
};

export const SuccessMessage: React.FC<{ title: string, text: string }> = ({ title, text }) => (
    <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2rem] text-center shadow-xl border border-white animate-in zoom-in duration-500 relative overflow-hidden max-w-xl mx-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4A373] to-transparent opacity-50"></div>
        <h2 className="text-4xl font-cursive text-stone-900 mb-4">{title}</h2>
        <p className="text-stone-600 font-medium leading-relaxed">{text}</p>
    </div>
);