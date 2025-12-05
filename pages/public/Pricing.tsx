import React from 'react';
import { PublicLayout, BackButton } from '../../components/PublicLayout';

const PRICING = [
    { category: 'Les Extensions', items: [
        { name: 'Pose Complète Gel (Chablon)', price: '65', details: 'Extension sur mesure + Couleur' },
        { name: 'Remplissage Gel', price: '45', details: 'Jusqu\'à 4 semaines' },
    ]},
    { category: 'Le Naturel', items: [
        { name: 'Gainage Renforcement', price: '40', details: 'Sur ongles naturels' },
        { name: 'Vernis Semi-Permanent', price: '35', details: 'Manucure russe incluse' },
    ]},
    { category: 'Nail Art', items: [
        { name: 'Niveau 1 - Minimaliste', price: '2', details: 'Lignes, points, french simple (par ongle)' },
        { name: 'Niveau 2 - Artistique', price: 'Sur devis', details: 'Personnages, 3D, incrustations' }
    ]}
];

export const Pricing: React.FC = () => {
    return (
        <PublicLayout>
            <div className="animate-in slide-in-from-right duration-500 max-w-2xl mx-auto w-full">
                <BackButton label="Menu principal" />
                
                <div className="relative">
                    {/* Carte Menu */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white overflow-hidden p-8 relative">
                         {/* Watermark */}
                         <div className="absolute -right-10 top-20 font-serif text-9xl text-stone-900 opacity-[0.03] rotate-90 pointer-events-none">
                            MENU
                         </div>

                        <div className="text-center mb-10">
                            <span className="font-cursive text-3xl text-[#D4A373]">Studio</span>
                            <h2 className="font-serif font-bold text-3xl text-stone-900 mt-1">Tarifs & Prestations</h2>
                            <div className="w-10 h-[1px] bg-stone-300 mx-auto mt-4"></div>
                        </div>

                        <div className="space-y-10 relative z-10">
                            {PRICING.map((cat, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#D4A373]"></span>
                                        {cat.category}
                                    </h3>
                                    <div className="space-y-5">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="group">
                                                <div className="flex items-baseline justify-between">
                                                    <span className="font-serif text-lg text-stone-800 bg-white/0 relative z-10 pr-2">
                                                        {item.name}
                                                    </span>
                                                    <div className="flex-1 border-b border-dotted border-stone-300 mx-2 mb-1 opacity-50"></div>
                                                    <span className="font-serif font-bold text-lg text-stone-900 pl-2">
                                                        {item.price}<span className="text-xs align-top ml-0.5">€</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-stone-500 font-light italic mt-1">{item.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-6 border-t border-stone-200 text-center">
                            <p className="font-cursive text-2xl text-stone-800">Conditions</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-2 leading-relaxed">
                                Acompte de 30% requis • Annulation 48h à l'avance <br/>
                                Retard &gt; 10min entraîne l'annulation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};