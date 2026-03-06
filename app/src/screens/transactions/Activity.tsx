import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Transaction { id: string; merchant: string; flowName: string; amount: number; category: string; status: string; createdAt: any; }

const Activity = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchTx = async () => {
            const q = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        };
        fetchTx();
    }, [currentUser]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">Activity</h1>
                <button className="text-slate-500">
                    <span className="material-symbols-outlined">filter_list</span>
                </button>
            </div>

            <div className="pb-24">
                {transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-16 gap-3">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl">receipt_long</span>
                        <p className="text-slate-500 text-sm">No transactions yet</p>
                        <button onClick={() => navigate('/scan')} className="text-sm text-primary font-bold">Make a payment →</button>
                    </div>
                )}
                {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <span className={`material-symbols-outlined ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                {tx.amount > 0 ? 'arrow_downward' : 'storefront'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{tx.merchant}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tx.flowName} • {tx.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-slate-500">{tx.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Activity;
