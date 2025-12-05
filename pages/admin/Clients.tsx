
import React, { useState, useEffect } from 'react';
import { getData, addClient, updateClient } from '../../services/storage';
import { Client } from '../../types';
import { generateReminderMessage } from '../../services/geminiService';
import { Search, Plus, Sparkles, MessageCircle, Calendar, Instagram, Check, Gift, ExternalLink, Copy, MoreHorizontal } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientInsta, setNewClientInsta] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // AI Reminder State
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [currentClientForReminder, setCurrentClientForReminder] = useState<Client | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setClients(getData().clients);
  }, []);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName,
      instagram: newClientInsta.startsWith('@') || newClientInsta.startsWith('http') ? newClientInsta : `@${newClientInsta}`,
      notes: newClientNotes,
      totalVisits: 0,
      lastVisit: new Date().toISOString()
    };
    const updatedData = addClient(newClient);
    setClients(updatedData.clients);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewClientName('');
    setNewClientInsta('');
    setNewClientNotes('');
  };

  const handleGenerateReminder = async (client: Client) => {
    if (!client.nextAppointment) return;
    
    setLoadingAi(true);
    setCurrentClientForReminder(client);
    
    // Générer le message
    const msg = await generateReminderMessage(client, client.nextAppointment);
    
    setGeneratedMessage(msg);
    setLoadingAi(false);
  };

  const copyAndOpenInsta = () => {
    if (generatedMessage && currentClientForReminder) {
        // 1. Copier le message
        navigator.clipboard.writeText(generatedMessage);
        
        // 2. Ouvrir Instagram directement dans les DMs
        let handle = currentClientForReminder.instagram;
        
        if (handle.includes('instagram.com/')) {
            const parts = handle.split('instagram.com/');
            if (parts[1]) {
                handle = parts[1].replace(/\/$/, '').split('?')[0];
            }
        } else {
            handle = handle.replace('@', '');
        }

        window.open(`https://ig.me/m/${handle}`, '_blank');
        
        setGeneratedMessage(null);
        setCurrentClientForReminder(null);
    }
  };

  const incrementVisits = (client: Client) => {
      const updated = { ...client, totalVisits: client.totalVisits + 1 };
      updateClient(updated);
      setClients(getData().clients);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.instagram.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Fichier Clientes</h1>
            <p className="text-stone-500 mt-1">Gérez vos contacts, fidélité et relances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 hover:bg-black text-[#D4A373] px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg border border-[#D4A373]"
        >
          <Plus size={18} className="text-[#D4A373]" />
          Nouvelle Cliente
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher une cliente (nom ou insta)..." 
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#D4A373] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLEAU LISTE CLIENTES */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373] text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                        <th className="p-5">Cliente</th>
                        <th className="p-5">Instagram</th>
                        <th className="p-5">Fidélité (10 = Cadeau)</th>
                        <th className="p-5">Dernière Visite</th>
                        <th className="p-5 text-right">Prochain RDV & Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                    {filteredClients.map(client => {
                        const visitsModulo = client.totalVisits % 10;
                        const isRewardAvailable = client.totalVisits > 0 && visitsModulo === 0;
                        const progress = isRewardAvailable ? 10 : visitsModulo;

                        // Gestion Lien Insta
                        const isUrl = client.instagram.startsWith('http');
                        const instaLink = isUrl ? client.instagram : `https://instagram.com/${client.instagram.replace('@', '')}`;
                        let instaLabel = client.instagram;
                        if (isUrl && client.instagram.includes('instagram.com/')) {
                            const parts = client.instagram.split('instagram.com/');
                            if (parts[1]) instaLabel = '@' + parts[1].replace(/\/$/, '').split('?')[0];
                            else instaLabel = 'Voir Profil';
                        }

                        return (
                            <tr key={client.id} className="hover:bg-[#FAEDCD]/20 transition-colors group">
                                {/* Colonne Cliente */}
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-[#FAEDCD] flex items-center justify-center text-[#D4A373] font-serif font-bold border border-[#D4A373]">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-900">{client.name}</div>
                                            {client.notes && (
                                                <div className="text-xs text-stone-400 truncate max-w-[150px]" title={client.notes}>
                                                    {client.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Colonne Insta */}
                                <td className="p-5">
                                    <a 
                                        href={instaLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[#D4A373] hover:text-[#E1306C] transition-colors font-medium bg-white border border-[#D4A373] px-3 py-1.5 rounded-lg"
                                    >
                                        <Instagram size={14} className="text-[#D4A373]" />
                                        {instaLabel}
                                    </a>
                                </td>

                                {/* Colonne Fidélité (Compacte) */}
                                <td className="p-5">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                                                    i < progress 
                                                        ? isRewardAvailable ? 'bg-[#D4A373] animate-pulse border border-[#D4A373]' : 'bg-[#D4A373]' 
                                                        : 'bg-stone-200'
                                                }`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            {isRewardAvailable ? (
                                                <span className="text-[10px] font-bold text-[#D4A373] bg-[#FAEDCD] px-2 py-0.5 rounded flex items-center gap-1 border border-[#D4A373]">
                                                    <Gift size={10} className="fill-[#D4A373]" /> NAIL ART OFFERT
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-stone-400 font-medium">
                                                    {progress}/10 visites
                                                </span>
                                            )}
                                            <button onClick={() => incrementVisits(client)} className="text-[10px] text-[#D4A373] hover:text-stone-900 underline font-bold">
                                                +1
                                            </button>
                                        </div>
                                    </div>
                                </td>

                                {/* Colonne Dernière Visite */}
                                <td className="p-5 text-stone-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-[#D4A373]" />
                                        {new Date(client.lastVisit).toLocaleDateString()}
                                    </div>
                                </td>

                                {/* Colonne Action / Prochain RDV */}
                                <td className="p-5 text-right">
                                    {client.nextAppointment ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-xs font-bold text-stone-900 bg-[#FAEDCD] px-2 py-1 rounded inline-block border border-[#D4A373]">
                                                {new Date(client.nextAppointment).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {new Date(client.nextAppointment).getHours()}h{new Date(client.nextAppointment).getMinutes().toString().padStart(2, '0')}
                                            </div>
                                            <button 
                                                onClick={() => handleGenerateReminder(client)}
                                                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-[#D4A373] px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border border-[#D4A373]"
                                            >
                                                <Instagram size={14} className="text-[#D4A373]" />
                                                Relancer
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-stone-400 italic bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                                            Aucun RDV prévu
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredClients.length === 0 && (
                <div className="p-10 text-center text-stone-400">
                    Aucune cliente trouvée.
                </div>
            )}
        </div>
      </div>

      {/* --- MODALS (Code inchangé pour la logique interne) --- */}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border-2 border-[#D4A373]">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Ajouter une cliente</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Nom complet</label>
                <input required type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Instagram</label>
                <input required type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientInsta} onChange={e => setNewClientInsta(e.target.value)} placeholder="@pseudo ou lien complet" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Notes</label>
                <textarea className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientNotes} onChange={e => setNewClientNotes(e.target.value)} rows={3} placeholder="Préférences, allergies..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors border border-stone-200">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:bg-black transition-colors shadow-lg border border-[#D4A373]">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Message Confirmation Modal (Workflow 1-Clic) */}
      {generatedMessage && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#D4A373]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] to-[#FAEDCD]" />
            
            <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2 font-serif">
              <Sparkles className="text-[#D4A373] fill-[#D4A373]" /> Message Prêt !
            </h2>
            <p className="text-stone-500 text-sm mb-4">Le message est généré. Cliquez pour copier le texte et ouvrir la conversation.</p>
            
            <div className="bg-[#FAF9F7] p-4 rounded-xl text-stone-700 italic mb-6 border border-[#D4A373]/30 relative shadow-inner text-sm max-h-40 overflow-y-auto">
               {generatedMessage}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={copyAndOpenInsta} 
                className="w-full py-4 bg-[#D4A373] text-white font-bold rounded-xl hover:bg-[#C79667] shadow-lg flex items-center justify-center gap-2 text-lg transition-all"
              >
                <MessageCircle size={20} className="fill-white text-[#D4A373]" />
                Copier & Ouvrir la conversation
              </button>
              
              <button onClick={() => setGeneratedMessage(null)} className="py-2 text-stone-400 text-xs font-bold hover:text-stone-600 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loadingAi && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4 border border-[#D4A373]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4A373]"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-stone-900">Rédaction par l'IA...</span>
                    <span className="text-xs text-[#D4A373]">Analyse du profil et des notes</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
