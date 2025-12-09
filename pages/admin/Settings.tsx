
import React, { useState } from 'react';
import { getAdminPin, setAdminPin } from '../../services/storage';
import { Lock, Check, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = getAdminPin();

    if (currentPin !== storedPin) { setStatus('error'); setMessage("Ancien code incorrect."); return; }
    if (newPin.length !== 6 || isNaN(Number(newPin))) { setStatus('error'); setMessage("Le code doit faire 6 chiffres."); return; }
    if (newPin !== confirmPin) { setStatus('error'); setMessage("Les codes ne correspondent pas."); return; }

    setAdminPin(newPin); setStatus('success'); setMessage("Code mis à jour !");
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
        <div>
            <h1 
                className="text-5xl font-knife tracking-wide"
                style={{
                    background: 'linear-gradient(to bottom, #F5F5F4 0%, #A8A29E 45%, #57534E 50%, #A8A29E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))',
                    WebkitTextStroke: '1px #44403C',
                }}
            >
                Réglages
            </h1>
            <p className="text-stone-600 mt-1 font-medium">Sécurité et préférences.</p>
        </div>

        <div className="max-w-xl">
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-stone-900 text-[#D4A373] rounded-2xl shadow-lg border border-[#D4A373]/30">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 font-serif">Code d'accès Admin</h2>
                        <p className="text-xs text-stone-500">Modifiable uniquement par Shelley & Valerie</p>
                    </div>
                </div>

                <form onSubmit={handleChangePin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Code Actuel</label>
                        <input type="password" value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} maxLength={6} placeholder="••••••" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-stone-900 outline-none text-center tracking-[0.5em] font-serif text-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nouveau Code</label>
                            <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} maxLength={6} placeholder="••••••" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-stone-900 outline-none text-center tracking-[0.5em] font-serif text-lg" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Confirmer</label>
                            <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} maxLength={6} placeholder="••••••" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-stone-900 outline-none text-center tracking-[0.5em] font-serif text-lg" />
                        </div>
                    </div>
                    {status === 'error' && <div className="bg-red-50/50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-pulse border border-red-100/50"><ShieldAlert size={18} />{message}</div>}
                    {status === 'success' && <div className="bg-green-50/50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-green-100/50"><Check size={18} />{message}</div>}

                    <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-lg border border-[#D4A373] flex items-center justify-center gap-2">Mettre à jour</button>
                </form>
            </div>
        </div>
    </div>
  );
};
