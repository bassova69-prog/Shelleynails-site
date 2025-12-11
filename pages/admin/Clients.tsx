
import React, { useState, useEffect } from 'react';
import { getData, addClient, updateClient, deleteClient } from '../../services/storage';
import { Client } from '../../types';
import { generateClientMessage } from '../../services/geminiService';
import { Search, Plus, Sparkles, MessageCircle, Calendar, Instagram, Check, Gift, ExternalLink, Copy, MoreHorizontal, PenLine, Trash2 } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New/Edit Client Form State
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
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

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const instaHandle = newClientInsta.startsWith('@') || newClientInsta.startsWith('http') ? newClientInsta : `@${newClientInsta}`;

    if (editingClientId) {
        // Mode Modification
        const existingClient = clients.find(c => c.id === editingClientId);
        if (existingClient) {
            const updatedClient: Client = {
                ...existingClient,
                name: newClientName,
                instagram: instaHandle,
                notes: newClientNotes
            };
            const updatedData = updateClient(updatedClient);
            setClients(updatedData.clients);
        }
    } else {
        // Mode Création
        const newClient: Client = {
            id: Date.now().toString(),
            name: newClientName,
            instagram: instaHandle,
            notes: newClientNotes,
            totalVisits: 0,
            lastVisit: new Date().toISOString()
        };
        const updatedData = addClient(newClient);
        setClients(updatedData.clients);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (client: Client) => {
    setEditingClientId(client.id);
    setNewClientName(client.name);
    setNewClientInsta(client.instagram);
    setNewClientNotes(client.notes);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
      if (window.confirm("Êtes-vous sûre de vouloir supprimer cette cliente ? Cette action est irréversible.")) {
          const updatedData = deleteClient(id);
          setClients(updatedData.clients);
      }
  };

  const openCreateModal = () => {
      resetForm();
      setEditingClientId(null);
      setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewClientName('');
    setNewClientInsta('');
    setNewClientNotes('');
    setEditingClientId(null);
  };

  const handleGenerateMessage = async (client: Client) => {
    setLoadingAi(true);
    setCurrentClientForReminder(client);
    
    // Générer le message (générique ou basé sur le contexte client)
    const msg = await generateClientMessage(client);
    
    setGeneratedMessage(msg);
    setLoadingAi(false);
  };

  // Fonction utilitaire pour extraire proprement le pseudo Instagram
  const extractUsername = (input: string) => {
    let handle = input.trim();
    if (handle.includes('instagram.com/')) {
        const parts = handle.split('instagram.com/');
        if (parts[1]) {
            handle = parts[1].split(/[/?#]/)[0]; // Retire les query params et slash finaux
        }
    }
    return handle.replace(/^@/, '').replace(/\/$/, '');
  };

  const copyAndOpenInsta = async () => {
    if (generatedMessage && currentClientForReminder) {
        // 1. Copier le message
        try {
            await navigator.clipboard.writeText(generatedMessage);
        } catch (err) {
            console.error('Erreur copie presse-papier:', err);
        }
        
        // 2. Extraire le pseudo propre
        const handle = extractUsername(currentClientForReminder.instagram);
        
        // 3. Ouvrir la conversation DM (Deep Link)
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
                Fichier Clientes
            </h1>
            <p className="text-stone-600 mt-1 font-medium">Gérez vos contacts, fidélité et relances.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-stone-900 hover:scale-[1.02] text-[#D4A373] px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg border border-[#D4A373]"
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
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all shadow-sm placeholder-stone-400 text-stone-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLEAU LISTE CLIENTES */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373]/20 text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                        <th className="p-5">Cliente</th>
                        <th className="p-5">Instagram</th>
                        <th className="p-5">Fidélité (10 = Cadeau)</th>
                        <th className="p-5 text-right">Echange</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                    {filteredClients.map(client => {
                        const visitsModulo = client.totalVisits % 10;
                        const isRewardAvailable = client.totalVisits > 0 && visitsModulo === 0;
                        const progress = isRewardAvailable ? 10 : visitsModulo;
                        
                        const handle = extractUsername(client.instagram);
                        const instaLink = `https://instagram.com/${handle}`;
                        const instaLabel = `@${handle}`;

                        return (
                            <tr key={client.id} className="hover:bg-white/30 transition-colors group">
                                <td className="p-5 align-top w-[35%]">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-[#FAEDCD]/50 flex items-center justify-center text-[#D4A373] font-serif font-bold border border-[#D4A373]/50 shadow-sm">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div className="font-bold text-stone-900 text-lg font-serif">{client.name}</div>
                                        </div>
                                        {client.notes && (
                                            <div className="text-xs text-stone-700 bg-[#FAEDCD]/20 p-3 rounded-xl border border-[#D4A373]/20 whitespace-pre-wrap break-words leading-relaxed shadow-inner">
                                                {client.notes}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5 align-top">
                                    <a 
                                        href={instaLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[#D4A373] hover:text-[#E1306C] transition-colors font-medium bg-white/40 border border-[#D4A373]/30 px-3 py-1.5 rounded-lg"
                                    >
                                        <Instagram size={14} className="text-[#D4A373]" />
                                        {instaLabel}
                                    </a>
                                </td>
                                <td className="p-5 align-top">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                                                    i < progress 
                                                        ? isRewardAvailable ? 'bg-[#D4A373] animate-pulse border border-[#D4A373]' : 'bg-[#D4A373]' 
                                                        : 'bg-stone-200/50 border border-stone-300/30'
                                                }`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between gap-4 max-w-[150px]">
                                            {isRewardAvailable ? (
                                                <span className="text-[10px] font-bold text-[#D4A373] bg-[#FAEDCD]/50 px-2 py-0.5 rounded flex items-center gap-1 border border-[#D4A373]/50">
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
                                <td className="p-5 text-right align-top">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleGenerateMessage(client)}
                                            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-[#D4A373] px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border border-[#D4A373]"
                                        >
                                            <Sparkles size={14} className="text-[#D4A373]" />
                                            IA
                                        </button>
                                        <div className="flex gap-1 ml-2">
                                            <button 
                                                onClick={() => handleEditClick(client)}
                                                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-white/50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <PenLine size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(client.id)}
                                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
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

      {/* --- MODALS --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-white/40">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">{editingClientId ? 'Modifier la fiche' : 'Ajouter une cliente'}</h2>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Nom complet</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Instagram</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientInsta} onChange={e => setNewClientInsta(e.target.value)} placeholder="@pseudo" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Notes</label>
                <textarea className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" value={newClientNotes} onChange={e => setNewClientNotes(e.target.value)} rows={3} placeholder="Préférences..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors border border-stone-200">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:bg-black transition-colors shadow-lg border border-[#D4A373]">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Message Confirmation Modal */}
      {generatedMessage && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#D4A373]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] to-[#FAEDCD]" />
            <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2 font-serif">
              <Sparkles className="text-[#D4A373] fill-[#D4A373]" /> Message Prêt !
            </h2>
            <div className="bg-[#FAF9F7] p-4 rounded-2xl text-stone-700 italic mb-6 border border-[#D4A373]/30 relative shadow-inner text-sm max-h-40 overflow-y-auto">
               {generatedMessage}
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={copyAndOpenInsta} 
                className="w-full py-4 bg-[#D4A373] text-white font-bold rounded-2xl hover:bg-[#C79667] shadow-lg flex items-center justify-center gap-2 text-lg transition-all"
              >
                <MessageCircle size={20} className="fill-white text-[#D4A373]" />
                Valider & Ouvrir Instagram
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
            <div className="bg-white/80 px-8 py-6 rounded-3xl shadow-xl flex items-center gap-4 border border-[#D4A373] backdrop-blur-md">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4A373]"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-stone-900">Rédaction par l'IA...</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
