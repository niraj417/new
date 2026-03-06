import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, collection, addDoc, updateDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

interface Transaction { id: string; merchant: string; amount: number; createdAt: any; }

const Wallet = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const fetchTx = async () => {
            const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        };
        fetchTx();
    }, [currentUser]);

    const handleAddMoney = async () => {
        if (!amount || !currentUser) return;
        setProcessing(true);
        try {
            const num = parseFloat(amount);
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                merchant: 'Wallet Top-up',
                flowName: 'Main Wallet',
                amount: num,
                type: 'credit',
                createdAt: serverTimestamp(),
            });
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { walletBalance: (userProfile?.walletBalance || 0) + num });
            setMsg(`₹${num.toLocaleString('en-IN')} added to your wallet!`);
            setAmount('');
            setShowAddMoney(false);
        } catch (e) {
            setMsg('Failed to add money. Please try again.');
        }
        setProcessing(false);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="flex items-center p-4 justify-between bg-primary text-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-start">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">My Wallet</h1>
                <div className="size-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                {/* Balance Card */}
                <div className="p-4 pt-6">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-slate-800 p-6 shadow-lg text-white">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-white/80 text-sm font-medium tracking-wide uppercase">Total Balance</span>
                                <span className="material-symbols-outlined text-white/50 text-xl">account_balance_wallet</span>
                            </div>
                            <div>
                                <p className="text-4xl font-bold tracking-tight mb-1">₹{(userProfile?.walletBalance || 0).toLocaleString('en-IN')}</p>
                                <p className="text-white/70 text-sm">Available for flows</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-10 bg-white/20 rounded flex items-center justify-center">
                                        <span className="text-[10px] font-bold">VISA</span>
                                    </div>
                                    <span className="text-sm text-white/80">•••• 4242</span>
                                </div>
                                <button className="text-sm font-medium text-white hover:text-white/80 flex items-center gap-1">
                                    Details <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-4 py-2">
                    <button onClick={() => setShowAddMoney(true)} className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl h-20 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                        <span className="text-sm font-semibold">Add Money</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl h-20 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-2xl">transform</span>
                        <span className="text-sm font-semibold">Transfer</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl h-20 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-2xl">more_horiz</span>
                        <span className="text-sm font-semibold">More</span>
                    </button>
                </div>

                {/* Success/Error Message */}
                {msg && (
                    <div className="mx-4 mt-2 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium text-center">
                        {msg}
                    </div>
                )}

                {/* Add Money Form */}
                {showAddMoney && (
                    <div className="mx-4 mt-4 p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Add Money to Wallet</h3>
                        <input
                            type="number"
                            placeholder="Enter amount (₹)"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowAddMoney(false)} className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">Cancel</button>
                            <button onClick={handleAddMoney} disabled={processing || !amount} className="flex-1 h-12 rounded-xl bg-primary text-white font-bold disabled:opacity-50">
                                {processing ? 'Processing...' : 'Add Money'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="mt-6">
                    <div className="flex items-center justify-between px-4 pb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                        <button className="text-sm font-medium text-primary dark:text-slate-300">View All</button>
                    </div>
                    <div className="flex flex-col gap-1 px-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-primary/10 dark:bg-primary/30 text-primary dark:text-slate-200'}`}>
                                    <span className="material-symbols-outlined">{tx.amount > 0 ? 'arrow_downward' : 'water_drop'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold truncate text-slate-900 dark:text-slate-100">{tx.merchant}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-base font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{tx.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Wallet;
