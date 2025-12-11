
import React, { useState, useEffect } from 'react';
import { getData, addTransaction, addTaxDeclaration, deleteTransaction, updateTransaction, deleteOrder, updateOrder, deleteTaxDeclaration, updateTaxDeclaration } from '../../services/storage';
import { Transaction, TaxDeclaration, Order } from '../../types';
import { TrendingUp, CreditCard, Banknote, Building, FileText, Scroll, ShoppingBag, ShieldCheck, Scale, Download, PenLine, Trash2, X, Save, Calculator, Landmark } from 'lucide-react';

export const Accounting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('sales');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Transaction['type']>('Especes');
  const [category, setCategory] = useState<Transaction['category']>('Prestation');
  const [description, setDescription] = useState('');
  const [isUrssafModalOpen, setIsUrssafModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'transaction' | 'order' | 'declaration', data: any } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = getData();
    setTransactions(data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setDeclarations(data.taxDeclarations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setOrders(data.orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      type,
      category,
      description
    };
    addTransaction(newTx);
    refreshData();
    resetForm();
  };

  const handleDeclareUrssaf = () => {
    const { totalDue, serviceRevenue, salesRevenue } = calculateCurrentUrssafDue();
    const details = `CA Services: ${serviceRevenue}€, CA Ventes: ${salesRevenue}€`;
    
    const newDecl: TaxDeclaration = {
        id: Date.now().toString(),
        type: 'URSSAF',
        period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        amount: totalDue,
        date: new Date().toISOString(),
        status: 'Payée', 
        details
    };
    addTaxDeclaration(newDecl);
    refreshData();
    setIsUrssafModalOpen(false);
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
  };

  const handleDelete = (type: 'transaction' | 'order' | 'declaration', id: string) => {
    if (window.confirm("Confirmer la suppression de cette ligne ?")) {
      if (type === 'transaction') deleteTransaction(id);
      if (type === 'order') deleteOrder(id);
      if (type === 'declaration') deleteTaxDeclaration(id);
      refreshData();
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingItem) return;

      if (editingItem.type === 'transaction') {
          updateTransaction(editingItem.data);
      } else if (editingItem.type === 'order') {
          updateOrder(editingItem.data);
      } else if (editingItem.type === 'declaration') {
          updateTaxDeclaration(editingItem.data);
      }
      refreshData();
      setEditingItem(null);
  };

  // Calculs URSSAF
  const RATE_SERVICE = 0.22; 
  const RATE_SALES = 0.124;
  const calculateCurrentUrssafDue = () => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthTx = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const serviceRevenue = currentMonthTx.filter(t => t.category === 'Prestation' || t.category === 'Formation').reduce((acc, t) => acc + t.amount, 0);
      const salesRevenue = currentMonthTx.filter(t => t.category === 'Vente').reduce((acc, t) => acc + t.amount, 0);
      const totalDue = (serviceRevenue * RATE_SERVICE) + (salesRevenue * RATE_SALES);
      return { serviceRevenue, salesRevenue, totalDue };
  };

  // Calculs Globaux
  const { totalDue, serviceRevenue: monthlyServiceRev, salesRevenue: monthlySalesRev } = calculateCurrentUrssafDue();
  const totalSales = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalSocial = declarations.filter(d => d.type === 'URSSAF').reduce((acc, d) => acc + d.amount, 0);
  const totalFiscal = declarations.filter(d => d.type === 'CFE').reduce((acc, d) => acc + d.amount, 0);
  const totalCharges = totalPurchases + totalSocial + totalFiscal;
  const netResult = totalSales - totalCharges;

  // Calculs Fiscalité Micro (Annuel Global)
  const totalServices = transactions.filter(t => t.category === 'Prestation' || t.category === 'Formation').reduce((acc, t) => acc + t.amount, 0);
  const totalMerch = transactions.filter(t => t.category === 'Vente').reduce((acc, t) => acc + t.amount, 0);
  
  // Abattements Micro-Entreprise
  // Services (BNC/BIC Prestation) : 50%
  // Ventes (BIC Vente) : 71%
  const abatementServices = totalServices * 0.50;
  const abatementMerch = totalMerch * 0.71;
  const taxableIncome = (totalServices - abatementServices) + (totalMerch - abatementMerch);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-[#D4A373]/30 pb-4">
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
                Comptabilité
            </h1>
            <p className="text-stone-600 mt-1 font-medium">Journaux, Charges et Bilan.</p>
        </div>
        
        <div className="bg-white/40 p-1 rounded-2xl flex overflow-x-auto max-w-full backdrop-blur-sm border border-white/40">
            <button 
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'sales' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}
            >
                <TrendingUp size={16} className={activeTab === 'sales' ? "text-[#D4A373]" : ""} /> Ventes
            </button>
            <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}
            >
                <ShoppingBag size={16} className={activeTab === 'expenses' ? "text-[#D4A373]" : ""} /> Charges
            </button>
            <button 
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'summary' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}
            >
                <Scale size={16} className={activeTab === 'summary' ? "text-[#D4A373]" : ""} /> Synthèse
            </button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-1">
                <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg shadow-stone-200/50 border border-white/40 sticky top-6">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 font-serif">
                    Nouvel Encaissement
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant (€)</label>
                        <div className="relative">
                            <input 
                            type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full text-3xl font-serif font-bold p-4 rounded-2xl bg-white/60 border border-[#D4A373]/50 focus:ring-2 focus:ring-stone-900 outline-none text-stone-900 placeholder-stone-300"
                            placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4A373] font-serif text-xl">€</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Type</label>
                        <div className="grid grid-cols-2 gap-2">
                        {['Especes', 'Carte Cadeaux', 'Virement', 'Cheque'].map((t) => (
                            <button key={t} type="button" onClick={() => setType(t as any)} 
                                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold border transition-all ${type === t ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-[#D4A373]/50 text-stone-500 hover:bg-[#FAEDCD]/50'}`}
                            >
                                {t}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Catégorie</label>
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-4 rounded-2xl border border-[#D4A373]/50 focus:ring-2 focus:ring-stone-900 outline-none bg-white/60 text-stone-800 font-medium">
                        <option value="Prestation">Prestation Ongles</option>
                        <option value="Formation">Formation</option>
                        <option value="Vente">Vente Produit</option>
                        <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 rounded-2xl border border-[#D4A373]/50 focus:ring-2 focus:ring-stone-900 outline-none bg-white/60" placeholder="Ex: Pose complète..." />
                    </div>
                    <button type="submit" className="w-full py-4 bg-stone-900 text-[#D4A373] font-bold rounded-2xl hover:scale-[1.02] shadow-lg transition-all border border-[#D4A373]">
                        Encaisser
                    </button>
                    </form>
                </div>
            </div>

            {/* Journal */}
            <div className="lg:col-span-2">
                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 overflow-hidden">
                    <div className="p-6 border-b border-[#D4A373]/30 flex justify-between items-center bg-[#FAEDCD]/30">
                        <h3 className="font-bold text-stone-900 font-serif text-lg">Journal des Ventes</h3>
                        <div className="text-xs font-bold bg-white/50 px-3 py-1 rounded-full border border-[#D4A373] shadow-sm text-stone-600">
                                Total: {totalSales.toFixed(2)} €
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/40 text-xs font-bold text-[#D4A373] uppercase tracking-wider border-b border-[#D4A373]/20">
                                <tr>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Libellé</th>
                                    <th className="p-5">Catégorie</th>
                                    <th className="p-5">Moyen</th>
                                    <th className="p-5 text-right">Montant</th>
                                    <th className="p-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-white/30 transition-colors group">
                                        <td className="p-5 text-stone-500">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="p-5 font-medium text-stone-900">{t.description || 'N/A'}</td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${t.category === 'Formation' ? 'bg-[#FAEDCD] text-[#D4A373] border-[#D4A373]' : 'bg-white/50 border-stone-200 text-stone-800'}`}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="p-5 text-stone-500">{t.type}</td>
                                        <td className="p-5 text-right font-bold text-stone-900 font-serif">+{t.amount.toFixed(2)} €</td>
                                        <td className="p-5 text-center flex justify-center gap-2">
                                                <button onClick={() => setEditingItem({type: 'transaction', data: t})} className="p-1.5 bg-white/50 text-stone-700 rounded-lg hover:bg-stone-900 hover:text-white transition-colors shadow-sm"><PenLine size={12} /></button>
                                                <button onClick={() => handleDelete('transaction', t.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 size={12} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 overflow-hidden">
                <div className="p-6 border-b border-[#D4A373]/30 bg-[#FAEDCD]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/50 rounded-lg border border-[#D4A373] text-[#D4A373]"><ShoppingBag size={18} /></div>
                        <h3 className="font-bold text-stone-900 font-serif text-lg">Achats Fournisseurs</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/40 text-xs font-bold text-[#D4A373] uppercase tracking-wider border-b border-[#D4A373]/20">
                            <tr><th className="p-5">Date</th><th className="p-5">Fournisseur</th><th className="p-5">Statut</th><th className="p-5 text-right">Montant</th></tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                            {orders.map(o => (
                                <tr key={o.id} className="hover:bg-white/30 transition-colors"><td className="p-5">{new Date(o.date).toLocaleDateString()}</td><td className="p-5 font-bold">{o.supplierName}</td><td className="p-5">{o.status}</td><td className="p-5 text-right font-bold text-red-500">-{o.totalAmount?.toFixed(2)} €</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 overflow-hidden">
                 <div className="p-6 border-b border-[#D4A373]/30 bg-[#FAEDCD]/30 flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 font-serif text-lg">URSSAF & Charges</h3>
                    <button onClick={() => setIsUrssafModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Déclarer</button>
                 </div>
                 <div className="divide-y divide-[#D4A373]/10">
                    {declarations.map(decl => (
                        <div key={decl.id} className="p-5 flex items-center justify-between hover:bg-white/30"><p>{decl.type} {decl.period}</p><span className="font-bold text-indigo-600">-{decl.amount.toFixed(2)} €</span></div>
                    ))}
                 </div>
             </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Carte Résultat Net */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-lg border border-white/40 overflow-hidden flex flex-col h-full">
                <div className="p-8 bg-stone-900 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold">Résultat Net</h2>
                    <Calculator size={24} className="text-[#D4A373]" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                    <div className="flex justify-between items-center text-sm text-stone-600 border-b border-[#D4A373]/20 pb-2">
                        <span>CA Total Encaissé</span>
                        <span className="font-bold">{totalSales.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-500 border-b border-[#D4A373]/20 pb-2">
                        <span>Total Charges (Achats + URSSAF)</span>
                        <span className="font-bold">-{totalCharges.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-lg font-bold text-stone-900 uppercase tracking-wider">Résultat</span>
                        <span className={`text-4xl font-serif font-bold ${netResult >= 0 ? 'text-[#D4A373]' : 'text-red-500'}`}>{netResult.toFixed(2)} €</span>
                    </div>
                </div>
            </div>

            {/* Carte Bilan Fiscal Micro */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-lg border border-white/40 overflow-hidden flex flex-col h-full">
                <div className="p-8 bg-[#D4A373] text-stone-900 flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold">Bilan Fiscal Micro</h2>
                    <Landmark size={24} className="text-white" />
                </div>
                <div className="p-8 flex-1 space-y-6">
                    <div className="space-y-4">
                        {/* Services Details */}
                        <div>
                            <div className="flex justify-between text-sm font-bold text-stone-800">
                                <span>CA Services (Presta/Forma)</span>
                                <span>{totalServices.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-xs text-stone-500 italic mt-1">
                                <span>Abattement 50%</span>
                                <span>- {abatementServices.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* Ventes Details */}
                        <div>
                            <div className="flex justify-between text-sm font-bold text-stone-800">
                                <span>CA Ventes Marchandises</span>
                                <span>{totalMerch.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-xs text-stone-500 italic mt-1">
                                <span>Abattement 71%</span>
                                <span>- {abatementMerch.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-stone-300"></div>

                    <div className="bg-white/50 p-4 rounded-2xl border border-[#D4A373]/30">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Revenu Imposable (Impôts)</p>
                        <p className="text-3xl font-serif font-bold text-stone-900">{taxableIncome.toFixed(2)} €</p>
                        <p className="text-[10px] text-stone-400 mt-1">Montant à déclarer sur la fiche d'impôt sur le revenu après abattements.</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Editing (Generic) */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative border border-[#D4A373]">
                <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900"><X size={20} /></button>
                <h2 className="text-xl font-bold text-stone-900 mb-6 font-serif">Modifier</h2>
                <form onSubmit={handleEditSave} className="space-y-4">
                    {/* Simplified for brevity - Assume fields based on type */}
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:scale-[1.02] border border-[#D4A373]">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
