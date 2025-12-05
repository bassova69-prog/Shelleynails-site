import React, { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { submitCoachingRequest } from '../../services/storage';
import { PublicLayout, BackButton, SuccessMessage } from '../../components/PublicLayout';

const COACHING_DATES = [
    { id: 'c1', label: 'Octobre • Nails Basic', date: '2023-10-15' },
    { id: 'c2', label: 'Novembre • Nail Art Expert', date: '2023-11-20' },
    { id: 'c3', label: 'Décembre • Business', date: '2023-12-05' }
];

export const Coaching: React.FC = () => {
    const [coachingForm, setCoachingForm] = useState({ name: '', insta: '', date: '', project: '' });
    const [coachingStatus, setCoachingStatus] = useState<'idle' | 'success'>('idle');

    const handleCoachingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCoachingRequest({
            id: Date.now().toString(),
            applicantName: coachingForm.name,
            instagram: coachingForm.insta,
            selectedDate: coachingForm.date,
            projectDescription: coachingForm.project,
            status: 'En attente',
            submittedAt: new Date().toISOString()
        });
        setCoachingStatus('success');
    };

    return (
        <PublicLayout>
            <div className="animate-in slide-in-from-right duration-500 max-w-2xl mx-auto w-full">
                <BackButton label="Retour" />

                {coachingStatus === 'success' ? (
                    <SuccessMessage 
                    title="Candidature Reçue" 
                    text="Merci de votre intérêt pour la Masterclass. Je reviens vers vous personnellement pour valider votre place." 
                    />
                ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden relative">
                    
                    {/* Header Image Artistique */}
                    <div className="relative h-48 bg-stone-900 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                        <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-[#D4A373] rounded-full blur-[80px] opacity-60"></div>
                        
                        <div className="absolute inset-0 flex flex-col justify-center px-8 z-10">
                             <div className="inline-flex items-center gap-2 mb-2">
                                <Star size={14} className="text-[#FAEDCD] fill-[#FAEDCD]" />
                                <span className="text-[#FAEDCD] text-[10px] font-bold uppercase tracking-[0.3em]">Masterclass</span>
                             </div>
                            <h2 className="text-white font-serif font-bold text-4xl italic">Mentorat</h2>
                            <p className="text-stone-300 text-sm font-light mt-2 max-w-[200px]">Passez au niveau supérieur de votre art.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleCoachingSubmit} className="p-8 space-y-6">
                        
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 ml-2">Session souhaitée</label>
                            <div className="space-y-3">
                                {COACHING_DATES.map(date => (
                                    <label key={date.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all group ${coachingForm.date === date.date ? 'border-[#D4A373] bg-[#fffbf2]' : 'border-stone-100 bg-white hover:border-stone-300'}`}>
                                        <span className="text-sm font-serif font-bold text-stone-800">{date.label}</span>
                                        <div className={`w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center transition-colors ${coachingForm.date === date.date ? 'bg-[#D4A373] border-[#D4A373]' : ''}`}>
                                            {coachingForm.date === date.date && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="date" 
                                            value={date.date}
                                            className="hidden"
                                            onChange={(e) => setCoachingForm({...coachingForm, date: e.target.value})}
                                            required
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-2">Nom</label>
                                <input required type="text" className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all font-serif" 
                                    value={coachingForm.name} onChange={e => setCoachingForm({...coachingForm, name: e.target.value})}
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-2">Instagram</label>
                                <input required type="text" className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all font-serif" placeholder="@"
                                    value={coachingForm.insta} onChange={e => setCoachingForm({...coachingForm, insta: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-2">Votre Projet</label>
                            <textarea required rows={4} className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 focus:bg-white focus:border-stone-300 focus:ring-0 outline-none transition-all text-sm font-light leading-relaxed" placeholder="Dites-moi tout..."
                                value={coachingForm.project} onChange={e => setCoachingForm({...coachingForm, project: e.target.value})}
                            />
                        </div>

                        <button type="submit" className="w-full py-5 bg-stone-900 text-[#FAEDCD] font-bold uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] hover:shadow-xl transition-all flex items-center justify-center gap-2">
                            Envoyer la demande <Send size={14} />
                        </button>
                    </form>
                </div>
                )}
            </div>
        </PublicLayout>
    );
};