
import { AppData, Client, Transaction, Supplier, GiftCard, Order, TaxDeclaration, InventoryItem, CoachingRequest, CollabRequest } from '../types';

const STORAGE_KEY = 'shelleynails_data_v6';

const MOCK_DATA: AppData = {
  clients: [
    { id: '1', name: 'Valerie Basso', instagram: 'https://www.instagram.com/valerie_basso/', notes: 'Adore le Babyboomer. Allergique au latex.', totalVisits: 8, lastVisit: '2023-10-15', nextAppointment: new Date(Date.now() + 86400000).toISOString() },
    { id: '2', name: 'Julie Dubois', instagram: '@juliedub', notes: 'Ongles très courts, rongés.', totalVisits: 2, lastVisit: '2023-09-20' },
    { id: '3', name: 'Clara Thomas', instagram: '@clara_nails', notes: 'Aime le Nail Art complexe (strass, 3D).', totalVisits: 12, lastVisit: '2023-10-25', nextAppointment: new Date(Date.now() + 172800000).toISOString() },
    { id: '4', name: 'Emma Petit', instagram: '@emma_p', notes: 'Préfère le rouge classique. Retardataire chronique.', totalVisits: 5, lastVisit: '2023-10-01' },
  ],
  transactions: [
    { id: '1', date: '2023-10-25', amount: 55, type: 'Carte', category: 'Prestation', description: 'Pose complète Chablon' },
    { id: '2', date: '2023-10-25', amount: 40, type: 'Especes', category: 'Prestation', description: 'Remplissage Gel' },
    { id: '3', date: '2023-10-26', amount: 350, type: 'Virement', category: 'Formation', description: 'Acompte Formation Base' },
    { id: '4', date: '2023-10-26', amount: 15, type: 'Carte', category: 'Vente', description: 'Huile à cuticules' },
    { id: '5', date: '2023-10-27', amount: 65, type: 'Carte', category: 'Prestation', description: 'Nail Art 3D' },
    { id: '6', date: '2023-10-27', amount: 55, type: 'Carte', category: 'Prestation', description: 'Pose complète Chablon' },
    { id: '7', date: '2023-10-28', amount: 45, type: 'Especes', category: 'Prestation', description: 'Remplissage Gel' },
    { id: '8', date: '2023-10-28', amount: 15, type: 'Carte', category: 'Vente', description: 'Huile à cuticules' },
  ],
  suppliers: [
    { id: '1', name: 'Ongle24', website: 'https://www.ongle24.com', products: ['Gel UV Construction', 'Gel Monophase', 'Limes 100/180', 'Cleaner', 'Primer Acid Free'], notes: 'Livraison rapide (48h). Bon rapport qualité/prix.' },
    { id: '2', name: 'Purple Professional', website: 'https://purpleprofessional.pt', products: ['Vernis semi Rouge', 'Vernis semi Nude', 'Top Coat Milky', 'Base Rubber', 'Polygel Clear'], notes: 'Leur Top Coat est incroyable, très brillant.' },
    { id: '3', name: 'Amazon Business', website: 'https://amazon.fr', products: ['Coton cellulose', 'Masques noirs', 'Gants nitrile S', 'Rouleaux papier', 'Embouts ponceuse diamant'], notes: 'Pour le consommable et le jetable.' },
    { id: '4', name: 'Nailish', website: 'https://nailish.org', products: ['Chablons Papillon', 'Pinceaux Nail Art', 'Paillettes vrac', 'Strass Swarovski'], notes: 'Pour le matériel artistique.' },
  ],
  giftCards: [],
  orders: [
    { 
      id: '1', 
      supplierId: '1', 
      supplierName: 'Ongle24', 
      date: new Date(Date.now() - 432000000).toISOString(), 
      status: 'Livrée', 
      items: [{ name: 'Gel Monophase', quantity: 2 }, { name: 'Cleaner', quantity: 1 }],
      totalAmount: 45.50
    },
    { 
      id: '2', 
      supplierId: '3', 
      supplierName: 'Amazon Business', 
      date: new Date(Date.now() - 86400000).toISOString(), 
      status: 'En attente', 
      items: [{ name: 'Gants nitrile S', quantity: 5 }],
      totalAmount: 32.00
    }
  ],
  taxDeclarations: [
    { id: '1', type: 'URSSAF', period: 'Septembre 2023', amount: 452.50, date: '2023-10-05', status: 'Payée', details: 'CA Services: 2100€, CA Ventes: 80€' },
    { id: '2', type: 'URSSAF', period: 'Août 2023', amount: 380.20, date: '2023-09-05', status: 'Payée', details: 'CA Services: 1800€' },
    { id: '3', type: 'CFE', period: '2023', amount: 180.00, date: '2023-12-15', status: 'En attente', details: 'Estimation Cotisation Foncière' }
  ],
  inventory: [
    { productName: 'Gel UV Construction', quantity: 3, threshold: 2, lastUpdated: new Date().toISOString() },
    { productName: 'Limes 100/180', quantity: 15, threshold: 10, lastUpdated: new Date().toISOString() },
    { productName: 'Cleaner', quantity: 1, threshold: 2, lastUpdated: new Date().toISOString() },
    { productName: 'Gants nitrile S', quantity: 0, threshold: 1, lastUpdated: new Date().toISOString() }
  ],
  coachingRequests: [],
  collabRequests: [],
};

export const getData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    return MOCK_DATA;
  }
  const data = JSON.parse(stored);
  
  // Migrations
  if (!data.taxDeclarations) data.taxDeclarations = MOCK_DATA.taxDeclarations;
  if (!data.inventory) data.inventory = MOCK_DATA.inventory;
  if (!data.coachingRequests) data.coachingRequests = [];
  if (!data.collabRequests) data.collabRequests = [];
  if (data.notifications) delete data.notifications; // Cleanup
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addTransaction = (t: Transaction) => {
  const data = getData();
  data.transactions.push(t);
  saveData(data);
  return data;
};

export const updateTransaction = (t: Transaction) => {
  const data = getData();
  data.transactions = data.transactions.map(tr => tr.id === t.id ? t : tr);
  saveData(data);
  return data;
};

export const deleteTransaction = (id: string) => {
  const data = getData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
  return data;
};

export const addClient = (c: Client) => {
  const data = getData();
  data.clients.push(c);
  saveData(data);
  return data;
};

export const updateClient = (c: Client) => {
  const data = getData();
  data.clients = data.clients.map(client => client.id === c.id ? c : client);
  saveData(data);
  return data;
};

export const addSupplier = (s: Supplier) => {
  const data = getData();
  data.suppliers.push(s);
  saveData(data);
  return data;
};

export const addGiftCard = (g: GiftCard) => {
  const data = getData();
  data.giftCards.push(g);
  saveData(data);
  return data;
};

export const deleteGiftCard = (id: string) => {
  const data = getData();
  data.giftCards = data.giftCards.filter(g => g.id !== id);
  saveData(data);
  return data;
};

export const toggleGiftCardRedeemed = (id: string) => {
  const data = getData();
  const cardIndex = data.giftCards.findIndex(g => g.id === id);
  if (cardIndex !== -1) {
    data.giftCards[cardIndex].isRedeemed = !data.giftCards[cardIndex].isRedeemed;
    saveData(data);
  }
  return data;
};

export const addOrder = (o: Order) => {
  const data = getData();
  data.orders.push(o);
  saveData(data);
  return data;
};

export const updateOrder = (o: Order) => {
  const data = getData();
  data.orders = data.orders.map(order => order.id === o.id ? o : order);
  saveData(data);
  return data;
};

export const deleteOrder = (id: string) => {
  const data = getData();
  data.orders = data.orders.filter(o => o.id !== id);
  saveData(data);
  return data;
};

export const addTaxDeclaration = (tax: TaxDeclaration) => {
  const data = getData();
  data.taxDeclarations.push(tax);
  saveData(data);
  return data;
};

export const updateTaxDeclaration = (tax: TaxDeclaration) => {
  const data = getData();
  data.taxDeclarations = data.taxDeclarations.map(d => d.id === tax.id ? tax : d);
  saveData(data);
  return data;
};

export const deleteTaxDeclaration = (id: string) => {
  const data = getData();
  data.taxDeclarations = data.taxDeclarations.filter(d => d.id !== id);
  saveData(data);
  return data;
};

export const updateInventoryItem = (item: InventoryItem) => {
  const data = getData();
  const existingIndex = data.inventory.findIndex(i => i.productName === item.productName);
  
  if (existingIndex >= 0) {
    data.inventory[existingIndex] = { ...item, lastUpdated: new Date().toISOString() };
  } else {
    data.inventory.push({ ...item, lastUpdated: new Date().toISOString() });
  }
  
  saveData(data);
  return data;
};

export const submitCoachingRequest = (req: CoachingRequest) => {
  const data = getData();
  data.coachingRequests.push(req);
  saveData(data);
  return data;
};

export const submitCollabRequest = (req: CollabRequest) => {
  const data = getData();
  data.collabRequests.push(req);
  saveData(data);
  return data;
};

// Fonction helper pour ajouter un RDV depuis le site public
export const bookAppointment = (name: string, phone: string, date: Date, serviceName: string) => {
  const data = getData();
  
  // Chercher si le client existe déjà
  let client = data.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  
  if (client) {
    client.nextAppointment = date.toISOString();
    client.notes = (client.notes || '') + `\n[Auto] RDV pris pour ${serviceName}`;
    updateClient(client);
  } else {
    const newClient: Client = {
      id: Date.now().toString(),
      name: name,
      instagram: phone,
      notes: `Nouvelle cliente (Site Web).\nService: ${serviceName}`,
      totalVisits: 0,
      lastVisit: new Date().toISOString(),
      nextAppointment: date.toISOString()
    };
    addClient(newClient);
  }
};
