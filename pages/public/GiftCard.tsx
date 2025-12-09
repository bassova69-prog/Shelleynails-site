
import React, { useState } from 'react';
import { addGiftCard } from '../../services/storage';
import { GiftCard as GiftCardType } from '../../types';
import { Gift, CheckCircle, Copy, Sparkles, CreditCard } from 'lucide-react';
import { PublicLayout, BackButton } from '../../components/PublicLayout';

export const GiftCardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(50);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [generatedCard, setGeneratedCard] = useState<GiftCardType | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation de validation du code de paiement
    if (paymentCode.length < 3) {
        alert("Veuillez entrer un code valide.");
        return;
    }

    const code = 'SN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newCard: GiftCardType = {
      id: Date.now().toString(),
      code: code,
      amount,
      from,
      to,
      message,
      isRedeemed: false,
      createdAt: new Date().toISOString()
    };
    addGiftCard(newCard);
    setGeneratedCard(newCard);
    setStep(2);
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto w-full">
        <BackButton label="Retour" />

        <div className="flex-1 flex items-center justify-center">
            <div className="w-full bg-white rounded-[2rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-stone-100">
            
            {/* Header */}
            <div className="bg-stone-900 p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm text-[#D4A373]">
                        <Gift size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Carte Cadeau</h1>
                    <p className="text-stone-300 text-sm tracking-wide">Shelleynailss • L'art de sublimer</p>
                </div>
            </div>

            <div className="p-8">
                {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Choisissez un montant</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[30, 50, 80, 100, 150].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-3 rounded-xl font-bold transition-all border ${
                            amount === val
                                ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-900'
                            }`}
                        >
                            {val} €
                        </button>
                        ))}
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="Autre"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full h-full text-center rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none font-bold text-stone-900" 
                            />
                        </div>
                    </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">De la part de</label>
                        <input required type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-100 focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={from} onChange={e => setFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Pour</label>
                        <input required type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-100 focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={to} onChange={e => setTo(e.target.value)} />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Petit mot doux</label>
                    <textarea 
                        className="w-full p-4 rounded-xl bg-stone-50 border border-stone-100 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                        rows={3}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Écrivez votre message ici..."
                    />
                    </div>

                    {/* SECTION PAIEMENT CARTE CADEAU */}
                    <div className="pt-4 border-t border-stone-100">
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Paiement</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                className="w-full p-4 pl-12 rounded-xl bg-stone-50 border border-stone-100 focus:ring-2 focus:ring-stone-900 outline-none transition-all uppercase font-mono placeholder-stone-400 text-stone-900"
                                placeholder="Code Carte Cadeau"
                                value={paymentCode}
                                onChange={e => setPaymentCode(e.target.value)}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                                <CreditCard size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-2 ml-1 italic">
                            Entrez un code valide pour régler cette commande.
                        </p>
                    </div>

                    <button type="submit" className="w-full py-4 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg border border-[#D4A373] mt-2 flex items-center justify-center gap-2">
                       <Sparkles size={18} /> Valider avec le code
                    </button>
                </form>
                ) : (
                <div className="text-center space-y-6">
                    <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full mb-2">
                    <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 font-serif">Paiement validé !</h2>
                    
                    {/* Virtual Card Preview */}
                    <div className="bg-gradient-to-br from-[#1c1917] to-[#44403c] rounded-2xl p-8 text-white text-left shadow-2xl relative overflow-hidden group mx-auto max-w-sm">
                        {/* Golden Circle Decor */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4A373] rounded-full opacity-20 blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D4A373] rounded-full opacity-10 blur-xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold tracking-[0.2em] text-[#D4A373]">GIFT CARD</span>
                                <Sparkles size={20} className="text-[#D4A373]" />
                            </div>
                            
                            <div className="text-center py-4">
                                <h3 className="text-4xl font-serif font-bold text-white">{generatedCard?.amount} €</h3>
                                <p className="text-[10px] text-stone-400 mt-2 tracking-wide">Prendre RDV : shelleynailss@gmail.com</p>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
                                <div>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Code</p>
                                    <p className="font-mono text-lg tracking-widest text-[#FAEDCD]">{generatedCard?.code}</p>
                                </div>
                                <p className="font-serif italic text-sm">Shelleynailss</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-stone-500 text-sm px-4">
                        Envoyez ce code à <strong>{generatedCard?.to}</strong>.
                        <br/>
                        Elle devra simplement le présenter lors de sa prise de rendez-vous.
                    </p>

                    <div className="flex items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200 gap-4">
                        <span className="font-mono font-bold text-xl text-stone-900 tracking-widest">
                            {generatedCard?.code}
                        </span>
                        <button 
                            onClick={() => {
                                if (generatedCard?.code) {
                                    navigator.clipboard.writeText(generatedCard.code);
                                    alert('Code copié !');
                                }
                            }}
                            className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg transition-colors"
                            title="Copier le code"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    
                    <button onClick={() => setStep(1)} className="text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-stone-900 transition-colors">
                        Créer une autre carte
                    </button>
                </div>
                )}
            </div>
            </div>
        </div>
      </div>
    </PublicLayout>
  );
};
