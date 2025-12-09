
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Gift, Sparkles, Copy, Check } from 'lucide-react';

export const GiftCardView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Récupération des données depuis l'URL
  const amount = searchParams.get('amount') || '0';
  const code = searchParams.get('code') || '----';
  const to = searchParams.get('to') || 'Vous';
  const from = searchParams.get('from') || 'Une amie';
  const message = searchParams.get('message') || '';

  useEffect(() => {
    // Petit délai pour l'animation d'entrée
    setTimeout(() => setIsOpen(true), 500);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1c1917] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Animé */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#D4A373] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#FAEDCD] rounded-full blur-[150px] opacity-10"></div>

      <div className={`w-full max-w-md transition-all duration-1000 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Enveloppe / Header */}
        <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4A373]/30 shadow-[0_0_30px_rgba(212,163,115,0.2)]">
                <Gift size={32} className="text-[#D4A373]" />
            </div>
            <h1 className="text-4xl font-serif text-white mb-2">Une surprise pour vous</h1>
            <p className="text-[#D4A373] font-cursive text-3xl">de la part de {from}</p>
        </div>

        {/* La Carte Cadeau */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-1 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-[#1c1917] rounded-[1.4rem] p-8 relative overflow-hidden border border-[#D4A373]/20">
                {/* Texture Or */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4A373]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4A373] uppercase">Gift Card</span>
                        <div className="flex flex-col items-center justify-center gap-1">
                             <h2 className="text-5xl font-serif font-bold text-white tracking-tight">{amount} €</h2>
                             <p className="text-[10px] text-stone-400 mt-1 tracking-wide">Prendre RDV : shelleynailss@gmail.com</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4A373]/50 to-transparent"></div>

                    <div className="space-y-4 w-full">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Votre Code</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="font-mono text-xl text-[#FAEDCD] tracking-widest">{code}</code>
                                <button 
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#D4A373]"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="text-sm text-stone-300 font-light italic leading-relaxed px-2">
                                "{message}"
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-2">
                        <p className="font-serif text-white">Shelleynailss</p>
                        <Link 
                            to="/" 
                            className="text-[10px] text-[#D4A373] uppercase tracking-widest hover:text-white transition-colors border-b border-[#D4A373] pb-0.5"
                        >
                            Réserver maintenant
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center text-stone-500 text-xs">
            <p>Contact : <a href="mailto:shelleynailss@gmail.com" className="text-[#D4A373] hover:underline font-bold">shelleynailss@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};
