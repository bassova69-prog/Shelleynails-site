
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, GraduationCap, Briefcase, ShoppingCart, Video, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { PublicLayout } from '../../components/PublicLayout';

// --------------------------------------------------------------------------------------
const PROFILE_PICTURE = "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=600&q=80";

const PRICING = [
    { category: 'Les Extensions', type: 'pricing', items: [
        { name: 'Pose Complète Gel', price: '65', details: 'Extension sur mesure + Couleur' },
        { name: 'Remplissage Gel', price: '45', details: 'Jusqu\'à 4 semaines' },
        { name: 'Gainage Renf.', price: '40', details: 'Sur ongles naturels' },
        { name: 'Vernis Semi-Perm.', price: '35', details: 'Manucure russe incluse' },
    ]},
    { category: 'Nail Art & Dépose', type: 'pricing', items: [
        { name: 'Nail Art Simple', price: '2', details: 'Lignes, points, french (par ongle)' },
        { name: 'Nail Art Complexe', price: '5', details: 'Dessins main levée, 3D (par ongle)' },
        { name: 'Babyboomer / French', price: '10', details: 'Supplément sur la pose complète' },
        { name: 'Dépose seule', price: '20', details: 'Soin des ongles inclus' },
    ]},
    { category: 'Avant de réserver', type: 'info', items: [
        { 
            name: 'Contact & Inspiration', 
            details: "Merci de me contacter par message avant de réserver pour choisir la prestation adaptée. \n\nPensez aussi à m'envoyer vos photos d'inspiration à l'avance ! Si vous n'avez pas d'idée, nous créerons quelque chose d'unique ensemble lors du rendez-vous.",
            action: { label: 'Me contacter', link: 'mailto:pro@shelleynails.com' }
        },
    ]},
    { category: 'Règles du Salon', type: 'info', items: [
        { name: 'Annulation & Retard', details: "Votre présence est précieuse. Merci de prévenir au minimum 24h à l'avance en cas d'empêchement.\n\nAttention : Les annulations de dernière minute répétées entraîneront un blocage de la prise de rendez-vous.\n\nMerci de confirmer votre venue la veille du RDV (je vous enverrai un rappel, mais pensez-y !)." },
    ]}
];
// --------------------------------------------------------------------------------------

export const SocialLinks: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        // Scroll par la largeur d'une carte moyenne (env 300px + gap)
        const scrollAmount = 320; 
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  const isPriceNumber = (val: string) => !isNaN(Number(val));

  return (
    <PublicLayout>
        {/* --- HEADER PROFILE ARTISTIQUE --- */}
        <div className="text-center space-y-1 pt-4 pb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative inline-block group mb-2">
             {/* Cercles décoratifs */}
             <div className="absolute inset-0 rounded-full border border-[#D4A373] rotate-12 scale-110 opacity-30 group-hover:rotate-45 transition-transform duration-700"></div>
             <div className="absolute inset-0 rounded-full border border-stone-400 -rotate-6 scale-105 opacity-20"></div>
             
             <div className="w-24 h-24 rounded-full p-1 bg-white/50 backdrop-blur-sm mx-auto shadow-2xl shadow-stone-300/50 relative z-10">
                <img src={PROFILE_PICTURE} alt="Profile" className="w-full h-full object-cover rounded-full" />
             </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">
              Shelley<span className="italic font-light">nailss</span>
            </h1>
            <p className="font-cursive text-3xl text-[#D4A373] mt-0 leading-none">Nail Artist & Mentor</p>
            
            {/* --- SOCIAL HUB (Compact) --- */}
            <div className="flex justify-center gap-4 pt-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <SocialButton icon={Instagram} link="https://instagram.com" label="Instagram" />
                <SocialButton icon={Video} link="https://tiktok.com" label="TikTok" />
                <SocialButton icon={ShoppingCart} link="https://amazon.fr" label="Amazon" />
                <SocialButton icon={Briefcase} link="mailto:pro@shelleynails.com" label="Contact" />
            </div>
          </div>
        </div>

        {/* --- PRICING SECTION (CAROUSEL CENTRÉ) --- */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 relative group/section w-full">
            <div className="text-center mb-4">
                <span className="font-cursive text-2xl text-[#D4A373]">Studio</span>
                <h2 className="font-serif font-bold text-2xl text-stone-900 mt-0">Tarifs & Infos</h2>
            </div>

            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto pb-8 gap-4 snap-x snap-mandatory scroll-smooth px-[7.5vw] items-start w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {PRICING.map((cat, idx) => (
                    <div 
                        key={idx} 
                        className="snap-center shrink-0 w-[85vw] max-w-[340px] flex items-start justify-center mx-auto"
                    >
                        {/* 
                           Carte "Moyenne" - Hauteur ajustée au contenu
                        */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-lg p-5 w-full relative overflow-hidden group flex flex-col h-auto">
                            {/* Decor Light */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4A373] rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

                            <div className="w-full flex flex-col">
                                <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2 flex-wrap shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0"></span>
                                    {cat.category}
                                </h3>
                                
                                <div className="space-y-4 w-full">
                                    {cat.items.map((item, i) => (
                                        <div key={i} className="group/item w-full">
                                            {cat.type === 'info' ? (
                                                /* --- LAYOUT INFO (Cartouches 3 & 4) --- */
                                                <div className="flex flex-col w-full">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-serif font-bold text-lg text-stone-900 leading-tight">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    {/* Texte complet qui prend toute la place et va à la ligne */}
                                                    <p className="text-sm text-stone-600 font-light leading-relaxed whitespace-pre-wrap text-justify w-full break-words">
                                                        {item.details}
                                                    </p>
                                                    
                                                    {/* Bouton d'action si présent */}
                                                    {(item as any).action && (
                                                        <a 
                                                            href={(item as any).action.link}
                                                            className="mt-6 w-full py-3 bg-stone-900 text-[#FAEDCD] text-xs font-bold uppercase tracking-widest rounded-xl text-center hover:bg-black transition-colors block shadow-md"
                                                        >
                                                            {(item as any).action.label}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                /* --- LAYOUT TARIFS (Cartouches 1 & 2) --- */
                                                <div className="flex flex-col w-full">
                                                    <div className="flex justify-between items-baseline mb-1 gap-2 w-full">
                                                        <span className="font-serif text-lg text-stone-900 leading-tight break-words max-w-[70%]">
                                                            {item.name}
                                                        </span>
                                                        {/* Ligne pointillée décorative */}
                                                        <div className="hidden sm:block flex-1 border-b border-dotted border-stone-300 mx-2 opacity-30"></div>
                                                        <span className={`font-serif font-bold text-lg whitespace-nowrap shrink-0 ${isPriceNumber(item.price || '') ? 'text-[#D4A373]' : 'text-stone-400 text-xs'}`}>
                                                            {item.price}
                                                            {item.price && isPriceNumber(item.price) && <span className="text-xs align-top ml-0.5">€</span>}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-500 font-light leading-relaxed opacity-80 break-words whitespace-normal w-full">
                                                        {item.details}
                                                    </p>
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

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-6 mt-0">
                <button 
                    onClick={() => scroll('left')}
                    className="p-3 bg-white border border-stone-100 rounded-full shadow-sm text-stone-400 hover:text-stone-900 hover:border-stone-300 transition-all active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Swipe</span>
                <button 
                    onClick={() => scroll('right')}
                    className="p-3 bg-white border border-stone-100 rounded-full shadow-sm text-stone-400 hover:text-stone-900 hover:border-stone-300 transition-all active:scale-95"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>

        {/* --- ARTISTIC CARDS NAVIGATION --- */}
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 w-full px-4">
                
                {/* Highlight Card: Coaching (COMPACT & VERTICAL) */}
                <Link 
                    to="/coaching"
                    className="block relative overflow-hidden rounded-[2rem] group shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-stone-900 transition-transform duration-700 group-hover:scale-105">
                         {/* Texture Stardust */}
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                         
                         {/* Gradient Orb */}
                         <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#D4A373] rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    </div>
                    
                    <div className="relative z-10 p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FAEDCD]"></span>
                                <span className="text-[#FAEDCD] text-[10px] font-bold uppercase tracking-[0.2em]">Academy</span>
                             </div>
                             
                             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-stone-900 transition-all duration-300">
                                <GraduationCap size={18} />
                             </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-6 mb-1">
                                <h2 className="text-3xl font-serif text-white italic">Mentorat Privé</h2>
                            </div>
                            <p className="text-stone-300 text-sm font-light max-w-[250px] leading-relaxed">
                                Passez au niveau supérieur. Coaching technique.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Collab Full Width Card */}
                <Link 
                    to="/collab"
                    className="block bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-[#D4A373] shadow-sm hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden h-full flex flex-col justify-center"
                >
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#D4A373] rounded-full blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="font-serif text-xl text-stone-900">Collab & Partenariat</h3>
                            <p className="font-cursive text-3xl text-[#D4A373] mt-0 leading-none">Créons ensemble</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-[#D4A373]/50 flex items-center justify-center bg-white/50 text-[#D4A373] group-hover:bg-[#D4A373] group-hover:text-white transition-colors">
                             <Sparkles size={18} strokeWidth={1} className="fill-current" />
                        </div>
                    </div>
                </Link>
        </div>
        
        {/* Footer */}
        <div className="pt-8 pb-4 text-center">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-[10px] text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest border-b border-transparent hover:border-stone-800 pb-0.5">
            <Lock size={10} />
            Accès Admin
          </Link>
        </div>
    </PublicLayout>
  );
};

const SocialButton = ({ icon: Icon, link, label }: any) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
        <div className="w-10 h-10 bg-white rounded-xl border border-stone-100 shadow-sm flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group-hover:shadow-md group-hover:border-stone-300">
             <div className="absolute inset-0 bg-[#FAEDCD] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <Icon size={16} className="text-stone-700 stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
        </div>
        <span className="text-[10px] text-stone-400 font-medium tracking-wide group-hover:text-stone-800 transition-colors">{label}</span>
    </a>
);
