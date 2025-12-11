
import React, { useState, useEffect } from 'react';
import { getData, addGiftCard, deleteGiftCard, toggleGiftCardRedeemed } from '../../services/storage';
import { GiftCard } from '../../types';
import { Gift, Mail, Copy, CheckCircle, Trash2, X, Sparkles, ExternalLink, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';

export const AdminGiftCards: React.FC = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [amount, setAmount] = useState<number>(50);
  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [currentCard, setCurrentCard] = useState<GiftCard | null>(null);
  
  // États pour la génération d'image
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setGiftCards(getData().giftCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'SN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newCard: GiftCard = { id: Date.now().toString(), code, amount, from: fromName, to: toName, recipientEmail: toEmail, message, isRedeemed: false, createdAt: new Date().toISOString() };
    addGiftCard(newCard); 
    setGiftCards(getData().giftCards); 
    setCurrentCard(newCard); 
    
    // Reset image states
    setGeneratedImageUrl(null);
    setCopyStatus('idle');
    setStep('preview');
  };

  const handleCreateImage = async () => {
    setIsGenerating(true);
    setCopyStatus('idle');

    const element = document.getElementById('gift-card-capture');
    
    if(!element) {
        alert("Erreur : Élément visuel introuvable.");
        setIsGenerating(false);
        return;
    }

    // @ts-ignore
    if (typeof window.html2canvas === 'undefined') {
        alert("Erreur : Librairie graphique non chargée. Vérifiez votre connexion.");
        setIsGenerating(false);
        return;
    }

    try {
        // Capture du DOM en Canvas
        // @ts-ignore
        const canvas = await window.html2canvas(element, {
            scale: 2, 
            backgroundColor: null,
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        // 1. Convertir en URL pour affichage (<img>)
        const dataUrl = canvas.toDataURL("image/png");
        setGeneratedImageUrl(dataUrl);

        // 2. Tenter la copie dans le presse-papier (Blob)
        canvas.toBlob(async (blob: Blob | null) => {
            if (blob && navigator.clipboard && navigator.clipboard.write) {
                try {
                    const item = new ClipboardItem({ "image/png": blob });
                    await navigator.clipboard.write([item]);
                    setCopyStatus('success');
                } catch (err) {
                    console.warn("Copie auto bloquée (contexte non sécurisé ?)", err);
                    setCopyStatus('error');
                }
            } else {
                setCopyStatus('error');
            }
            setIsGenerating(false);
        });

    } catch (err) {
        console.error("Erreur Capture:", err);
        alert("Erreur lors de la génération de l'image. Assurez-vous que l'image de fond est chargée.");
        setIsGenerating(false);
    }
  };

  const openGmail = () => {
     if (!currentCard) return;
     const subject = `Carte Cadeau Shelley Nails de la part de ${currentCard.from}`;
     
     // Corps du mail
     // NOTE : Les sauts de ligne sont importants pour que le lien soit détecté.
     const body = `Salut,

${currentCard.from} t'offre cette carte cadeau 🎁 !

Prends vite contact avec moi pour réserver ta prestation 🌟 :
https://ig.me/m/shelleynailss

`;

     // On encode proprement les paramètres
     const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(currentCard.recipientEmail || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
     window.open(gmailUrl, '_blank');
  };

  const handleDelete = (id: string) => { if(window.confirm("Supprimer ?")) { deleteGiftCard(id); setGiftCards(getData().giftCards); } };
  
  const handleToggleRedeemed = (id: string) => { 
      const card = giftCards.find(c => c.id === id);
      // Si déjà utilisée, on ne fait rien (sécurité supplémentaire au clic)
      if (card?.isRedeemed) return;

      toggleGiftCardRedeemed(id); 
      setGiftCards(getData().giftCards); 
      
      alert("Carte marquée comme utilisée.\nUne ligne 'Carte Cadeaux' a été ajoutée automatiquement en comptabilité.");
  };

  const resetForm = () => {
    setStep('form');
    setGeneratedImageUrl(null);
    setCurrentCard(null);
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
            <h1 
                className="text-5xl font-gothic tracking-widest transform scale-y-110"
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
                    <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 border border-[#D4A373]">Générer le visuel</button>
                </form>
            </div>
        )}

        {step === 'preview' && currentCard && (
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-right relative flex flex-col items-center">
                <button onClick={resetForm} className="absolute top-4 right-4 p-2 hover:bg-white rounded-full text-stone-400 z-20"><X size={20} /></button>
                
                {/* --- ZONE D'AFFICHAGE (Image générée OU HTML source) --- */}
                <div className="relative w-full flex justify-center my-4 overflow-auto">
                    {generatedImageUrl ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                             {/* L'image générée est affichée ici */}
                            <img src={generatedImageUrl} alt="Carte Cadeau" className="w-full max-w-sm rounded-xl shadow-2xl border border-[#D4A373]/50" />
                            
                            {/* Feedback Copie */}
                            {copyStatus === 'success' && (
                                <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
                                    <CheckCircle size={16} /> Image copiée ! Prête à coller.
                                </div>
                            )}
                            {copyStatus === 'error' && (
                                <div className="mt-4 flex flex-col items-center gap-1 text-stone-600 bg-stone-100 px-4 py-3 rounded-lg text-xs font-medium text-center border border-stone-200">
                                    <span className="font-bold text-red-500">Copie automatique bloquée par le navigateur.</span>
                                    <span>👉 Faites <b>Clic Droit</b> sur l'image ci-dessus, puis <b>"Copier l'image"</b>.</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* SOURCE HTML (Utilisé pour la capture, masqué après génération) 
                           DESIGN MIS A JOUR: THEME CLAIR / BEIGE POUDRE
                        */
                        <div 
                            id="gift-card-capture" 
                            className="w-full aspect-[1.6] relative flex flex-col items-center justify-center p-8 rounded-xl overflow-hidden shadow-2xl select-none border border-[#D4A373]/50"
                            style={{ 
                                minWidth: '800px', // Largeur augmentée pour haute définition
                            }} 
                        >
                            {/* Background Image NAIL ART */}
                            <div className="absolute inset-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80" 
                                    alt="Nail Art Background" 
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous" 
                                />
                                {/* Overlay / Voilage Beige Poudré Lumineux */}
                                <div className="absolute inset-0 bg-[#F5E6D3]/60 backdrop-blur-[4px]"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#D6CFC7]/80 via-transparent to-[#F5E6D3]/50"></div>
                            </div>
                            
                            {/* Content container - adjusted for dark text on light background */}
                            <div className="relative z-10 w-full h-full border-2 border-[#A8A29E]/60 rounded-xl p-8 flex flex-col items-center justify-between bg-white/20 backdrop-blur-sm shadow-2xl">
                                
                                {/* Header */}
                                <div className="text-center w-full">
                                    <div className="flex items-center justify-center gap-3 text-[#D4A373] mb-2">
                                        <Sparkles size={24} fill="#D4A373" />
                                        <span className="text-xl font-bold uppercase tracking-[0.4em] text-stone-600 drop-shadow-sm">Carte Cadeau</span>
                                        <Sparkles size={24} fill="#D4A373" />
                                    </div>
                                    <h3 className="font-gothic text-6xl text-stone-800 tracking-widest drop-shadow-sm mt-2 transform scale-y-110" style={{ WebkitTextStroke: '0.5px #A8A29E' }}>
                                        Shelley Nails
                                    </h3>
                                </div>
                                
                                {/* Amount */}
                                <div className="flex flex-col items-center justify-center py-4 border-y border-[#D4A373]/40 w-full my-4">
                                    <span className="font-serif text-8xl font-bold text-stone-900 drop-shadow-sm">{currentCard.amount} €</span>
                                    <span className="text-sm uppercase tracking-widest text-stone-600 mt-2 font-bold">Bon à valoir sur toutes prestations</span>
                                </div>

                                {/* Code & Info */}
                                <div className="w-full text-center space-y-6">
                                    <div className="inline-block bg-[#F5F5F4]/70 px-10 py-3 rounded-full border border-[#D4A373] shadow-lg backdrop-blur-md">
                                        <p className="font-mono text-3xl tracking-[0.25em] text-stone-800 font-bold">{currentCard.code}</p>
                                    </div>
                                    
                                    <div className="text-xl text-stone-700 mt-2 font-medium">
                                        De la part de <span className="font-bold text-stone-900 text-2xl ml-2">{currentCard.from}</span>
                                    </div>

                                    {currentCard.message && (
                                        <div className="px-8 mt-2">
                                            <p className="font-serif italic text-2xl text-stone-800 leading-snug drop-shadow-sm">
                                                "{currentCard.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- ACTIONS --- */}
                <div className="flex flex-col gap-3 w-full mt-2">
                    {!generatedImageUrl ? (
                        <button 
                            onClick={handleCreateImage} 
                            disabled={isGenerating}
                            className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl hover:scale-[1.02] shadow-lg border border-[#D4A373] flex items-center justify-center gap-2 transition-all"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <ImageIcon size={18}/>}
                            {isGenerating ? "Création de l'image..." : "1. Créer l'image de la carte"}
                        </button>
                    ) : (
                        <>
                            {/* Bouton pour réessayer la copie si besoin */}
                            {copyStatus !== 'success' && (
                                <button 
                                    onClick={() => {
                                        // On réessaie juste de copier l'image
                                        handleCreateImage();
                                    }}
                                    className="text-xs text-stone-500 underline hover:text-stone-800"
                                >
                                    Réessayer la copie automatique
                                </button>
                            )}

                            {/* Bouton Gmail séparé */}
                            <button 
                                onClick={openGmail}
                                className="w-full py-4 bg-[#D4A373] text-stone-900 font-bold rounded-xl hover:bg-white hover:text-[#D4A373] shadow-lg border border-[#D4A373] flex items-center justify-center gap-2 transition-all animate-in slide-in-from-bottom-2"
                            >
                                <Mail size={18} /> 2. Ouvrir Gmail & Coller
                            </button>
                            
                            <div className="flex items-start gap-2 text-[10px] text-stone-500 bg-stone-100 p-3 rounded-lg border border-stone-200">
                                <Info size={14} className="shrink-0 mt-0.5 text-stone-400" />
                                <div>
                                    <p className="mb-1"><strong>Astuce :</strong> Le lien Instagram dans le mail ne sera cliquable qu'une fois le message envoyé.</p>
                                    <p>N'oubliez pas de faire <strong>Ctrl + V</strong> dans Gmail pour insérer l'image de la carte.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
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
                                {card.isRedeemed ? (
                                    <button 
                                        disabled 
                                        className="p-2 rounded text-green-600 bg-green-50/50 cursor-not-allowed opacity-70"
                                        title="Déjà utilisée"
                                    >
                                        <CheckCircle size={16}/>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleToggleRedeemed(card.id)} 
                                        className="p-2 rounded text-stone-400 hover:text-green-500 hover:bg-white/50 transition-colors"
                                        title="Marquer comme utilisée"
                                    >
                                        <CheckCircle size={16}/>
                                    </button>
                                )}
                                <button onClick={() => handleDelete(card.id)} className="p-2 rounded text-stone-400 hover:text-red-500 hover:bg-white/50 transition-colors"><Trash2 size={16}/></button>
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
