
import React, { useState } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { submitCollabRequest } from '../../services/storage';
import { PublicLayout, BackButton, SuccessMessage } from '../../components/PublicLayout';

export const Collaboration: React.FC = () => {
    const [collabForm, setCollabForm] = useState({ type: 'Marque', name: '', email: '', message: '' });
    const [collabStatus, setCollabStatus] = useState<'idle' | 'success'>('idle');

    const handleCollabSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCollabRequest({
            id: Date.now().toString(),
            type: collabForm.type as any,
            contactName: collabForm.name,
            email: collabForm.email,
            message: collabForm.message,
            submittedAt: new Date().toISOString()
        });
        setCollabStatus('success');
    };

    return (
        <PublicLayout>
            <div className="animate-in slide-in-from-right duration-500 max-w-2xl mx-auto w-full">
                <BackButton label="Retour" />

                {collabStatus === 'success' ? (
                        <SuccessMessage 
                        title="Proposition Envoyée" 
                        text="Je vous remercie pour cette opportunité. Je l'étudierai avec attention." 
                        />
                    ) : (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white overflow-hidden p-8">
                        <div className="mb-8 text-center">
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-800">
                                <Sparkles size={20} strokeWidth={1} />
                            </div>
                            <h2 className="font-serif font-bold text-3xl text-stone-900">Collab & Partenariat</h2>
                            <p className="font-cursive text-4xl text-[#D4A373] mt-2">Créons ensemble</p>
                        </div>

                        <form onSubmit={handleCollabSubmit} className="space-y-6">
                            
                            <div className="flex bg-stone-100/50 p-1.5 rounded-2xl">
                                {['Marque', 'Evénement', 'Projet'].map(type => (
                                    <button 
                                        key={type}
                                        type="button"
                                        onClick={() => setCollabForm({...collabForm, type: type as any})}
                                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide rounded-xl transition-all ${collabForm.type === type ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <input required type="text" className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all font-serif placeholder-stone-400" 
                                        placeholder="Nom du Contact / Marque"
                                        value={collabForm.name} onChange={e => setCollabForm({...collabForm, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <input required type="email" className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all font-serif placeholder-stone-400" 
                                        placeholder="Email Professionnel"
                                        value={collabForm.email} onChange={e => setCollabForm({...collabForm, email: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <textarea required rows={5} className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all text-sm font-light leading-relaxed placeholder-stone-400" 
                                        placeholder="Détails de la collaboration..."
                                        value={collabForm.message} onChange={e => setCollabForm({...collabForm, message: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-white border border-stone-200 text-stone-900 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center justify-center gap-2">
                                Soumettre <Briefcase size={14} />
                            </button>
                        </form>
                    </div>
                    )}
            </div>
        </PublicLayout>
    );
};
