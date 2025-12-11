
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

  const monthlyRevenue = data.transactions
    .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRevenue = data.transactions.reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpenses = data.orders
    .filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const monthlyResult = monthlyRevenue - monthlyExpenses;

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

  const revenueByCategory = [
      { name: 'Prestations', value: data.transactions.filter(t => t.category === 'Prestation').reduce((acc, t) => acc + t.amount, 0), color: '#1c1917' },
      { name: 'Formations', value: data.transactions.filter(t => t.category === 'Formation').reduce((acc, t) => acc + t.amount, 0), color: '#D4A373' },
      { name: 'Ventes', value: data.transactions.filter(t => t.category === 'Vente').reduce((acc, t) => acc + t.amount, 0), color: '#A8A29E' },
  ].filter(item => item.value > 0);

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
    <div className="flex flex-col gap-8 pb-10">
      
      {/* MAIN DASHBOARD */}
      <div className="space-y-8">
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
                Tableau de bord
            </h1>
            <p className="text-stone-600 mt-2 font-medium">Pilotage de l'activité sur l'année.</p>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="CA Mensuel" 
                value={`${monthlyRevenue.toFixed(0)} €`} 
                icon={Euro} 
                trend="Ce mois-ci"
            />
            <StatCard 
                title="Charges du mois" 
                value={`${monthlyExpenses.toFixed(0)} €`} 
                icon={TrendingDown} 
                subtext="Fournisseurs"
            />
            <StatCard 
                title="Résultat Mensuel" 
                value={`${monthlyResult.toFixed(0)} €`} 
                icon={TrendingUp} 
                trend="Bénéfice estimé"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40">
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
                                    : 'bg-white/30 text-[#D4A373] border-[#D4A373]/30 hover:bg-[#FAEDCD]/50'
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6d3d1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                        <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #D4A373', background: 'rgba(255, 255, 255, 0.9)', padding: '12px' }}
                        cursor={{fill: '#FAEDCD', opacity: 0.3}}
                        formatter={(value: number) => [`${value} €`, 'CA']}
                        />
                        <Bar dataKey="total" fill="#D4A373" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Distribution */}
            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 flex flex-col">
                <h2 className="text-lg font-bold text-stone-800 mb-6 font-serif">Sources de Revenus</h2>
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
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)'}} />
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
            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40">
                <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-[#FAEDCD] text-[#D4A373] rounded-lg shadow-sm">
                            <Award size={20} className="fill-[#D4A373]" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-800 font-serif">Top Prestations</h2>
                </div>
                <div className="space-y-4">
                    {topServices.length > 0 ? topServices.map((service, idx) => (
                        <div key={idx} className="relative">
                            <div className="flex justify-between items-center mb-1 relative z-10">
                                <span className="font-bold text-sm text-stone-800 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[10px] text-[#D4A373] font-bold border border-[#D4A373]">{idx + 1}</span>
                                    {service.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-stone-900">{service.value} €</span>
                            </div>
                            <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
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
            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40">
                <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-[#FAEDCD] text-[#D4A373] rounded-lg shadow-sm">
                            <GraduationCap size={20} className="fill-[#D4A373]" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-800 font-serif">Top Formations</h2>
                </div>
                <div className="space-y-4">
                    {topTrainings.length > 0 ? topTrainings.map((training, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/40 transition-colors border border-transparent hover:border-white/30">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-[#D4A373]">#{idx + 1}</span>
                                    <span className="font-medium text-sm text-stone-700">{training.name}</span>
                                </div>
                                <span className="font-bold text-[#D4A373] bg-white/50 border border-[#D4A373]/30 px-2 py-1 rounded shadow-sm">
                                    {training.value} €
                                </span>
                        </div>
                    )) : (
                            <div className="flex flex-col items-center justify-center h-32 text-stone-400 text-sm border-2 border-dashed border-[#D4A373]/30 rounded-xl bg-white/20">
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
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40 flex flex-col justify-between h-32 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between z-10">
            <div>
                <p className="text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-bold text-stone-900 font-serif">{value}</h3>
            </div>
            <div className="p-2 rounded-lg bg-[#FAEDCD] text-[#D4A373] shadow-sm">
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
            <div className="absolute -bottom-4 -right-4 text-[#D4A373] opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <Icon size={100} className="fill-[#D4A373]" />
            </div>
        </div>
    );
};
