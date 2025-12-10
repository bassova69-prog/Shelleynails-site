

import { AppData, Client, Transaction, Supplier, GiftCard, Order, TaxDeclaration, InventoryItem, CoachingRequest, CollabRequest } from '../types';

const STORAGE_KEY = 'shelleynails_data_v6';
const PIN_STORAGE_KEY = 'shelleynails_admin_pin';

const MOCK_DATA: AppData = {
  clients: [
    { id: '1', name: 'Valerie Basso', instagram: 'https://www.instagram.com/valerie_basso/', notes: 'Adore le Babyboomer. Allergique au latex.', totalVisits: 8, lastVisit: '2023-10-15', nextAppointment: new Date(Date.now() + 86400000).toISOString() },
    { id: '2', name: 'Julie Dubois', instagram: '@juliedub', notes: 'Ongles très courts, rongés.', totalVisits: 2, lastVisit: '2023-09-20' },
    { id: '3', name: 'Clara Thomas', instagram: '@clara_nails', notes: 'Aime le Nail Art complexe (strass, 3D).', totalVisits: 12, lastVisit: '2023-10-25', nextAppointment: new Date(Date.now() + 172800000).toISOString() },
    { id: '4', name: 'Emma Petit', instagram: '@emma_p', notes: 'Préfère le rouge classique. Retardataire chronique.', totalVisits: 5, lastVisit: '2023-10-01' },
  ],
  transactions: [
    { id: '1', date: '2023-10-25', amount: 55, type: 'Carte Cadeaux', category: 'Prestation', description: 'Pose complète Chablon' },
    { id: '2', date: '2023-10-25', amount: 40, type: 'Especes', category: 'Prestation', description: 'Remplissage Gel' },
    { id: '3', date: '2023-10-26', amount: 350, type: 'Virement', category: 'Formation', description: 'Acompte Formation Base' },
    { id: '4', date: '2023-10-26', amount: 15, type: 'Carte Cadeaux', category: 'Vente', description: 'Huile à cuticules' },
    { id: '5', date: '2023-10-27', amount: 65, type: 'Carte Cadeaux', category: 'Prestation', description: 'Nail Art 3D' },
    { id: '6', date: '2023-10-27', amount: 55, type: 'Carte Cadeaux', category: 'Prestation', description: 'Pose complète Chablon' },
    { id: '7', date: '2023-10-28', amount: 45, type: 'Especes', category: 'Prestation', description: 'Remplissage Gel' },
    { id: '8', date: '2023-10-28', amount: 15, type: 'Carte Cadeaux', category: 'Vente', description: 'Huile à cuticules' },
  ],
  suppliers: [
    { id: '1', name: 'Passione Beauty', email: 'contact@passionebeauty.fr', website: 'https://www.passionebeauty.com', products: ['Gel Construction Alpha', 'Aqua Gloss', 'Couleurs SP', 'Pinceaux', 'Lampes UV'], notes: 'Le géant européen. Très bon rapport qualité/prix pour les couleurs.' },
    { id: '2', name: 'OA Nail System', email: 'info@ongles-access.fr', website: 'https://www.ongles-access.fr', products: ['Structura', 'Gels Fibres', 'Wonderlack', 'Chablons'], notes: 'Marque française technique. Leurs gels de construction sont très solides.' },
    { id: '3', name: 'Purple Professional', email: 'sales@purpleprofessional.pt', website: 'https://purpleprofessional.pt', products: ['Rubber Base', 'Top Coat Milky', 'Cleaner Berry', 'Low Heat Gel'], notes: 'Leur Top Coat est incroyable, ne raye pas.' },
    { id: '4', name: 'Ongle24', email: 'service@ongle24.com', website: 'https://www.ongle24.com', products: ['Limes 100/180', 'Blocs polisseurs', 'Coton cellulose', 'Acetone'], notes: 'Idéal pour les consommables et les basiques pas chers.' },
    { id: '5', name: 'Mnails', email: 'contact@mnails.fr', website: 'https://www.mnails.fr', products: ['Stickers', 'Foils', 'Paillettes vrac', 'Water Decals'], notes: 'La référence pour les décos et le Nail Art facile.' },
    { id: '6', name: 'NC Beauty Pro', email: 'hello@nc-beautypro.fr', website: 'https://www.nc-beautypro.fr', products: ['Staleks Ciseaux', 'Embouts Diamant', 'Pousse cuticules', 'Gants Nitrile'], notes: 'Distributeur officiel Staleks. Le top pour l\'outillage.' },
    { id: '7', name: 'The GelBottle', email: 'support@thegelbottle.com', website: 'https://thegelbottle.com', products: ['BIAB (Builder In A Bottle)', 'GelPot', 'DesignEx Pro'], notes: 'Marque Premium tendance. Le BIAB est un best-seller.' },
    { id: '8', name: 'Amazon Business', email: '', website: 'https://amazon.fr', products: ['Masques noirs', 'Essuie-tout', 'Gants S', 'Sacs poubelle'], notes: 'Pour l\'hygiène et le jetable (livraison rapide).' },
  ],
  giftCards: [],
  orders: [
    { 
      id: '1', 
      supplierId: '4', 
      supplierName: 'Ongle24', 
      date: new Date(Date.now() - 432000000).toISOString(), 
      status: 'Livrée', 
      items: [{ name: 'Gel Monophase', quantity: 2 }, { name: 'Cleaner', quantity: 1 }],
      totalAmount: 45.50
    },
    { 
      id: '2', 
      supplierId: '8', 
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

// --- GESTION DU PIN ADMIN ---
export const getAdminPin = (): string => {
  return localStorage.getItem(PIN_STORAGE_KEY) || '123456';
};

export const setAdminPin = (newPin: string) => {
  localStorage.setItem(PIN_STORAGE_KEY, newPin);
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

export const deleteClient = (id: string) => {
  const data = getData();
  data.clients = data.clients.filter(c => c.id !== id);
  saveData(data);
  return data;
};

export const addSupplier = (s: Supplier) => {
  const data = getData();
  data.suppliers.push(s);
  saveData(data);
  return data;
};

export const updateSupplier = (s: Supplier) => {
  const data = getData();
  data.suppliers = data.suppliers.map(sup => sup.id === s.id ? s : sup);
  saveData(data);
  return data;
};

export const deleteSupplier = (id: string) => {
  const data = getData();
  data.suppliers = data.suppliers.filter(s => s.id !== id);
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
    const card = data.giftCards[cardIndex];

    // Si la carte est déjà utilisée, on ne permet pas de revenir en arrière
    if (card.isRedeemed) {
      return data;
    }

    // Passage au statut Utilisée (irréversible via cette fonction)
    data.giftCards[cardIndex].isRedeemed = true;

    // --- AUTOMATISATION COMPTABILITÉ ---
    // On crée une transaction d'encaissement uniquement lors du passage à 'Utilisée'
    const newTx: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: card.amount,
        type: 'Carte Cadeaux',
        category: 'Prestation', // Par défaut
        description: `Encaissement Carte Cadeau ${card.code} (de ${card.from} pour ${card.to})`
    };
    data.transactions.push(newTx);

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