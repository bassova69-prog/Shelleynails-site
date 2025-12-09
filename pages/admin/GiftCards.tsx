
import React, { useState, useEffect, useRef } from 'react';
import { getData, addGiftCard, deleteGiftCard, toggleGiftCardRedeemed } from '../../services/storage';
import { GiftCard } from '../../types';
import { Gift, Mail, Copy, Check, ExternalLink, ArrowRight, X, Trash2, CheckCircle } from 'lucide-react';

export const AdminGiftCards: React.FC = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [amount, setAmount] = useState<number>(50);
  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [currentCard, setCurrentCard] = useState<GiftCard | null>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGiftCards(getData().giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'SN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newCard: GiftCard = { id: Date.now().toString(), code, amount, from: fromName, to: toName, recipientEmail: toEmail, message, isRedeemed: false, createdAt: new Date().toISOString() };
    addGiftCard(newCard); setGiftCards(getData().giftCards); setCurrentCard(newCard); setStep('preview');
  };

  const copyEmailContent = async () => { alert("E-mail copié !"); };
  const handleDelete = (id: string) => { if(window.confirm("Supprimer ?")) { deleteGiftCard(id); setGiftCards(getData().giftCards); } };
  const handleToggleRedeemed = (id: string) => { toggleGiftCardRedeemed(id); setGiftCards(getData().giftCards); };

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
                Cartes Cadeaux
            </h1>
            <p className="text-stone-600 mt-1 font-medium">Génération de cartes pour envoi par e-mail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {step === 'form' && (
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg shadow-stone-200/50 border border-white/40 animate-in fade-in">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 font-serif">
                    <Gift className="text-[#D4A373] fill-[#D4A373]" /> Nouvelle Carte
                </h2>
                <form onSubmit={handleGenerate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant (€)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[30, 50, 80, 100].map(val => (
                                <button key={val} type="button" onClick={() => setAmount(val)} className={`py-2 rounded-xl font-bold border transition-all text-sm ${amount === val ? 'bg-stone-900 text-white border-stone-900' : 'bg-white/50 text-stone-500 border-[#D4A373]/50'}`}>{val}€</button>
                            ))}
                        </div>
                        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-2 w-full p-3 rounded-xl border border-[#D4A373]/50 bg-white/60 focus:ring-2 focus:ring-stone-900 outline-none font-bold"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="text" value={toName} onChange={e => setToName(e.target.value)} className="w-full p-3 rounded-xl bg-white/60 border border-[#D4A373]/50" placeholder="Pour (Nom)" />
                        <input required type="text" value={fromName} onChange={e => setFromName(e.target.value)} className="w-full p-3 rounded-xl bg-white/60 border border-[#D4A373]/50" placeholder="De la part de" />
                    </div>
                    <input required type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="Email destinataire" className="w-full p-3 rounded-xl bg-white/60 border border-[#D4A373]/50" />
                    <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 rounded-xl bg-white/60 border border-[#D4A373]/50" placeholder="Message..." />
                    <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 border border-[#D4A373]">Prévisualiser</button>
                </form>
            </div>
        )}

        {step === 'preview' && currentCard && (
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-right relative">
                <button onClick={() => setStep('form')} className="absolute top-4 right-4 p-2 hover:bg-white rounded-full text-stone-400"><X size={20} /></button>
                <div ref={emailRef} className="border border-gray-200 rounded-lg p-0 bg-white mx-auto overflow-hidden font-sans text-left" style={{ maxWidth: '400px' }}>
                    <div style={{ backgroundColor: '#1c1917', padding: '20px', textAlign: 'center', color: 'white' }}>Shelleynailss</div>
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                         <h1 style={{ fontSize: '24px', color: '#1c1917' }}>Surprise !</h1>
                         <div style={{ fontSize: '42px', color: '#D4A373', fontWeight: 'bold' }}>{amount} €</div>
                         <div style={{ fontSize: '14px', marginTop: '10px' }}>Code: <strong>{currentCard.code}</strong></div>
                    </div>
                </div>
                <button onClick={copyEmailContent} className="mt-6 w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:scale-[1.02] shadow-lg border border-[#D4A373]">Copier l'e-mail</button>
            </div>
        )}
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#D4A373]/30"><h3 className="font-bold text-stone-900 font-serif">Historique</h3></div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-white/40 text-xs font-bold text-[#D4A373] uppercase"><tr className="border-b border-[#D4A373]/20"><th className="p-4">Date</th><th className="p-4">Code</th><th className="p-4">Montant</th><th className="p-4">Statut</th><th className="p-4 text-center">Action</th></tr></thead>
                <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                    {giftCards.map(card => (
                        <tr key={card.id} className="hover:bg-white/30">
                            <td className="p-4 text-stone-500">{new Date(card.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-mono font-bold text-stone-900">{card.code}</td>
                            <td className="p-4 font-bold">{card.amount} €</td>
                            <td className="p-4">{card.isRedeemed ? 'Utilisée' : 'Valide'}</td>
                            <td className="p-4 text-center flex justify-center gap-2">
                                <button onClick={() => handleToggleRedeemed(card.id)} className="p-2 rounded text-stone-400 hover:text-green-500"><CheckCircle size={16}/></button>
                                <button onClick={() => handleDelete(card.id)} className="p-2 rounded text-stone-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
