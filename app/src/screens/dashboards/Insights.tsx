import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SpendEntry { name: string; value: number; color: string; }
interface BudgetEntry { flow: string; spent: number; budget: number; }

const COLORS = ['#0a243e', '#2563eb', '#7c3aed', '#16a34a', '#ca8a04', '#dc2626'];

const Insights = () => {
    const { currentUser } = useAuth();
    const [categories, setCategories] = useState<SpendEntry[]>([]);
    const [budgets, setBudgets] = useState<BudgetEntry[]>([]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            const txQ = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
            const txSnap = await getDocs(txQ);
            const catMap: Record<string, number> = {};
            txSnap.docs.forEach(d => {
                const data = d.data();
                if (data.amount < 0) {
                    const cat = data.category || 'Uncategorized';
                    catMap[cat] = (catMap[cat] || 0) + Math.abs(data.amount);
                }
            });
            setCategories(Object.entries(catMap).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })));

            const flowQ = query(collection(db, 'flows'), where('adminId', '==', currentUser.uid));
            const flowSnap = await getDocs(flowQ);
            setBudgets(flowSnap.docs.map(d => {
                const data = d.data();
                return { flow: data.name, spent: data.budget - data.balance, budget: data.budget };
            }));
        };
        fetchData();
    }, [currentUser]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">Spending Insights</h1>
                <button className="text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined">tune</span>
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Spending by Category */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Spending by Category</h3>
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                            <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">pie_chart</span>
                            <p className="text-sm text-slate-400">No spending data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={categories} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {categories.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Flow Budget Usage */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Flow Budget Usage</h3>
                    {budgets.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                            <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">bar_chart</span>
                            <p className="text-sm text-slate-400">No flows yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={budgets}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="flow" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                <Legend />
                                <Bar dataKey="spent" name="Spent" fill="#0a243e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Insights;
