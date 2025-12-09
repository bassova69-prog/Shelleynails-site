
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#E6E4E1] flex flex-col font-sans selection:bg-[#4A4A4A] selection:text-white relative overflow-hidden items-center">
      
      {/* --- BACKGROUND MARBLE & SILK (FLUIDE & SOYEUX) --- */}
      <div className="fixed inset-0 z-0 bg-[#E6E4E1]">
          
          {/* 1. Base Layer: Neutral Taupe/Grey Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8E6E3] via-[#DCD9D5] to-[#C8C4BC]"></div>

          {/* 2. Fluid Marble Texture (SVG Turbulence) 
             Creates a liquid, organic pattern (veins/swirls) 
          */}
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='marbleFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23marbleFilter)'/%3E%3C/svg%3E")`,
                filter: 'contrast(110%)',
            }}
          ></div>

          {/* 3. Silk Folds Simulation (Soft Linear Gradients)
             Replaces blobs with streaks of light to mimic fabric folds
          */}
          <div className="absolute inset-0 opacity-60 mix-blend-soft-light pointer-events-none overflow-hidden">
             {/* Fold 1 */}
             <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-gradient-to-tr from-transparent via-white to-transparent blur-[80px] transform rotate-12 opacity-80"></div>
             {/* Fold 2 */}
             <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-gradient-to-br from-transparent via-white to-transparent blur-[100px] transform -rotate-12 translate-y-32 opacity-60"></div>
          </div>
          
      </div>
      
      {/* Conteneur principal - Format Téléphone Strict */}
      <div className="w-full max-w-md flex flex-col flex-1 relative z-10 min-h-screen overflow-y-auto">
        <div className="p-4 flex flex-col flex-1">
            {children}
        
            {/* Signature bas de page */}
            <div className="mt-12 mb-6 text-center opacity-40 mix-blend-multiply">
                <span className="font-knife text-xl text-stone-700 tracking-widest">Shelley Nails Art</span>
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
            className="mb-6 group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
        >
            <span className="w-8 h-8 rounded-full border border-stone-400 flex items-center justify-center bg-transparent group-hover:bg-stone-800 group-hover:text-[#CDC8BE] transition-all">
                <ArrowLeft size={14} />
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
