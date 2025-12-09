

export interface Client {
  id: string;
  name: string;
  instagram: string;
  notes: string;
  totalVisits: number;
  lastVisit: string; // ISO date
  nextAppointment?: string; // ISO date
}

export interface Transaction {
  id: string;
  date: string; // ISO date
  amount: number;
  type: 'Especes' | 'Carte Cadeaux' | 'Virement' | 'Cheque';
  category: 'Prestation' | 'Formation' | 'Vente' | 'Autre';
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  website: string;
  email?: string; // Ajout email contact commande
  products: string[];
  notes: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string; // ISO date
  status: 'En attente' | 'Livrée';
  items: OrderItem[];
  totalAmount?: number; // Coût total de la commande pour calcul de marge
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  from: string;
  to: string;
  recipientEmail?: string; // Ajout pour l'envoi par mail
  message: string;
  isRedeemed: boolean;
  createdAt: string;
}

export interface TaxDeclaration {
  id: string;
  type: 'URSSAF' | 'CFE';
  period: string; // ex: "Octobre 2023" ou "2023"
  amount: number;
  date: string;
  status: 'Payée' | 'En attente';
  details?: string; // ex: "CA Services: 1200€, CA Ventes: 100€"
}

export interface InventoryItem {
  productName: string;
  quantity: number; // Stock actuel
  threshold: number; // Seuil d'alerte
  lastUpdated: string; // ISO date
}

// NOUVEAUX TYPES

export interface CoachingRequest {
  id: string;
  applicantName: string;
  instagram: string;
  selectedDate: string; // ISO date
  projectDescription: string;
  status: 'En attente' | 'Validée' | 'Refusée';
  submittedAt: string;
}

export interface CollabRequest {
  id: string;
  type: 'Marque' | 'Evénement' | 'Projet Artistique';
  contactName: string;
  email: string;
  message: string;
  submittedAt: string;
}

export interface AppData {
  clients: Client[];
  transactions: Transaction[];
  suppliers: Supplier[];
  giftCards: GiftCard[];
  orders: Order[];
  taxDeclarations: TaxDeclaration[];
  inventory: InventoryItem[];
  coachingRequests: CoachingRequest[];
  collabRequests: CollabRequest[];
}