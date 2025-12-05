
import React, { useState, useEffect } from 'react';
import { getData, addTransaction, addTaxDeclaration, deleteTransaction, updateTransaction, deleteOrder, updateOrder, deleteTaxDeclaration, updateTaxDeclaration } from '../../services/storage';
import { Transaction, TaxDeclaration, Order } from '../../types';
import { TrendingUp, CreditCard, Banknote, Building, FileText, Scroll, ShoppingBag, ShieldCheck, Scale, Download, PenLine, Trash2, X, Save } from 'lucide-react';

export const Accounting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('sales');
  
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Form States (Encaissement)
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Transaction['type']>('Especes');
  const [category, setCategory] = useState<Transaction['category']>('Prestation');
  const [description, setDescription] = useState('');

  // Modal State
  const [isUrssafModalOpen, setIsUrssafModalOpen] = useState(false);

  // Edit State
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

  // --- ACTIONS MODIFICATION / SUPPRESSION ---

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

  // --- EXPORT CSV ---

  const exportToCSV = (filename: string, rows: any[]) => {
      if (!rows || rows.length === 0) {
          alert("Rien à exporter.");
          return;
      }
      
      const separator = ';';
      const keys = Object.keys(rows[0]);
      
      const csvContent = [
          keys.join(separator),
          ...rows.map(row => keys.map(k => {
              let val = row[k];
              // Formatage basique pour CSV
              if (typeof val === 'string') {
                  val = `"${val.replace(/"/g, '""')}"`;
              }
              return val;
          }).join(separator))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const handleExportSales = () => {
      const data = transactions.map(t => ({
          Date: new Date(t.date).toLocaleDateString(),
          Montant: t.amount,
          Type: t.type,
          Categorie: t.category,
          Description: t.description
      }));
      exportToCSV('journal_ventes.csv', data);
  };

  const handleExportExpenses = () => {
      const data = orders.map(o => ({
          Date: new Date(o.date).toLocaleDateString(),
          Fournisseur: o.supplierName,
          Montant: o.totalAmount,
          Statut: o.status,
          Articles: o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
      }));
      exportToCSV('journal_achats.csv', data);
  };

  const handleExportSocialFiscal = () => {
      const data = declarations.map(d => ({
          Date: new Date(d.date).toLocaleDateString(),
          Type: d.type,
          Periode: d.period,
          Montant: d.amount,
          Statut: d.status,
          Details: d.details
      }));
      exportToCSV('journal_social_fiscal.csv', data);
  };

  // --- CALCULS ---
  const RATE_SERVICE = 0.22; 
  const RATE_SALES = 0.124;

  const calculateCurrentUrssafDue = () => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTx = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const serviceRevenue = currentMonthTx
        .filter(t => t.category === 'Prestation' || t.category === 'Formation')
        .reduce((acc, t) => acc + t.amount, 0);

      const salesRevenue = currentMonthTx
        .filter(t => t.category === 'Vente')
        .reduce((acc, t) => acc + t.amount, 0);

      const totalDue = (serviceRevenue * RATE_SERVICE) + (salesRevenue * RATE_SALES);

      return { serviceRevenue, salesRevenue, totalDue };
  };

  const { totalDue, serviceRevenue, salesRevenue } = calculateCurrentUrssafDue();

  // Totaux pour Synthèse
  const totalSales = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalSocial = declarations.filter(d => d.type === 'URSSAF').reduce((acc, d) => acc + d.amount, 0);
  const totalFiscal = declarations.filter(d => d.type === 'CFE').reduce((acc, d) => acc + d.amount, 0);
  const totalCharges = totalPurchases + totalSocial + totalFiscal;
  const netResult = totalSales - totalCharges;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-[#D4A373] pb-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Comptabilité</h1>
            <p className="text-stone-500 mt-1">Journaux, Charges et Bilan.</p>
        </div>
        
        <div className="bg-stone-100 p-1 rounded-xl flex overflow-x-auto max-w-full">
            <button 
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'sales' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <TrendingUp size={16} className={activeTab === 'sales' ? "text-[#D4A373]" : ""} /> Journal des Ventes
            </button>
            <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <ShoppingBag size={16} className={activeTab === 'expenses' ? "text-[#D4A373]" : ""} /> Charges
            </button>
            <button 
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'summary' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <Scale size={16} className={activeTab === 'summary' ? "text-[#D4A373]" : ""} /> Synthèse & Bilan
            </button>
        </div>
      </div>

      {/* --- ONGLET 1: JOURNAL DES VENTES --- */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Formulaire Nouvel Encaissement */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-stone-200/50 border border-[#D4A373] sticky top-6">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 font-serif">
                    Nouvel Encaissement
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant (€)</label>
                        <div className="relative">
                            <input 
                            type="number" 
                            required 
                            step="0.01"
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="w-full text-3xl font-serif font-bold p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none text-stone-900 placeholder-stone-300"
                            placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4A373] font-serif text-xl">€</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Type de paiement</label>
                        <div className="grid grid-cols-2 gap-2">
                        {['Especes', 'Carte', 'Virement', 'Cheque'].map((t) => (
                            <button 
                                key={t}
                                type="button" 
                                onClick={() => setType(t as any)} 
                                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold border transition-all ${type === t ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-[#D4A373] text-stone-500 hover:bg-[#FAEDCD]'}`}
                            >
                                {t === 'Especes' && <Banknote size={18} className={type === t ? 'text-[#D4A373]' : 'text-[#D4A373]'} />}
                                {t === 'Carte' && <CreditCard size={18} className={type === t ? 'text-[#D4A373]' : 'text-[#D4A373]'} />}
                                {t === 'Virement' && <Building size={18} className={type === t ? 'text-[#D4A373]' : 'text-[#D4A373]'} />}
                                {t === 'Cheque' && <Scroll size={18} className={type === t ? 'text-[#D4A373]' : 'text-[#D4A373]'} />}
                                {t}
                            </button>
                        ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Catégorie</label>
                        <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value as any)}
                        className="w-full p-4 rounded-xl border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none bg-white text-stone-800 font-medium"
                        >
                        <option value="Prestation">Prestation Ongles</option>
                        <option value="Formation">Formation</option>
                        <option value="Vente">Vente Produit</option>
                        <option value="Autre">Autre</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Description</label>
                        <input 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#D4A373] focus:ring-2 focus:ring-stone-900 outline-none bg-stone-50"
                        placeholder="Ex: Pose complète..."
                        />
                    </div>

                    <button type="submit" className="w-full py-4 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:bg-black shadow-lg transition-all active:scale-[0.98] mt-2 border border-[#D4A373]">
                        Encaisser
                    </button>
                    </form>
                </div>
            </div>

            {/* Journal des Ventes */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden">
                    <div className="p-6 border-b border-[#D4A373] flex justify-between items-center bg-[#FAEDCD]/30">
                        <h3 className="font-bold text-stone-900 font-serif text-lg">Journal des Ventes</h3>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleExportSales}
                                className="flex items-center gap-2 text-xs font-bold text-[#D4A373] hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-[#D4A373] hover:border-stone-400 transition-colors"
                            >
                                <Download size={14} /> CSV
                            </button>
                            <div className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-[#D4A373] shadow-sm text-stone-600">
                                Total: {totalSales.toFixed(2)} €
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-xs font-bold text-[#D4A373] uppercase tracking-wider border-b border-[#D4A373]">
                                <tr>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Libellé</th>
                                    <th className="p-5">Catégorie</th>
                                    <th className="p-5">Moyen</th>
                                    <th className="p-5 text-right">Montant</th>
                                    <th className="p-5 text-center w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-[#FAEDCD]/20 transition-colors group">
                                        <td className="p-5 text-stone-500">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="p-5 font-medium text-stone-900">{t.description || 'N/A'}</td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                t.category === 'Formation' ? 'bg-[#FAEDCD] text-[#D4A373] border-[#D4A373]' : 
                                                t.category === 'Vente' ? 'bg-stone-100 text-stone-600 border-stone-200' :
                                                'bg-white border-stone-200 text-stone-800'
                                            }`}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="p-5 text-stone-500 flex items-center gap-2">
                                            {t.type === 'Especes' && <Banknote size={14} className="text-[#D4A373]" />}
                                            {t.type === 'Carte' && <CreditCard size={14} className="text-[#D4A373]" />}
                                            {t.type === 'Virement' && <Building size={14} className="text-[#D4A373]" />}
                                            {t.type === 'Cheque' && <Scroll size={14} className="text-[#D4A373]" />}
                                            {t.type}
                                        </td>
                                        <td className="p-5 text-right font-bold text-stone-900 font-serif">+{t.amount.toFixed(2)} €</td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => setEditingItem({type: 'transaction', data: t})} 
                                                    className="p-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-900 hover:text-white transition-colors shadow-sm"
                                                    title="Modifier"
                                                >
                                                    <PenLine size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete('transaction', t.id)} 
                                                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-stone-400 italic">Aucune transaction enregistrée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- ONGLET 2: CHARGES (ACHATS, SOCIAL, FISCAL) --- */}
      {activeTab === 'expenses' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* 1. Journal des Achats */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden">
                <div className="p-6 border-b border-[#D4A373] bg-[#FAEDCD]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-[#D4A373] text-[#D4A373]">
                            <ShoppingBag size={18} className="fill-[#D4A373]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 font-serif text-lg">Journal des Achats Fournisseurs</h3>
                            <p className="text-xs text-stone-500">Commandes de matériel et consommables</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleExportExpenses}
                        className="flex items-center gap-2 text-xs font-bold text-[#D4A373] hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-[#D4A373] hover:border-stone-400 transition-colors"
                    >
                        <Download size={14} /> CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-xs font-bold text-[#D4A373] uppercase tracking-wider border-b border-[#D4A373]">
                            <tr>
                                <th className="p-5">Date</th>
                                <th className="p-5">Fournisseur</th>
                                <th className="p-5">Détail</th>
                                <th className="p-5">Statut</th>
                                <th className="p-5 text-right">Montant</th>
                                <th className="p-5 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-[#FAEDCD]/20 transition-colors group">
                                    <td className="p-5 text-stone-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-5 font-bold text-stone-800">{order.supplierName}</td>
                                    <td className="p-5 text-stone-600 text-xs">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === 'Livrée' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-bold text-red-500 font-serif">-{order.totalAmount?.toFixed(2) || '0.00'} €</td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setEditingItem({type: 'order', data: order})} 
                                                className="p-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-900 hover:text-white transition-colors shadow-sm"
                                                title="Modifier"
                                            >
                                                <PenLine size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('order', order.id)} 
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-stone-400 italic">Aucun achat fournisseur enregistré.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Journal Social (URSSAF) */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden relative">
                 <div className="p-6 border-b border-[#D4A373] bg-[#FAEDCD]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
                            <ShieldCheck size={18} className="fill-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 font-serif text-lg">Journal Social (URSSAF)</h3>
                            <p className="text-xs text-stone-500">Cotisations sociales auto-entrepreneur</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExportSocialFiscal}
                            className="flex items-center gap-2 text-xs font-bold text-[#D4A373] hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-[#D4A373] hover:border-stone-400 transition-colors"
                        >
                            <Download size={14} /> CSV
                        </button>
                        <button 
                            onClick={() => setIsUrssafModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2"
                        >
                            <FileText size={14} /> Déclarer le mois
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-[#D4A373]/20">
                    {declarations.filter(d => d.type === 'URSSAF').map(decl => (
                        <div key={decl.id} className="p-5 flex items-center justify-between hover:bg-[#FAEDCD]/20 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="text-stone-400 font-mono text-xs w-20">{new Date(decl.date).toLocaleDateString()}</div>
                                <div>
                                    <p className="font-bold text-stone-800">Déclaration {decl.period}</p>
                                    <p className="text-xs text-stone-400">{decl.details}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-indigo-600 font-serif text-lg">-{decl.amount.toFixed(2)} €</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setEditingItem({type: 'declaration', data: decl})} 
                                        className="p-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-900 hover:text-white transition-colors shadow-sm"
                                        title="Modifier"
                                    >
                                        <PenLine size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete('declaration', decl.id)} 
                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {declarations.filter(d => d.type === 'URSSAF').length === 0 && (
                        <div className="p-8 text-center text-stone-400 italic">Aucune déclaration sociale.</div>
                    )}
                </div>
            </div>

            {/* 3. Journal Fiscal (CFE, Impôts) */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden">
                <div className="p-6 border-b border-[#D4A373] bg-[#FAEDCD]/30 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-100 text-orange-600">
                        <Building size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-900 font-serif text-lg">Journal Fiscal</h3>
                        <p className="text-xs text-stone-500">CFE et autres taxes</p>
                    </div>
                </div>
                 <div className="divide-y divide-[#D4A373]/20">
                    {declarations.filter(d => d.type === 'CFE').map(decl => (
                        <div key={decl.id} className="p-5 flex items-center justify-between hover:bg-[#FAEDCD]/20 transition-colors group">
                            <div>
                                <p className="font-bold text-stone-800">CFE {decl.period}</p>
                                <p className="text-xs text-stone-400">{decl.details}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-orange-600 font-serif text-lg">-{decl.amount.toFixed(2)} €</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setEditingItem({type: 'declaration', data: decl})} 
                                        className="p-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-900 hover:text-white transition-colors shadow-sm"
                                        title="Modifier"
                                    >
                                        <PenLine size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete('declaration', decl.id)} 
                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                     {declarations.filter(d => d.type === 'CFE').length === 0 && (
                        <div className="p-8 text-center text-stone-400 italic">Aucune taxe fiscale enregistrée.</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- ONGLET 3: SYNTHÈSE (BILAN & CR) --- */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* ... (Pas de changement pour la synthèse, affichage seulement) ... */}
            <div className="bg-white rounded-3xl shadow-lg border border-[#D4A373] overflow-hidden flex flex-col h-full">
                <div className="p-8 bg-stone-900 text-white">
                    <h2 className="text-2xl font-serif font-bold">Pré-Compte de Résultat</h2>
                    <p className="text-stone-400 text-sm mt-1">Exercice en cours</p>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                    <div className="flex justify-between items-center border-b border-[#D4A373]/30 pb-4">
                        <div>
                            <p className="font-bold text-stone-800">Produits d'exploitation</p>
                            <p className="text-xs text-stone-500">Chiffre d'Affaires encaissé</p>
                        </div>
                        <span className="font-serif text-xl font-bold text-green-600">+{totalSales.toFixed(2)} €</span>
                    </div>

                    <div className="space-y-3 pb-4 border-b border-[#D4A373]/30">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-600">Achats de marchandises</span>
                            <span className="font-mono text-red-500">-{totalPurchases.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-600">Charges Sociales (URSSAF)</span>
                            <span className="font-mono text-red-500">-{totalSocial.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-600">Impôts et Taxes (CFE)</span>
                            <span className="font-mono text-red-500">-{totalFiscal.toFixed(2)} €</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-stone-900 uppercase tracking-wider">Résultat Net</span>
                        <span className={`text-3xl font-serif font-bold ${netResult >= 0 ? 'text-[#D4A373]' : 'text-red-500'}`}>
                            {netResult.toFixed(2)} €
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Pré-Bilan Simplifié */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden flex flex-col h-full">
                 <div className="p-8 bg-[#FAEDCD]/30 border-b border-[#D4A373]">
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Pré-Bilan Simplifié</h2>
                    <p className="text-stone-500 text-sm mt-1">Situation Patrimoniale (Micro)</p>
                </div>

                <div className="flex-1 grid grid-cols-2 divide-x divide-[#D4A373]/30">
                    {/* Actif */}
                    <div className="p-6">
                        <h3 className="font-bold text-stone-400 text-xs uppercase tracking-wider mb-6 text-center">ACTIF</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="font-bold text-stone-800">Trésorerie</p>
                                <p className="text-xs text-stone-400">Banque / Caisse</p>
                                <p className="font-serif font-bold text-green-600 mt-1">{netResult.toFixed(2)} €</p>
                            </div>
                            <div className="pt-8 border-t border-[#D4A373]/30 mt-auto">
                                <p className="font-bold text-stone-900 text-right">Total Actif</p>
                                <p className="font-serif font-bold text-xl text-stone-900 text-right">{netResult.toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>

                    {/* Passif */}
                    <div className="p-6">
                        <h3 className="font-bold text-stone-400 text-xs uppercase tracking-wider mb-6 text-center">PASSIF</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="font-bold text-stone-800">Résultat de l'exercice</p>
                                <p className="text-xs text-stone-400">Bénéfice ou Perte</p>
                                <p className={`font-serif font-bold mt-1 ${netResult >= 0 ? 'text-[#D4A373]' : 'text-red-500'}`}>{netResult.toFixed(2)} €</p>
                            </div>
                             <div className="pt-8 border-t border-[#D4A373]/30 mt-auto">
                                <p className="font-bold text-stone-900 text-right">Total Passif</p>
                                <p className="font-serif font-bold text-xl text-stone-900 text-right">{netResult.toFixed(2)} €</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Confirmation URSSAF */}
      {isUrssafModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#D4A373]">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <ShieldCheck size={40} className="mx-auto mb-4 text-white/80 fill-current" />
                    <h2 className="text-2xl font-serif font-bold">Déclaration URSSAF</h2>
                    <p className="text-indigo-100 text-sm mt-1">Mois en cours (Estimatif)</p>
                </div>
                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                            <span className="text-stone-500 text-sm">Prestations ({serviceRevenue.toFixed(2)}€)</span>
                            <span className="font-bold text-stone-900">{(serviceRevenue * RATE_SERVICE).toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                            <span className="text-stone-500 text-sm">Ventes ({salesRevenue.toFixed(2)}€)</span>
                            <span className="font-bold text-stone-900">{(salesRevenue * RATE_SALES).toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-stone-900">Total à payer</span>
                            <span className="text-2xl font-serif font-bold text-indigo-600">{totalDue.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsUrssafModalOpen(false)}
                            className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleDeclareUrssaf}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL EDITION GENERIQUE */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-[#D4A373]">
                <button 
                    onClick={() => setEditingItem(null)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full"
                >
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-stone-900 mb-6 font-serif">Modifier la ligne</h2>
                
                <form onSubmit={handleEditSave} className="space-y-4">
                    {/* Champs communs */}
                    <div>
                        <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Date</label>
                        <input 
                            type="datetime-local" 
                            className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                            value={editingItem.data.date ? new Date(editingItem.data.date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditingItem({
                                ...editingItem, 
                                data: { ...editingItem.data, date: new Date(e.target.value).toISOString() }
                            })}
                        />
                    </div>

                    {/* Champs Spécifiques Transaction */}
                    {editingItem.type === 'transaction' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Description</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant</label>
                                <input 
                                    type="number" step="0.01"
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.amount}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, amount: parseFloat(e.target.value) } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Type</label>
                                <select 
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.type}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                                >
                                    {['Especes', 'Carte', 'Virement', 'Cheque'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Champs Spécifiques Commande */}
                    {editingItem.type === 'order' && (
                        <>
                             <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Fournisseur</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.supplierName}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, supplierName: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Total (€)</label>
                                <input 
                                    type="number" step="0.01"
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.totalAmount || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, totalAmount: parseFloat(e.target.value) } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Statut</label>
                                <select 
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.status}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                                >
                                    <option value="En attente">En attente</option>
                                    <option value="Livrée">Livrée</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Champs Spécifiques Déclaration */}
                    {editingItem.type === 'declaration' && (
                        <>
                             <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Période</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.period}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, period: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Montant</label>
                                <input 
                                    type="number" step="0.01"
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-[#D4A373]"
                                    value={editingItem.data.amount}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, amount: parseFloat(e.target.value) } })}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl hover:bg-black flex items-center justify-center gap-2 border border-[#D4A373]">
                            <Save size={16} /> Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
