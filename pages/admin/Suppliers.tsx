
import React, { useState, useEffect } from 'react';
import { getData, addSupplier, updateSupplier, deleteSupplier, addOrder, updateOrder, updateInventoryItem, deleteOrder } from '../../services/storage';
import { Supplier, Order, OrderItem, InventoryItem } from '../../types';
import { Plus, ExternalLink, Package, ShoppingBag, Search, Check, Send, ShoppingCart, Truck, Trash2, Minus, Calendar, Archive, LayoutList, AlertTriangle, PenLine, Save, X, Mail, Globe } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'order' | 'tracking' | 'stock' | 'directory'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Record<string, Record<string, number>>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Supplier Form State
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProducts, setNewProducts] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  const [stockSupplierFilter, setStockSupplierFilter] = useState<string>('all');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = getData();
    setSuppliers(data.suppliers);
    setOrders(data.orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setInventory(data.inventory || []);
  };

  const updateQuantity = (supplierId: string, product: string, delta: number) => {
    setCart(prev => {
      const supplierCart = prev[supplierId] || {};
      const newQty = Math.max(0, (supplierCart[product] || 0) + delta);
      const newSupplierCart = { ...supplierCart };
      if (newQty === 0) delete newSupplierCart[product];
      else newSupplierCart[product] = newQty;
      if (Object.keys(newSupplierCart).length === 0) { const { [supplierId]: _, ...rest } = prev; return rest; }
      return { ...prev, [supplierId]: newSupplierCart };
    });
  };
  const getQuantity = (supplierId: string, product: string): number => cart[supplierId]?.[product] || 0;
  
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const productList = newProducts.split(',').map(p => p.trim()).filter(p => p !== '');

    if (editingSupplierId) {
        // Update
        const existing = suppliers.find(s => s.id === editingSupplierId);
        if (existing) {
            const updatedSup: Supplier = {
                ...existing,
                name: newName,
                website: newWebsite,
                email: newEmail,
                products: productList,
                notes: newNotes
            };
            updateSupplier(updatedSup);
        }
    } else {
        // Create
        const newSup: Supplier = { 
            id: Date.now().toString(), 
            name: newName, 
            website: newWebsite, 
            email: newEmail,
            products: productList, 
            notes: newNotes 
        };
        addSupplier(newSup); 
    }
    
    refreshData();
    closeModal();
  };

  const handleEditSupplier = (s: Supplier) => {
      setEditingSupplierId(s.id);
      setNewName(s.name);
      setNewWebsite(s.website);
      setNewEmail(s.email || '');
      setNewProducts(s.products.join(', '));
      setNewNotes(s.notes);
      setIsModalOpen(true);
  };

  const handleDeleteSupplier = (id: string) => {
      if(window.confirm("Supprimer ce fournisseur ?")) {
          deleteSupplier(id);
          refreshData();
      }
  };

  const openAddModal = () => {
      setEditingSupplierId(null);
      setNewName('');
      setNewWebsite('');
      setNewEmail('');
      setNewProducts('');
      setNewNotes('');
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingSupplierId(null);
  };
  
  const handleOrderPerSupplier = async (supplierId: string) => {
    const items = cart[supplierId];
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (supplier && items) {
        const orderItems: OrderItem[] = Object.entries(items).map(([name, quantity]) => ({ name, quantity: quantity as number }));
        
        // 1. Créer la commande interne (Suivi)
        const newOrder: Order = {
            id: Date.now().toString(),
            supplierId,
            supplierName: supplier.name,
            date: new Date().toISOString(),
            status: 'En attente',
            items: orderItems,
            totalAmount: 0 
        };
        addOrder(newOrder);
        // On rafraichit les données pour voir la commande apparaître
        refreshData();

        // 2. Copier la liste des articles dans le presse-papier
        const itemsList = orderItems.map(i => `${i.quantity}x ${i.name}`).join('\n');
        try {
            await navigator.clipboard.writeText(itemsList);
            alert(`Liste d'articles copiée ! \n\nVous allez être redirigé vers le site de ${supplier.name}.`);
        } catch (err) {
            console.error('Erreur lors de la copie', err);
        }

        // 3. Ouvrir le site web du fournisseur
        if (supplier.website) {
            window.open(supplier.website, '_blank');
        } else {
            alert(`Commande enregistrée dans le suivi, mais aucun site web n'est renseigné pour ${supplier.name}.`);
        }

        // 4. Retirer les articles commandés du panier
        setCart(prev => {
            const { [supplierId]: _, ...rest } = prev;
            return rest;
        });

        // 5. Fermer la modale si le panier est vide
        const remainingSuppliers = Object.keys(cart).filter(id => id !== supplierId);
        if (remainingSuppliers.length === 0) {
            setIsOrderModalOpen(false);
            setActiveTab('tracking');
        }
    }
  };
  
  const handleStatusChange = (order: Order, newStatus: 'En attente' | 'Livrée') => {
      const updated = updateOrder({ ...order, status: newStatus });
      // Mise à jour directe de l'état local pour fluidité
      setOrders(updated.orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteOrder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Empêche le clic de traverser
    if (window.confirm("Supprimer cette commande du suivi ?")) {
        const updated = deleteOrder(id);
        // Mise à jour directe de l'état local pour supprimer visuellement l'élément
        setOrders(updated.orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };
  
  const handleSaveStock = (productName: string) => {
    updateInventoryItem({ productName, quantity: editQty, threshold: editThreshold, lastUpdated: new Date().toISOString() });
    setInventory(getData().inventory); 
    setEditingItem(null);
  };

  // UI Logic
  const allProducts = suppliers.flatMap(s => s.products.map(p => ({ name: p, supplierId: s.id, supplierName: s.name })));
  const lowStockCount = allProducts.filter(p => { const i = inventory.find(i => i.productName === p.name); return (i ? i.quantity : 0) <= (i ? i.threshold : 2); }).length;
  const filteredStockProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && (stockSupplierFilter === 'all' || p.supplierId === stockSupplierFilter));
  
  const totalItems = (Object.values(cart) as Record<string, number>[]).reduce((acc: number, c: Record<string, number>) => {
      return acc + (Object.values(c) as number[]).reduce((s: number, q: number) => s + q, 0);
  }, 0);
  
  const filteredSuppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Split Orders for Tracking
  const pendingOrders = orders.filter(o => o.status === 'En attente');
  const completedOrders = orders.filter(o => o.status === 'Livrée');

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D4A373]/30 pb-4">
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
                Fournisseurs
            </h1>
            <p className="text-stone-600 mt-1 font-medium">Gérez votre carnet d'adresses et vos stocks.</p>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="bg-white/40 p-1 rounded-2xl flex overflow-x-auto backdrop-blur-sm border border-white/40 no-scrollbar flex-1 md:flex-none">
                <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'directory' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}><LayoutList size={16} /> Liste</button>
                <button onClick={() => setActiveTab('order')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'order' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}><ShoppingCart size={16} /> Commande</button>
                <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'tracking' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}><Archive size={16} /> Suivi</button>
                <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'stock' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-600 hover:text-stone-900'}`}>Stocks {lowStockCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>}</button>
            </div>
        </div>
      </div>

      {/* --- TAB: ANNUAIRE (LISTE TABLEAU) --- */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
             <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={20} />
                    <input 
                    type="text" 
                    placeholder="Rechercher un fournisseur..." 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all shadow-sm placeholder-stone-400 text-stone-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                onClick={openAddModal}
                className="bg-stone-900 hover:scale-[1.02] text-[#D4A373] px-5 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg border border-[#D4A373] whitespace-nowrap"
                >
                <Plus size={18} className="text-[#D4A373]" />
                Ajouter
                </button>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373]/20 text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                                <th className="p-5">Fournisseur</th>
                                <th className="p-5">Contact</th>
                                <th className="p-5">Spécialités</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id} className="hover:bg-white/30 transition-colors group">
                                    <td className="p-5 align-top w-[30%]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-[#FAEDCD]/50 flex items-center justify-center text-[#D4A373] font-serif font-bold border border-[#D4A373]/50 shadow-sm">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <div className="font-bold text-stone-900 text-lg font-serif">{supplier.name}</div>
                                            </div>
                                            {supplier.notes && (
                                                <div className="text-xs text-stone-700 bg-[#FAEDCD]/20 p-2 rounded-lg border border-[#D4A373]/20 italic">
                                                    {supplier.notes}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 align-top space-y-2">
                                        {supplier.website && (
                                            <div className="flex items-center gap-2">
                                                <ExternalLink size={14} className="text-stone-400"/>
                                                <a 
                                                    href={supplier.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-stone-700 hover:text-[#D4A373] hover:underline"
                                                >
                                                    {supplier.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                                </a>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-stone-400"/>
                                                <a href={`mailto:${supplier.email}`} className="text-stone-700 hover:text-[#D4A373] hover:underline">
                                                    {supplier.email}
                                                </a>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 align-top">
                                        <div className="flex flex-wrap gap-2">
                                            {supplier.products.map((p, i) => (
                                                <span key={i} className="text-[10px] bg-white/50 px-2 py-1 rounded-lg border border-stone-200 text-stone-600 font-medium">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right align-top">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEditSupplier(supplier)}
                                                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-white/50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <PenLine size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSupplier(supplier.id)}
                                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredSuppliers.length === 0 && (
                        <div className="p-10 text-center text-stone-400">
                            Aucun fournisseur trouvé.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- TAB: COMMANDE (ORDER) --- */}
      {activeTab === 'order' && (
        <div className="space-y-8 pb-24">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={20} />
                <input type="text" placeholder="Rechercher un produit ou fournisseur..." className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all shadow-sm placeholder-stone-400 text-stone-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {suppliers.map(supplier => {
                const products = supplier.products.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
                if (products.length === 0 && !supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) return null;
                const displayProducts = supplier.products; 
                
                const qty = (Object.values((cart[supplier.id] || {})) as number[]).reduce((a, b) => a + b, 0);
                
                return (
                    <div key={supplier.id} className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden shadow-sm animate-in fade-in">
                        <div className="bg-[#FAEDCD]/30 p-4 border-b border-[#D4A373]/30 flex justify-between items-center">
                            <h3 className="font-bold text-stone-900">{supplier.name}</h3>
                            <span className={`text-xs font-bold ${qty > 0 ? 'text-[#D4A373]' : 'text-stone-400'}`}>{qty} art.</span>
                        </div>
                        <div className="divide-y divide-[#D4A373]/10">
                            {displayProducts.map((product, idx) => {
                                const q = getQuantity(supplier.id, product);
                                if (searchTerm && !product.toLowerCase().includes(searchTerm.toLowerCase()) && !supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) return null;

                                return (
                                    <div key={idx} className={`p-4 flex items-center justify-between ${q > 0 ? 'bg-[#FAEDCD]/40' : 'hover:bg-white/20'}`}>
                                        <span className="text-sm font-bold text-stone-800">{product}</span>
                                        {q > 0 ? (
                                            <div className="flex items-center gap-2 bg-white/80 rounded-lg p-1 border border-[#D4A373]/30">
                                                <button onClick={() => updateQuantity(supplier.id, product, -1)} className="w-7 h-7 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200"><Minus size={14}/></button>
                                                <span className="font-bold w-6 text-center text-stone-900">{q}</span>
                                                <button onClick={() => updateQuantity(supplier.id, product, 1)} className="w-7 h-7 flex items-center justify-center rounded bg-stone-900 text-white hover:bg-black"><Plus size={14}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => updateQuantity(supplier.id, product, 1)} className="text-[#D4A373] p-2 bg-stone-50/50 rounded-lg hover:bg-[#D4A373] hover:text-white transition-colors"><Plus size={18}/></button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
            })}
             {totalItems > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20">
                    <div className="bg-stone-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 w-full max-w-lg flex items-center justify-between border border-[#D4A373]">
                        <div className="font-bold flex items-center gap-2"><ShoppingCart size={18}/> {totalItems} articles</div>
                        <button onClick={() => setIsOrderModalOpen(true)} className="bg-[#FAEDCD] text-stone-900 px-6 py-2 rounded-xl font-bold text-sm border border-[#D4A373] hover:bg-white transition-colors">Commander</button>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* --- TAB: SUIVI (TRACKING) --- */}
      {activeTab === 'tracking' && (
          <div className="space-y-8 pb-24">
              
              {/* SECTION: EN COURS (PENDING) */}
              <div>
                <h3 className="font-bold text-stone-800 font-serif text-lg mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-[#D4A373]" /> En cours
                </h3>
                {pendingOrders.length === 0 ? (
                    <div className="text-center p-10 text-stone-400 bg-white/40 rounded-[2rem] border border-white/40 border-dashed">
                        Aucune commande en attente de réception.
                    </div>
                ) : (
                    pendingOrders.map(order => (
                        <div key={order.id} className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 p-6 shadow-sm mb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-stone-900">{order.supplierName}</h3>
                                        <span className="text-xs text-stone-500">{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1">{order.items.length} références</div>
                                </div>
                                <div className="flex items-center gap-2 relative z-10">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order, e.target.value as any)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer bg-yellow-100 text-yellow-700 border-yellow-200"
                                    >
                                        <option value="En attente">En attente</option>
                                        <option value="Livrée">Reçue</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1 pl-4 border-l-2 border-[#D4A373]/30">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-stone-700">{item.name}</span>
                                        <span className="font-bold text-stone-900">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
              </div>

              {/* SECTION: ARCHIVES (COMPLETED) */}
              {completedOrders.length > 0 && (
                  <div className="pt-8 border-t border-[#D4A373]/20">
                    <h3 className="font-bold text-stone-400 font-serif text-lg mb-4 flex items-center gap-2">
                        <Archive size={18} /> Historique (Reçues)
                    </h3>
                    <div className="space-y-4 opacity-70 grayscale-[0.5]">
                        {completedOrders.map(order => (
                            <div key={order.id} className="bg-white/20 backdrop-blur-sm rounded-[2rem] border border-white/20 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-stone-700">{order.supplierName}</h3>
                                            <span className="text-xs text-stone-400">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-stone-400 mt-1">{order.items.length} références</div>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order, e.target.value as any)}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer bg-green-100 text-green-700 border-green-200"
                                        >
                                            <option value="En attente">En attente</option>
                                            <option value="Livrée">Reçue</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1 pl-4 border-l-2 border-stone-300">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-stone-500">{item.name}</span>
                                            <span className="font-bold text-stone-600">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: STOCKS --- */}
      {activeTab === 'stock' && (
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                     <thead><tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373]/30 text-xs font-bold text-[#D4A373] uppercase"><th className="p-4">Produit</th><th className="p-4 text-center">Stock</th><th className="p-4 text-center">Action</th></tr></thead>
                     <tbody className="divide-y divide-[#D4A373]/10 text-sm">
                        {filteredStockProducts.map((p, idx) => {
                            const stockData = inventory.find(i => i.productName === p.name);
                            const q = stockData ? stockData.quantity : 0;
                            const isLow = q <= (stockData ? stockData.threshold : 2);
                            return (
                                <tr key={idx} className={isLow ? 'bg-red-50/60' : 'hover:bg-white/30'}>
                                    <td className="p-4 font-bold text-stone-800">{p.name} {isLow && <span className="text-red-500 font-bold text-xs ml-2">!</span>}</td>
                                    <td className="p-4 text-center font-bold text-lg">{editingItem === p.name ? <input type="number" value={editQty} onChange={e => setEditQty(Number(e.target.value))} className="w-16 p-1 text-center border rounded"/> : q}</td>
                                    <td className="p-4 text-center">{editingItem === p.name ? <button onClick={() => handleSaveStock(p.name)} className="bg-stone-900 text-white p-2 rounded"><Save size={16}/></button> : <button onClick={() => { setEditingItem(p.name); setEditQty(q); setEditThreshold(stockData ? stockData.threshold : 2); }}><PenLine size={16} className="text-stone-400"/></button>}</td>
                                </tr>
                            )
                        })}
                     </tbody>
                 </table>
          </div>
      )}

      {/* --- MODALS --- */}
      {/* Modal Confirmation Commande (OUVERTURE SITE) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative border border-[#D4A373] max-h-[80vh] overflow-y-auto">
                <button onClick={() => setIsOrderModalOpen(false)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900"><X size={20}/></button>
                <h2 className="text-xl font-bold text-stone-900 mb-6 font-serif">Commander en ligne</h2>
                <p className="text-sm text-stone-500 mb-6 italic">Cliquez pour copier la liste de vos articles et ouvrir le site du fournisseur pour passer commande.</p>
                
                <div className="space-y-6">
                    {Object.entries(cart).map(([supplierId, items]) => {
                         const supplier = suppliers.find(s => s.id === supplierId);
                         if (!supplier) return null;
                         const totalItemsCount = (Object.values(items) as number[]).reduce((a, b) => a + b, 0);

                         return (
                             <div key={supplierId} className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                                 <div className="flex justify-between items-start mb-3">
                                     <h4 className="font-bold text-stone-900 font-serif text-lg">{supplier.name}</h4>
                                     <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-stone-200">{totalItemsCount} art.</span>
                                 </div>
                                 <ul className="space-y-1 mb-4 border-l-2 border-[#D4A373]/30 pl-3">
                                     {Object.entries(items).map(([name, qty]) => (
                                         <li key={name} className="flex justify-between text-sm text-stone-600"><span className="truncate pr-2">{name}</span><span className="font-bold text-stone-900 shrink-0">x{qty}</span></li>
                                     ))}
                                 </ul>
                                 
                                 <button 
                                    onClick={() => handleOrderPerSupplier(supplierId)}
                                    className="w-full py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl shadow-md border border-[#D4A373] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                 >
                                    <Globe size={14} /> Ouvrir le site
                                 </button>
                             </div>
                         )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* Modal Ajout/Modif Fournisseur */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative border border-[#D4A373]">
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900"><X size={20}/></button>
                <h2 className="text-xl font-bold text-stone-900 mb-6 font-serif">{editingSupplierId ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h2>
                <form onSubmit={handleSaveSupplier} className="space-y-4">
                    <input required type="text" placeholder="Nom" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
                    <input type="email" placeholder="Email Commande" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    <input type="text" placeholder="Site Web (ex: https://...)" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none" value={newWebsite} onChange={e => setNewWebsite(e.target.value)} />
                    <input type="text" placeholder="Produits (séparés par des virgules)" className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none" value={newProducts} onChange={e => setNewProducts(e.target.value)} />
                    <textarea placeholder="Notes..." rows={3} className="w-full p-4 rounded-2xl bg-white/60 border border-[#D4A373]/30 focus:ring-2 focus:ring-[#D4A373] outline-none" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                    <button type="submit" className="w-full py-3 bg-stone-900 text-[#D4A373] font-bold rounded-xl shadow-lg border border-[#D4A373] hover:scale-[1.02] transition-all">
                        {editingSupplierId ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};
