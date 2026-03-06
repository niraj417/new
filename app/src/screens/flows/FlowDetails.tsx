import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Flow { name: string; balance: number; budget: number; status: string; icon: string; rules: any; limits: any; participants: any[]; }
interface Transaction { id: string; merchant: string; amount: number; category: string; createdAt: any; status: string; }

const FlowDetails = () => {
    const { flowId } = useParams<{ flowId: string }>();
    const navigate = useNavigate();
    const [flow, setFlow] = useState<Flow | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tab, setTab] = useState<'transactions' | 'members' | 'rules'>('transactions');

    useEffect(() => {
        if (!flowId) return;
        const fetchData = async () => {
            const flowSnap = await getDoc(doc(db, 'flows', flowId));
            if (flowSnap.exists()) setFlow(flowSnap.data() as Flow);

            const txQ = query(collection(db, 'transactions'), where('flowId', '==', flowId), orderBy('createdAt', 'desc'));
            const txSnap = await getDocs(txQ);
            setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        };
        fetchData();
    }, [flowId]);

    if (!flow) return (
        <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    const spent = flow.budget - flow.balance;
    const pct = flow.budget > 0 ? Math.round((spent / flow.budget) * 100) : 0;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="flex items-center p-4 justify-between bg-primary text-white">
                <button onClick={() => navigate(-1)} className="flex size-10 items-start">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1 text-center truncate">{flow.name}</h1>
                <button className="flex size-10 items-center justify-end">
                    <span className="material-symbols-outlined text-2xl">more_vert</span>
                </button>
            </header>

            {/* Budget Card */}
            <div className="p-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-slate-800 p-5 shadow-lg text-white">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 text-sm uppercase tracking-wide">Balance</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${flow.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{flow.status || 'Active'}</span>
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight mb-3">₹{flow.balance?.toLocaleString('en-IN')}</p>
                        <div className="h-1.5 w-full rounded-full bg-white/20 mb-2">
                            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                            <span>₹{spent.toLocaleString('en-IN')} spent</span>
                            <span>₹{flow.budget?.toLocaleString('en-IN')} budget</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
                {(['transactions', 'members', 'rules'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 pb-24">
                {tab === 'transactions' && (
                    <div className="space-y-1">
                        {transactions.length === 0 && (
                            <div className="py-10 text-center text-slate-400 text-sm">No transactions for this flow yet</div>
                        )}
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">storefront</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{tx.merchant}</p>
                                    <p className="text-xs text-slate-500 truncate">{tx.category}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-slate-500">{tx.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'members' && (
                    <div className="space-y-2">
                        {(flow.participants || []).map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.email}</p>
                                    <p className="text-xs text-slate-500">{p.role}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.role === 'Owner' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{p.role}</span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'rules' && (
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Spending Rules</h4>
                            <div className="space-y-2">
                                {flow.rules?.allowedCategories?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Allowed Categories</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {flow.rules.allowedCategories.map((c: string) => <span key={c} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">{c}</span>)}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Approval Required</span>
                                    <span className={`text-xs font-bold ${flow.rules?.approvalRequired ? 'text-red-500' : 'text-green-500'}`}>{flow.rules?.approvalRequired ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Receipt Required</span>
                                    <span className={`text-xs font-bold ${flow.rules?.receiptRequired ? 'text-red-500' : 'text-green-500'}`}>{flow.rules?.receiptRequired ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                        {flow.limits && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Spending Limits</h4>
                                {[['Per Transaction', flow.limits.perTransaction], ['Daily', flow.limits.dailyLimit], ['Monthly', flow.limits.monthlyLimit]].map(([label, val]) => (
                                    val && <div key={label as string} className="flex justify-between py-1.5 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">₹{(val as number).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowDetails;
