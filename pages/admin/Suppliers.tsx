
import React, { useState, useEffect } from 'react';
import { getData, addSupplier, addOrder, updateOrder, updateInventoryItem } from '../../services/storage';
import { Supplier, Order, OrderItem, InventoryItem } from '../../types';
import { Plus, ExternalLink, Package, ShoppingBag, Search, Check, Send, ShoppingCart, Truck, Trash2, Minus, Calendar, Archive, LayoutList, AlertTriangle, PenLine, Save } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'order' | 'tracking' | 'stock' | 'directory'>('order');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State pour la commande
  // Map: SupplierId -> { ProductName: Quantity }
  const [cart, setCart] = useState<Record<string, Record<string, number>>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // State pour l'édition de stock
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);

  // State pour Ajout Fournisseur
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newProducts, setNewProducts] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // State pour filtres Stock
  const [stockSupplierFilter, setStockSupplierFilter] = useState<string>('all');

  useEffect(() => {
    const data = getData();
    setSuppliers(data.suppliers);
    setOrders(data.orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setInventory(data.inventory || []);
  }, []);

  const updateQuantity = (supplierId: string, product: string, delta: number) => {
    setCart(prev => {
      const supplierCart = prev[supplierId] || {};
      const currentQty = supplierCart[product] || 0;
      const newQty = Math.max(0, currentQty + delta);

      const newSupplierCart = { ...supplierCart };
      if (newQty === 0) {
        delete newSupplierCart[product];
      } else {
        newSupplierCart[product] = newQty;
      }

      // Clean up empty supplier carts
      if (Object.keys(newSupplierCart).length === 0) {
        const { [supplierId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [supplierId]: newSupplierCart };
    });
  };

  const getQuantity = (supplierId: string, product: string): number => {
    return cart[supplierId]?.[product] || 0;
  };

  const clearCart = () => setCart({});

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: Date.now().toString(),
      name: newName,
      website: newWebsite,
      products: newProducts.split(',').map(p => p.trim()),
      notes: newNotes
    };
    const data = addSupplier(newSup);
    setSuppliers(data.suppliers);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewWebsite('');
    setNewProducts('');
    setNewNotes('');
  };

  const handleSendOrders = () => {
    // Créer une commande par fournisseur présent dans le panier
    const newOrders: Order[] = [];
    
    Object.keys(cart).forEach(supplierId => {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (!supplier) return;
        
        const items: OrderItem[] = Object.entries(cart[supplierId]).map(([name, quantity]) => ({
            name,
            quantity: quantity as number
        }));

        const order: Order = {
            id: Date.now().toString() + Math.random().toString(),
            supplierId: supplier.id,
            supplierName: supplier.name,
            date: new Date().toISOString(),
            status: 'En attente',
            items: items
        };
        
        addOrder(order);
        newOrders.push(order);
    });

    // Mise à jour de l'état local pour affichage immédiat
    setOrders(prev => [...newOrders, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    alert('Commandes enregistrées et envoyées aux fournisseurs !');
    setIsOrderModalOpen(false);
    clearCart();
    setActiveTab('tracking'); // Rediriger vers le suivi
  };

  const handleStatusChange = (order: Order, newStatus: 'En attente' | 'Livrée') => {
      const updatedOrder = { ...order, status: newStatus };
      updateOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
  };

  const handleSaveStock = (productName: string) => {
    const newItem: InventoryItem = {
      productName,
      quantity: editQty,
      threshold: editThreshold,
      lastUpdated: new Date().toISOString()
    };
    const data = updateInventoryItem(newItem);
    setInventory(data.inventory);
    setEditingItem(null);
  };

  const startEditing = (productName: string, currentQty: number, currentThreshold: number) => {
    setEditingItem(productName);
    setEditQty(currentQty);
    setEditThreshold(currentThreshold);
  };

  const totalItems = (Object.values(cart) as Record<string, number>[]).reduce((acc: number, supplierCart: Record<string, number>) => {
    return acc + Object.values(supplierCart).reduce((sum: number, qty: number) => sum + qty, 0);
  }, 0);
  
  const suppliersInvolved = Object.keys(cart).length;

  // --- LOGIC POUR VUE STOCKS ---
  // Agréger tous les produits de tous les fournisseurs
  const allProducts = suppliers.flatMap(s => s.products.map(p => ({
    name: p,
    supplierId: s.id,
    supplierName: s.name
  })));

  // Calculer le nombre de produits en alerte pour la bannière
  const lowStockCount = allProducts.filter(p => {
    const stockData = inventory.find(i => i.productName === p.name);
    const quantity = stockData ? stockData.quantity : 0;
    const threshold = stockData ? stockData.threshold : 2;
    return quantity <= threshold;
  }).length;

  // Filtrer la liste affichée
  const filteredStockProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = stockSupplierFilter === 'all' || p.supplierId === stockSupplierFilter;
    return matchesSearch && matchesSupplier;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-[#D4A373] pb-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Fournisseurs & Stocks</h1>
            <p className="text-stone-500 mt-1">Gérez vos réapprovisionnements et quantités.</p>
        </div>
        
        <div className="bg-stone-100 p-1 rounded-xl flex overflow-x-auto max-w-full">
            <button 
                onClick={() => setActiveTab('order')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'order' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <ShoppingCart size={16} className={activeTab === 'order' ? "text-[#D4A373]" : ""} /> Prise de Commande
            </button>
            <button 
                onClick={() => setActiveTab('tracking')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'tracking' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <Archive size={16} className={activeTab === 'tracking' ? "text-[#D4A373]" : ""} /> Suivi Livraisons
            </button>
            <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'stock' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <div className="relative">
                    <LayoutList size={16} className={activeTab === 'stock' ? "text-[#D4A373]" : ""} />
                    {lowStockCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </div>
                 Stocks
            </button>
            <button 
                onClick={() => setActiveTab('directory')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'directory' ? 'bg-white text-stone-900 shadow-sm border border-[#D4A373]' : 'text-stone-500 hover:text-stone-900'}`}
            >
                <Truck size={16} className={activeTab === 'directory' ? "text-[#D4A373]" : ""} /> Annuaire
            </button>
        </div>
      </div>

      {/* --- TAB: PRISE DE COMMANDE (ORDER) --- */}
      {activeTab === 'order' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={20} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit (ex: Gel, Limes, Coton...)" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#D4A373] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Product Grid */}
            <div className="space-y-8 pb-24">
                {suppliers.map(supplier => {
                    const products = supplier.products.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (products.length === 0) return null;

                    const supplierCart = (cart[supplier.id] || {}) as Record<string, number>;
                    const supplierTotalQty = Object.values(supplierCart).reduce((a: number, b: number) => a + b, 0);

                    return (
                        <div key={supplier.id} className="bg-white rounded-2xl border border-[#D4A373] overflow-hidden shadow-sm">
                            <div className="bg-[#FAEDCD]/30 p-4 border-b border-[#D4A373] flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-stone-700 font-bold border border-[#D4A373]">
                                        {supplier.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-stone-900">{supplier.name}</h3>
                                </div>
                                <span className={`text-xs uppercase tracking-wider font-bold transition-colors ${supplierTotalQty > 0 ? 'text-[#D4A373]' : 'text-stone-400'}`}>
                                    {supplierTotalQty > 0 ? `${supplierTotalQty} article(s)` : '0 article'}
                                </span>
                            </div>
                            <div className="divide-y divide-[#D4A373]/20">
                                {products.map((product, idx) => {
                                    const qty = getQuantity(supplier.id, product);
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`p-4 flex items-center justify-between transition-colors hover:bg-[#FAEDCD]/20 group ${qty > 0 ? 'bg-[#FAEDCD]/40' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => qty === 0 && updateQuantity(supplier.id, product, 1)}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${qty > 0 ? 'bg-stone-900 border-stone-900 text-white' : 'border-[#D4A373] bg-white text-[#D4A373]'}`}>
                                                    {qty > 0 && <Check size={12} />}
                                                </div>
                                                <span className={`text-sm font-medium ${qty > 0 ? 'text-stone-900 font-bold' : 'text-stone-600'}`}>
                                                    {product}
                                                </span>
                                            </div>
                                            
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-1 bg-white border border-[#D4A373] rounded-lg p-1 shadow-sm animate-in fade-in zoom-in duration-200">
                                                    <button 
                                                        onClick={() => updateQuantity(supplier.id, product, -1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-600 active:scale-95 transition-transform"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold w-6 text-center text-stone-900">{qty}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(supplier.id, product, 1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded bg-stone-900 text-white hover:bg-black active:scale-95 transition-transform"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => updateQuantity(supplier.id, product, 1)}
                                                    className="text-[#D4A373] hover:text-stone-900 transition-colors p-2 bg-stone-50 rounded-lg hover:bg-white border border-transparent hover:border-[#D4A373]"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Bottom Bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 flex justify-center z-20">
                    <div className="bg-stone-900 text-white rounded-2xl shadow-2xl p-4 w-full max-w-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300 border border-[#D4A373]">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-lg relative">
                                <ShoppingBag size={24} className="text-[#FAEDCD] fill-[#FAEDCD]" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-stone-900">
                                    {totalItems}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">{totalItems} produits au total</p>
                                <p className="text-xs text-stone-400">Chez {suppliersInvolved} fournisseur(s)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={clearCart}
                                className="p-2 hover:bg-white/10 rounded-lg text-stone-400 transition-colors"
                                title="Vider le panier"
                             >
                                <Trash2 size={18} />
                             </button>
                             <button 
                                onClick={() => setIsOrderModalOpen(true)}
                                className="bg-[#FAEDCD] text-stone-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white transition-colors shadow-lg border border-[#D4A373]"
                             >
                                Valider & Commander
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* --- TAB: SUIVI LIVRAISONS (TRACKING) --- */}
      {activeTab === 'tracking' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              {orders.length === 0 ? (
                  <div className="text-center py-20 text-stone-400 bg-white rounded-2xl border border-[#D4A373] border-dashed">
                      <Archive size={48} className="mx-auto mb-4 opacity-50 text-[#D4A373]" />
                      <p>Aucune commande en cours.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {orders.map((order) => (
                          <div key={order.id} className="bg-white rounded-2xl border border-[#D4A373] p-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                  <div>
                                      <div className="flex items-center gap-3 mb-1">
                                          <h3 className="font-bold text-stone-900 text-lg font-serif">{order.supplierName}</h3>
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                              order.status === 'Livrée' 
                                              ? 'bg-green-50 text-green-700 border-green-100' 
                                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                          }`}>
                                              {order.status}
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-stone-500 text-xs">
                                          <Calendar size={12} className="text-[#D4A373]" />
                                          {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                  </div>
                                  
                                  {order.status === 'En attente' && (
                                      <button 
                                        onClick={() => handleStatusChange(order, 'Livrée')}
                                        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-sm border border-[#D4A373]"
                                      >
                                          <Check size={14} />
                                          Marquer comme Reçue
                                      </button>
                                  )}
                              </div>

                              <div className="bg-stone-50 rounded-xl p-4 border border-[#D4A373]/20">
                                  <p className="text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-3">Détail de la commande</p>
                                  <div className="space-y-2">
                                      {order.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center text-sm">
                                              <span className="text-stone-700">{item.name}</span>
                                              <span className="font-mono font-bold text-stone-900">x{item.quantity}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: STOCKS (INVENTORY) --- */}
      {activeTab === 'stock' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             {/* Banner Alerte Stock Bas */}
             {lowStockCount > 0 && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex items-start gap-4 shadow-sm animate-pulse border border-red-200">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-red-900 font-bold text-lg font-serif">Attention : Stock Critique</h3>
                        <p className="text-red-700 text-sm mt-1">
                            Vous avez <span className="font-bold underline text-red-900">{lowStockCount} produit(s)</span> en dessous du seuil d'alerte. Pensez à recommander rapidement.
                        </p>
                        <button 
                            onClick={() => setActiveTab('order')} 
                            className="mt-3 text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 transition-colors"
                        >
                            Aller commander
                        </button>
                    </div>
                </div>
             )}

             {/* Filtres */}
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={20} />
                    <input 
                    type="text" 
                    placeholder="Filtrer par nom de produit..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D4A373] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition-all bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:w-64">
                    <select 
                        value={stockSupplierFilter} 
                        onChange={e => setStockSupplierFilter(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D4A373] focus:outline-none focus:ring-2 focus:ring-[#D4A373] bg-white"
                    >
                        <option value="all">Tous les fournisseurs</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-[#D4A373] overflow-hidden shadow-sm">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373] text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                             <th className="p-4">Produit</th>
                             <th className="p-4">Fournisseur</th>
                             <th className="p-4 text-center">Commandés (Total)</th>
                             <th className="p-4 text-center">Stock Actuel</th>
                             <th className="p-4 text-center">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                        {filteredStockProducts.map((p, idx) => {
                            // Données Inventory (si existantes)
                            const stockData = inventory.find(i => i.productName === p.name);
                            const quantity = stockData ? stockData.quantity : 0;
                            const threshold = stockData ? stockData.threshold : 2; // Default threshold

                            // Données Historique (Total Ordered)
                            const totalOrdered = orders.reduce((acc, order) => {
                                const item = order.items.find(i => i.name === p.name);
                                return acc + (item ? item.quantity : 0);
                            }, 0);

                            const isLowStock = quantity <= threshold;

                            return (
                                <tr key={idx} className={`transition-colors group border-b border-stone-50 ${isLowStock ? 'bg-red-50/60 hover:bg-red-100/50' : 'hover:bg-stone-50'}`}>
                                    <td className="p-4 font-bold text-stone-800 flex items-center gap-2">
                                        {p.name}
                                        {isLowStock && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                    </td>
                                    <td className="p-4 text-stone-500">{p.supplierName}</td>
                                    <td className="p-4 text-center font-mono text-stone-400">{totalOrdered}</td>
                                    <td className="p-4 text-center">
                                        {editingItem === p.name ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editQty}
                                                    onChange={e => setEditQty(Number(e.target.value))}
                                                    className="w-16 p-1 text-center border border-[#D4A373] rounded font-bold"
                                                    autoFocus
                                                />
                                                <span className="text-xs text-stone-400">/ Seuil:</span>
                                                 <input 
                                                    type="number" 
                                                    value={editThreshold}
                                                    onChange={e => setEditThreshold(Number(e.target.value))}
                                                    className="w-12 p-1 text-center border border-[#D4A373] rounded text-xs"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                 <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-stone-900'}`}>
                                                    {quantity}
                                                </span>
                                                {isLowStock && (
                                                    <div className="flex items-center gap-1 text-red-600 bg-white border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm">
                                                        <AlertTriangle size={10} className="stroke-[3]" />
                                                        Critique
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {editingItem === p.name ? (
                                            <button 
                                                onClick={() => handleSaveStock(p.name)}
                                                className="p-2 bg-stone-900 text-white rounded-lg hover:bg-black transition-colors"
                                                title="Enregistrer"
                                            >
                                                <Save size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => startEditing(p.name, quantity, threshold)}
                                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                                                title="Modifier le stock"
                                            >
                                                <PenLine size={16} className="text-[#D4A373]" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                     </tbody>
                 </table>
                 {filteredStockProducts.length === 0 && (
                     <div className="p-10 text-center text-stone-400">Aucun produit trouvé.</div>
                 )}
             </div>
          </div>
      )}

      {/* --- TAB: ANNUAIRE (DIRECTORY) - MODE TABLEAU --- */}
      {activeTab === 'directory' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-end mb-6">
                <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white border border-[#D4A373] hover:border-stone-900 text-stone-900 px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                >
                <Plus size={18} className="text-[#D4A373]" />
                Nouveau Fournisseur
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#D4A373] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAEDCD]/30 border-b border-[#D4A373] text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                                <th className="p-5">Fournisseur</th>
                                <th className="p-5">Produits</th>
                                <th className="p-5">Notes</th>
                                <th className="p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4A373]/20 text-sm">
                            {suppliers.map(s => (
                                <tr key={s.id} className="hover:bg-[#FAEDCD]/20 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-[#FAEDCD] flex items-center justify-center text-[#D4A373] font-serif font-bold border border-[#D4A373]">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div className="font-bold text-stone-900">{s.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {s.products.map((p, idx) => (
                                                <span key={idx} className="bg-stone-50 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold border border-[#D4A373]/20">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 text-stone-500 italic max-w-xs truncate" title={s.notes}>
                                        {s.notes}
                                    </td>
                                    <td className="p-5 text-right">
                                        <a 
                                            href={s.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm border border-[#D4A373]"
                                        >
                                            Visiter
                                            <ExternalLink size={12} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-stone-400 italic">Aucun fournisseur enregistré.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMATION COMMANDE --- */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-[#D4A373]">
                <div className="p-6 border-b border-[#D4A373] bg-[#FAEDCD]/30">
                    <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                        <Send size={24} className="text-stone-900" />
                        Envoi des commandes
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">Récapitulatif avant envoi aux fournisseurs.</p>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {Object.keys(cart).map(supplierId => {
                        const supplier = suppliers.find(s => s.id === supplierId);
                        const products = cart[supplierId] as Record<string, number>;
                        if (!supplier) return null;

                        const totalQty = Object.values(products).reduce((a: number, b: number) => a + b, 0);

                        return (
                            <div key={supplierId} className="border border-[#D4A373] rounded-xl p-4 bg-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-stone-900"></div>
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <h3 className="font-bold text-stone-900">{supplier.name}</h3>
                                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded font-mono">
                                        {totalQty} articles
                                    </span>
                                </div>
                                <ul className="pl-6 text-sm text-stone-600 space-y-2">
                                    {Object.entries(products).map(([name, qty], i) => (
                                        <li key={i} className="flex justify-between items-center pr-2">
                                            <span>{name}</span>
                                            <span className="font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-xs min-w-[2rem] text-center">x {qty}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-blue-600 font-medium">
                                    <Send size={12} />
                                    Prêt à être envoyé à {supplier.website.replace('https://', '')}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-3">
                    <button 
                        onClick={() => setIsOrderModalOpen(false)}
                        className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-200 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSendOrders}
                        className="flex-[2] py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 border border-[#D4A373]"
                    >
                        <Check size={18} />
                        Confirmer et Enregistrer
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL AJOUT FOURNISSEUR --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-[#D4A373]">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Nouveau Fournisseur</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nom</label>
                <input required type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Site Web</label>
                <input required type="url" className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none" value={newWebsite} onChange={e => setNewWebsite(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Produits (séparés par virgule)</label>
                <input type="text" className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none" value={newProducts} onChange={e => setNewProducts(e.target.value)} placeholder="Gel, Limes, Huiles..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Notes</label>
                <textarea className="w-full p-4 rounded-xl bg-stone-50 border border-[#D4A373] focus:ring-2 focus:ring-[#D4A373] outline-none" value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg border border-[#D4A373]">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
