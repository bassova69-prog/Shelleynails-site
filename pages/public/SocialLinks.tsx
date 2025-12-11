
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, GraduationCap, ShoppingCart, Video, Lock, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { PublicLayout } from '../../components/PublicLayout';

// --- CONFIGURATION LOGO ---
// Mise à jour avec le lien fourni : https://raw.githubusercontent.com/bassova69-prog/Shelleynails-site/refs/heads/main/logo.png
const LOGO_SOURCE = "https://raw.githubusercontent.com/bassova69-prog/Shelleynails-site/refs/heads/main/logo.png"; 

const PRICING = [
    { category: 'Les Extensions', type: 'pricing', items: [
        { name: 'Capsules Gelx (américaines)', price: '50', details: 'Extension sur mesure' },
        { name: 'Forfait dépose/repose Gelx', price: '55', details: 'Entretien complet' },
        { name: 'Capsules Gel', price: '60', details: 'Extension technique' },
        { name: 'Gainage Gel', price: '50', details: 'Sur ongles naturels' },
        { name: 'Remplissage Gel', price: '55', details: 'Entretien mensuel' },
        { name: 'Gainage base protéiné', price: '45', details: 'Renfort naturel' },
        { name: 'Remplissage protéiné', price: '50', details: 'Entretien renfort' },
        { name: 'Chablon Gel', price: '65', details: 'Extension papier forme' },
    ]},
    { category: 'Nail Art & Extras', type: 'pricing', items: [
        { name: 'Dépose', price: '15', details: 'Toutes matières + manucure' },
        { name: 'Réparation/rallongement', price: '3', details: 'Par ongle (avec nail art: 5€)' },
        { name: 'Nail art easy', price: '10', details: 'Lignes, points, simple' },
        { name: 'Nail art complex', price: '20', details: 'Dessins, détails' },
        { name: 'Nail art challenging', price: '30', details: 'Personnages, 3D complexe' },
        { name: 'Nail art devis', price: '', details: 'Voir en DM' },
    ]},
    { category: 'Avant de réserver', type: 'info', items: [
        { 
            name: 'Contact & Inspiration', 
            details: "Merci de me contacter par message pour choisir la prestation adaptée à tes besoins.\n\nPrévoir des photos d'inspiration pour que je puisse me préparer au mieux. Si pas d'inspiration, je serais ravie de trouver avec toi !",
            action: { label: 'Envoyer un message Instagram', link: 'https://ig.me/m/shelleynailss' }
        },
    ]},
    { category: 'Règles du Salon', type: 'info', items: [
        { name: 'Annulation & Retard', details: "Être sûr(e) d'être présent(e) le jour J. Prévenir min. 24h à l'avance en cas d'empêchement (trop d'annulations = blacklist).\n\nNe pas oublier de confirmer la veille pour le lendemain (je vous enverrai un rappel)." },
    ]}
];

export const SocialLinks: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = 320; 
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  const isPriceNumber = (val: string) => !isNaN(Number(val)) && val !== '';

  return (
    <PublicLayout>
        {/* --- HEADER PROFILE GOTHIC / Y2K --- */}
        <div className="text-center space-y-1 pt-16 pb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          
          <div className="relative z-10 flex flex-col items-center mt-4 mb-12">
            
            {/* LOGIQUE D'AFFICHAGE DU LOGO / PHOTO DE PROFIL */}
            <div className="w-48 h-48 mx-auto mb-6 relative group flex items-center justify-center">
                 {/* Effet de lueur colorée derrière la photo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4A373] to-[#E1306C] rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
                
                {/* IMAGE DU LOGO */}
                <img 
                    src={LOGO_SOURCE} 
                    alt="Shelley Nails" 
                    className="relative z-10 w-full h-full object-cover rounded-full border-[3px] border-white/80 shadow-2xl hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* TITRE PRINCIPAL - STYLE COACHING (Gothic + Scale + Tracking) */}
            <h1 className="font-gothic text-5xl text-stone-800 tracking-widest mt-2 mb-1 transform scale-y-110">
                Shelley Nails
            </h1>
            
            <p className="font-serif italic text-lg text-stone-600 font-medium tracking-wide">Nail Artist & Coach Individuel</p>
            
            {/* --- SOCIAL HUB --- */}
            <div className="flex justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <SocialButton icon={Instagram} link="https://instagram.com/shelleynailss" label="IG" />
                <SocialButton icon={Video} link="https://www.tiktok.com/@shelleynailss" label="TikTok" />
                <SocialButton icon={ShoppingCart} link="https://amazon.fr" label="Shop" />
                <SocialButton icon={Mail} link="https://mail.google.com/mail/?view=cm&fs=1&to=shelleynailss@gmail.com" label="Mail" />
            </div>
          </div>
        </div>

        {/* --- PRICING SECTION --- */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 w-full">
            <div className="text-center mb-6">
                <div className="inline-block bg-[#8C867D] text-[#CDC8BE] px-6 py-2 rounded-full border border-stone-600 shadow-md">
                    <h2 className="font-gothic text-3xl tracking-widest mt-1 transform scale-y-110">TARIFS</h2>
                </div>
            </div>

            {/* Carousel Container with Absolute Arrows */}
            <div className="relative w-full">
                {/* Scroll Container */}
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scroll-smooth px-[7.5vw] items-start w-full no-scrollbar"
                >
                    {PRICING.map((cat, idx) => (
                        <div 
                            key={idx} 
                            className="snap-center shrink-0 w-[85vw] max-w-[340px] flex items-start justify-center mx-auto"
                        >
                            {/* Carte Style "Tarifs" */}
                            <div className="bg-[#8C867D]/95 backdrop-blur-sm rounded-[2rem] border border-stone-600 shadow-xl p-6 w-full relative overflow-hidden flex flex-col h-auto text-[#EBE8E3]">
                                
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-black stroke-[0.5]">
                                        <path d="M50 0 Q 20 50 50 100 Q 80 50 50 0" />
                                    </svg>
                                </div>

                                <div className="w-full flex flex-col relative z-10">
                                    <h3 className="font-serif font-bold text-sm uppercase tracking-widest text-[#CDC8BE] mb-6 text-center border-b border-[#CDC8BE]/30 pb-2">
                                        {cat.category}
                                    </h3>
                                    
                                    <div className="space-y-5 w-full">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="group/item w-full">
                                                {cat.type === 'info' ? (
                                                    <div className="flex flex-col w-full">
                                                        <div className="mb-2">
                                                            <span className="font-gothic text-2xl text-white tracking-wide">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[#CDC8BE] font-serif leading-relaxed text-justify w-full break-words">
                                                            {item.details}
                                                        </p>
                                                        {(item as any).action && (
                                                            <a 
                                                                href={(item as any).action.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-6 w-full py-3 bg-[#CDC8BE] text-[#4A4A4A] font-bold uppercase tracking-widest rounded-xl text-center hover:bg-white transition-colors block shadow-md text-xs"
                                                            >
                                                                {(item as any).action.label}
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex justify-between items-baseline mb-1 gap-2 w-full">
                                                            <span className="font-serif font-medium text-lg text-white leading-tight tracking-wide">
                                                                {item.name}
                                                            </span>
                                                            <div className="flex-1 border-b border-dashed border-[#CDC8BE]/40 mx-2 mb-1"></div>
                                                            <span className="font-gothic text-xl text-white whitespace-nowrap shrink-0">
                                                                {item.price}{item.price && isPriceNumber(item.price) && "€"}
                                                            </span>
                                                        </div>
                                                        {item.details && (
                                                            <p className="text-[10px] text-[#CDC8BE] italic opacity-80 pl-1">
                                                                {item.details}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-1 sm:pl-2 pointer-events-none z-20">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all shadow-lg pointer-events-auto active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                {/* Right Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-2 pointer-events-none z-20">
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all shadow-lg pointer-events-auto active:scale-95"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>

        {/* --- CARDS NAVIGATION --- */}
        <div className="grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 w-full px-4 mb-8">
                
                {/* COACHING CARD */}
                <Link 
                    to="/coaching"
                    className="block relative overflow-hidden rounded-[1.5rem] group shadow-xl border-2 border-stone-400"
                >
                    <div className="absolute inset-0 bg-[#4A4A4A] transition-transform duration-700 group-hover:scale-105"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col items-center text-center">
                         <div className="mb-2 text-[#CDC8BE]">
                            <GraduationCap size={28} />
                         </div>
                         <h2 className="text-3xl font-gothic text-white tracking-widest mb-1 transform scale-y-110">COACHING</h2>
                         <p className="text-[#CDC8BE] text-xs font-serif italic tracking-wide">
                            Coaching Individuel
                         </p>
                    </div>
                </Link>

                {/* COLLAB CARD */}
                <Link 
                    to="/collab"
                    className="block relative overflow-hidden rounded-[1.5rem] group shadow-xl border-2 border-[#CDC8BE]"
                >
                    <div className="absolute inset-0 bg-[#CDC8BE] transition-colors duration-300 group-hover:bg-[#EBE8E3]"></div>
                    <div className="relative z-10 p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-gothic text-2xl text-stone-800 tracking-wide transform scale-y-110">COLLAB</h3>
                            <p className="font-serif italic text-stone-600 text-sm">Créons ensemble</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-stone-800 flex items-center justify-center text-stone-800">
                             <Sparkles size={18} fill="currentColor" />
                        </div>
                    </div>
                </Link>
        </div>
        
        {/* Footer */}
        <div className="pb-4 text-center">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-[10px] text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest">
            <Lock size={10} />
            Accès Admin
          </Link>
        </div>
    </PublicLayout>
  );
};

const SocialButton = ({ icon: Icon, link, label }: any) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
        <div className="w-12 h-12 bg-[#4A4A4A] rounded-xl border-2 border-stone-300 shadow-md flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300">
            <Icon size={20} className="text-[#CDC8BE] group-hover:text-white transition-colors" />
        </div>
        <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest group-hover:text-stone-900">{label}</span>
    </a>
);
