
import React, { useEffect, useState } from 'react';
import { getData } from '../../services/storage';
import { AppData } from '../../types';
import { Euro, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ShoppingBag, Award, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  useEffect(() => {
    setData(getData());
  }, []);

  if (!data) return null;

  // --- CALCULS KPI ---

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // 1. Chiffre d'affaires MENSUEL
  const monthlyRevenue = data.transactions
    .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRevenue = data.transactions.reduce((acc, t) => acc + t.amount, 0);

  // 2. Charges du mois (Commandes Fournisseurs)
  const monthlyExpenses = data.orders
    .filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // 3. Résultat Mensuel
  const monthlyResult = monthlyRevenue - monthlyExpenses;

  // 4. Top Prestations
  const performanceByService: Record<string, number> = {};
  data.transactions
    .filter(t => t.category === 'Prestation')
    .forEach(t => {
        performanceByService[t.description] = (performanceByService[t.description] || 0) + t.amount;
    });
  
  const topServices = Object.entries(performanceByService)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }));

  // 5. Top Formations (REMPLACEMENT DE TOP PRODUITS)
  const performanceByTraining: Record<string, number> = {};
  data.transactions
    .filter(t => t.category === 'Formation')
    .forEach(t => {
        performanceByTraining[t.description] = (performanceByTraining[t.description] || 0) + t.amount;
    });
  
  const topTrainings = Object.entries(performanceByTraining)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }));

    // 6. Répartition Revenue
  const revenueByCategory = [
      { name: 'Prestations', value: data.transactions.filter(t => t.category === 'Prestation').reduce((acc, t) => acc + t.amount, 0), color: '#1c1917' },
      { name: 'Formations', value: data.transactions.filter(t => t.category === 'Formation').reduce((acc, t) => acc + t.amount, 0), color: '#D4A373' },
      { name: 'Ventes', value: data.transactions.filter(t => t.category === 'Vente').reduce((acc, t) => acc + t.amount, 0), color: '#A8A29E' },
  ].filter(item => item.value > 0);


  // --- GRAPHIQUE EVOLUTION ANNUELLE ---
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  const chartData = months.map((monthName, index) => {
    const total = data.transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && d.getMonth() === index;
      })
      .reduce((acc, t) => acc + t.amount, 0);
      
    return { name: monthName, total };
  });

  return (
    <div className="flex flex-col gap-8 pb-10 h-[calc(100vh-100px)]">
      
      {/* MAIN DASHBOARD */}
      <div className="flex-1 space-y-8 overflow-y-auto pr-2">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Tableau de bord</h1>
            <p className="text-stone-500 mt-1">Pilotage de l'activité sur l'année.</p>
        </div>

        {/* KPI Cards Row (Refonte) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="CA Mensuel" 
                value={`${monthlyRevenue.toFixed(0)} €`} 
                icon={Euro} 
                trend="Ce mois-ci"
                color="gold"
            />
            <StatCard 
                title="Charges du mois" 
                value={`${monthlyExpenses.toFixed(0)} €`} 
                icon={TrendingDown} 
                subtext="Fournisseurs"
                color="gold"
            />
            <StatCard 
                title="Résultat Mensuel" 
                value={`${monthlyResult.toFixed(0)} €`} 
                icon={TrendingUp} 
                trend="Bénéfice estimé"
                color="gold"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart: Evolution Annuelle */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-stone-800 font-serif">Évolution du Chiffre d'Affaires</h2>
                    <div className="flex gap-2">
                        {[2023, 2024, 2025].map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${
                                    selectedYear === year 
                                    ? 'bg-[#D4A373] text-white border-[#D4A373]' 
                                    : 'bg-white text-[#D4A373] border-[#D4A373] hover:bg-[#FAEDCD]'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#D4A373', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#D4A373', fontSize: 12}} />
                        <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #D4A373', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        cursor={{fill: '#FAEDCD', opacity: 0.3}}
                        formatter={(value: number) => [`${value} €`, 'CA']}
                        />
                        <Bar dataKey="total" fill="#D4A373" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Distribution Donut */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373] flex flex-col">
                <h2 className="text-lg font-bold text-stone-800 mb-6 font-serif">Sources de Revenus (Global)</h2>
                <div className="flex-1 min-h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={revenueByCategory}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {revenueByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#D4A373" strokeWidth={1} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border:'1px solid #D4A373'}} />
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-bold text-stone-900">{totalRevenue}€</span>
                        <span className="text-xs text-[#D4A373]">Total</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {revenueByCategory.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                                <span className="text-stone-600">{cat.name}</span>
                            </div>
                            <span className="font-bold text-stone-900">{cat.value} €</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PROFITABILITY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Services */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]">
                <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-[#FAEDCD] text-[#D4A373] rounded-lg">
                            <Award size={20} className="fill-[#D4A373]" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-800 font-serif">Top Prestations Rentables</h2>
                </div>
                <div className="space-y-4">
                    {topServices.length > 0 ? topServices.map((service, idx) => (
                        <div key={idx} className="relative">
                            <div className="flex justify-between items-center mb-1 relative z-10">
                                <span className="font-bold text-sm text-stone-800 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#FAEDCD] flex items-center justify-center text-[10px] text-[#D4A373] font-bold border border-[#D4A373]">{idx + 1}</span>
                                    {service.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-stone-900">{service.value} €</span>
                            </div>
                            <div className="h-2 w-full bg-[#FAEDCD] rounded-full overflow-hidden">
                                <div 
                                    style={{width: `${(service.value / topServices[0].value) * 100}%`}} 
                                    className="h-full bg-[#D4A373] rounded-full"
                                />
                            </div>
                        </div>
                    )) : (
                        <p className="text-stone-400 italic text-sm">Pas assez de données.</p>
                    )}
                </div>
            </div>

            {/* Top Formations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373]">
                <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-[#FAEDCD] text-[#D4A373] rounded-lg">
                            <GraduationCap size={20} className="fill-[#D4A373]" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-800 font-serif">Top Formations</h2>
                </div>
                <div className="space-y-4">
                    {topTrainings.length > 0 ? topTrainings.map((training, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#FAEDCD]/30 transition-colors border border-transparent hover:border-[#D4A373]/30">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-[#D4A373]">#{idx + 1}</span>
                                    <span className="font-medium text-sm text-stone-700">{training.name}</span>
                                </div>
                                <span className="font-bold text-[#D4A373] bg-white border border-[#D4A373] px-2 py-1 rounded shadow-sm">
                                    {training.value} €
                                </span>
                        </div>
                    )) : (
                            <div className="flex flex-col items-center justify-center h-32 text-stone-400 text-sm border-2 border-dashed border-[#D4A373]/30 rounded-xl">
                                <GraduationCap size={24} className="mb-2 opacity-50 text-[#D4A373]" />
                                Aucune formation vendue
                            </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, subtext }: any) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A373] flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between z-10">
            <div>
                <p className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-bold text-stone-900 font-serif">{value}</h3>
            </div>
            <div className="p-2 rounded-lg transition-colors bg-[#FAEDCD] text-[#D4A373]">
                <Icon size={20} className="fill-[#D4A373]" />
            </div>
            </div>
            {(trend || subtext) && (
                <div className="flex items-center gap-1 text-xs font-medium text-stone-500 mt-auto">
                    {trend && <ArrowUpRight size={12} className="text-[#D4A373]" />}
                    {trend && <span className="text-[#D4A373] mr-1">{trend}</span>}
                    {subtext && <span className="text-stone-400">{subtext}</span>}
                </div>
            )}
            <div className="absolute -bottom-4 -right-4 text-[#D4A373] opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <Icon size={100} className="fill-[#D4A373]" />
            </div>
        </div>
    );
};
