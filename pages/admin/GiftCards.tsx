
import React, { useState, useEffect, useRef } from 'react';
import { getData, addGiftCard, deleteGiftCard, toggleGiftCardRedeemed } from '../../services/storage';
import { GiftCard } from '../../types';
import { Gift, Mail, Copy, Check, ExternalLink, ArrowRight, X, Trash2, CheckCircle } from 'lucide-react';

export const AdminGiftCards: React.FC = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  
  // Form State
  const [amount, setAmount] = useState<number>(50);
  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');

  // Workflow State
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [currentCard, setCurrentCard] = useState<GiftCard | null>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGiftCards(getData().giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Création de la carte avec unicité du code
    let code = '';
    let isUnique = false;
    const currentData = getData(); // Récupérer les données fraîches pour vérifier

    while (!isUnique) {
        // Construction stricte de l'URL pour éviter les erreurs de génération
        code = 'SN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const exists = currentData.giftCards.some(c => c.code === code);
        if (!exists) {
            isUnique = true;
        }
    }

    const newCard: GiftCard = {
        id: Date.now().toString(),
        code,
        amount,
        from: fromName,
        to: toName,
        recipientEmail: toEmail,
        message,
        isRedeemed: false,
        createdAt: new Date().toISOString()
    };
    
    const data = addGiftCard(newCard);
    setGiftCards(data.giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setCurrentCard(newCard);
    
    // 2. Passer à l'étape preview pour copie
    setStep('preview');
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette carte cadeau ? Cette action est irréversible.")) {
          const data = deleteGiftCard(id);
          setGiftCards(data.giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          // Si on supprime la carte en cours de prévisualisation, on reset
          if (currentCard?.id === id) {
              setStep('form');
              setCurrentCard(null);
          }
      }
  };

  const handleToggleRedeemed = (id: string) => {
      const data = toggleGiftCardRedeemed(id);
      setGiftCards(data.giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const copyEmailContent = async () => {
    if (!emailRef.current) return;

    try {
        // Méthode moderne pour copier du HTML riche
        const html = emailRef.current.outerHTML;
        const blobHtml = new Blob([html], { type: "text/html" });
        const blobText = new Blob([emailRef.current.innerText], { type: "text/plain" });
        const data = [new ClipboardItem({
            ["text/html"]: blobHtml,
            ["text/plain"]: blobText
        })];
        await navigator.clipboard.write(data);
        alert("E-mail copié ! Vous pouvez maintenant le coller dans Gmail (Ctrl+V ou Clic droit > Coller).");
        openGmail();
    } catch (err) {
        console.error('Erreur copie riche, fallback...', err);
        // Fallback sélection manuelle
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(emailRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
        alert("E-mail copié ! Collez-le dans Gmail.");
        openGmail();
    }
  };

  const openGmail = () => {
      const subject = encodeURIComponent(`🎁 ${fromName} vous a envoyé une carte cadeau Shelleynailss`);
      // On ouvre Gmail vide, prêt à recevoir le collage
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${subject}&bcc=bassova69@gmail.com`;
      window.open(gmailUrl, '_blank');
      resetForm();
  };

  const resetForm = () => {
    setStep('form');
    setAmount(50);
    setToName('');
    setToEmail('');
    setFromName('');
    setMessage('');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copié !');
  };

  // URL du site pour les liens (Construction stricte - Protocole + Host + Pathname)
  // Utilise window.location.href split sur '#' pour s'assurer qu'on garde le bon domaine même sur IDX/Cloud
  const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const cardUrl = `${baseUrl}#/view-card`;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Cartes Cadeaux</h1>
            <p className="text-stone-500 mt-1">Génération de cartes pour envoi par e-mail.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* STEP 1: FORMULAIRE */}
        {step === 'form' && (
            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-stone-200/50 border border-[#D4A373] animate-in fade-in">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 font-serif">
                    <Gift className="text-[#D4A373] fill-[#D4A373]" /> Nouvelle Carte
                </h2>
                
                <form onSubmit={handleGenerate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant (€)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[30, 50, 80, 100].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAmount(val)}
                                    className={`py-2 rounded-xl font-bold border transition-all text-sm ${amount === val ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-[#D4A373] hover:border-stone-400'}`}
                                >
                                    {val}€
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 relative">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                className="w-full p-3 rounded-xl border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none font-bold"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4A373]">€</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Pour (Nom)</label>
                            <input required type="text" value={toName} onChange={e => setToName(e.target.value)} className="w-full p-3 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none" placeholder="Julie" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">De la part de</label>
                            <input required type="text" value={fromName} onChange={e => setFromName(e.target.value)} className="w-full p-3 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none" placeholder="Sophie" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Email destinataire</label>
                        <input required type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="cliente@email.com" className="w-full p-3 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Message personnel</label>
                        <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none" placeholder="Joyeux anniversaire..." />
                    </div>

                    <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group border border-[#D4A373]">
                        <ArrowRight size={18} />
                        Prévisualiser l'email
                    </button>
                </form>
            </div>
        )}

        {/* STEP 2: PREVIEW AMAZON STYLE */}
        {step === 'preview' && currentCard && (
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-[#D4A373] animate-in slide-in-from-right relative">
                <button onClick={() => setStep('form')} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full text-stone-400">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2 font-serif">
                    <Mail className="text-[#D4A373]" /> Aperçu de l'email
                </h2>
                
                <p className="text-sm text-stone-500 mb-4">
                    Voici l'email que vous allez envoyer. Cliquez sur "Copier" puis collez-le dans Gmail.
                </p>

                {/* --- TEMPLATE EMAIL (Ce qui sera copié) --- */}
                <div 
                    ref={emailRef} 
                    className="border border-gray-200 rounded-lg p-0 bg-white mx-auto overflow-hidden font-sans text-left"
                    style={{ maxWidth: '400px', fontFamily: 'Arial, sans-serif' }}
                >
                    {/* Header Noir */}
                    <div style={{ backgroundColor: '#1c1917', padding: '20px', textAlign: 'center' }}>
                         <span style={{ color: 'white', fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Shelleynailss</span>
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                        <h1 style={{ color: '#1c1917', fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'normal' }}>
                            Une surprise pour vous !
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', margin: '0 0 25px 0' }}>
                            {fromName} vous envoie une carte cadeau pour un moment de beauté d'exception.
                        </p>

                        {/* Image / Visuel Carte */}
                        <div style={{ 
                            border: '1px solid #e7e7e7', 
                            borderRadius: '8px', 
                            padding: '20px', 
                            backgroundColor: '#fafafa',
                            marginBottom: '25px'
                        }}>
                             <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Montant</div>
                             <div style={{ fontSize: '42px', color: '#D4A373', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>{amount} €</div>
                             <div style={{ fontSize: '14px', color: '#333', marginTop: '10px' }}>Code: <strong>{currentCard.code}</strong></div>
                        </div>

                        {message && (
                            <div style={{ fontStyle: 'italic', color: '#555', marginBottom: '25px', padding: '0 15px' }}>
                                "{message}"
                            </div>
                        )}

                        <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
                            Prendre rendez-vous avec : <a href="mailto:bassova69@gmail.com" style={{ color: '#D4A373', textDecoration: 'none', fontWeight: 'bold' }}>bassova69@gmail.com</a>
                        </p>
                    </div>
                </div>
                {/* --- FIN TEMPLATE --- */}

                <div className="mt-6 flex flex-col gap-3">
                    <button 
                        onClick={copyEmailContent}
                        className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 border border-[#D4A373]"
                    >
                        <Copy size={18} />
                        1. Copier l'e-mail
                    </button>
                    <p className="text-center text-xs text-stone-400">Puis collez (Ctrl+V) dans la fenêtre Gmail qui s'ouvrira.</p>
                </div>
            </div>
        )}

        {/* Info Box */}
        <div className="flex flex-col justify-center gap-6">
            <div className="bg-[#FAF9F7] p-8 rounded-3xl border border-[#D4A373] text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4A373] shadow-sm">
                    <ExternalLink size={32} className="text-[#D4A373]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">Confirmation Simple</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    L'e-mail contient toutes les informations nécessaires :<br/>
                    Montant, Code et Email de contact.<br/>
                    Simple, efficace et élégant.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D4A373] bg-white px-4 py-2 rounded-full border border-[#D4A373]">
                    <Check size={14} /> Style Professionnel
                </div>
            </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-3xl border border-[#D4A373] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#D4A373]">
            <h3 className="font-bold text-stone-900 font-serif">Historique des Cartes Émises</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373] text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                        <th className="p-4">Date</th>
                        <th className="p-4">Code</th>
                        <th className="p-4">Montant</th>
                        <th className="p-4">Destinataire</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                    {giftCards.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-stone-400 italic">Aucune carte générée.</td>
                        </tr>
                    ) : (
                        giftCards.map(card => (
                            <tr key={card.id} className="hover:bg-[#FAEDCD]/20 transition-colors">
                                <td className="p-4 text-stone-500">{new Date(card.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-mono font-bold text-stone-900">{card.code}</td>
                                <td className="p-4 font-bold">{card.amount} €</td>
                                <td className="p-4 text-stone-700">{card.to}</td>
                                <td className="p-4">
                                    {card.isRedeemed ? (
                                        <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Utilisée</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Valide</span>
                                    )}
                                </td>
                                <td className="p-4 text-center flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleToggleRedeemed(card.id)}
                                        className={`p-2 rounded-lg transition-colors ${card.isRedeemed ? 'text-green-500 hover:text-green-700 hover:bg-green-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'}`}
                                        title={card.isRedeemed ? "Marquer comme Valide" : "Marquer comme Utilisée"}
                                    >
                                        <CheckCircle size={16} className={card.isRedeemed ? "fill-current" : ""} />
                                    </button>
                                    <button 
                                        onClick={() => copyCode(card.code)}
                                        className="p-2 text-stone-400 hover:text-[#D4A373] hover:bg-stone-100 rounded-lg transition-colors"
                                        title="Copier le code"
                                    >
                                        <Copy size={16} className="text-[#D4A373]" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(card.id)}
                                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer la carte"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
