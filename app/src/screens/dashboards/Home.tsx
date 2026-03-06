import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface Flow { id: string; name: string; balance: number; icon: string; status: string; participantCount: number; }
interface Transaction { id: string; merchant: string; flowName: string; amount: number; createdAt: any; type: string; }

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const displayName = userProfile?.name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'there';

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            const flowsQ = query(collection(db, 'flows'), where('adminId', '==', currentUser.uid), limit(5));
            const flowsSnap = await getDocs(flowsQ);
            setFlows(flowsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Flow)));

            const txQ = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'), limit(5));
            const txSnap = await getDocs(txQ);
            setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        };
        fetchData();
    }, [currentUser]);

    return (
        <div className="flex-1 flex flex-col pb-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">FlowPay</h1>
                <div
                    className="size-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700 bg-slate-300 flex items-center justify-center"
                    style={userProfile?.profileImage ? { backgroundImage: `url(${userProfile.profileImage})` } : {}}
                >
                    {!userProfile?.profileImage && (
                        <span className="material-symbols-outlined text-slate-600 text-lg">person</span>
                    )}
                </div>
            </div>

            {/* Welcome Section */}
            <div className="p-6 bg-white dark:bg-slate-900">
                <h2 className="text-2xl font-bold leading-tight tracking-tight mb-1 text-slate-900 dark:text-slate-100">{greeting}, {displayName}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Total Managed Balance</p>
                <div className="text-4xl font-extrabold text-primary dark:text-slate-100 tracking-tight">
                    ₹{(userProfile?.walletBalance || 0).toLocaleString('en-IN')}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 px-6 py-4 bg-white dark:bg-slate-900 justify-between">
                <button onClick={() => navigate('/wallet')} className="flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                    <span className="text-xs font-bold tracking-wide">Add Money</span>
                </button>
                <button onClick={() => navigate('/create-flow')} className="flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-md">
                    <span className="material-symbols-outlined text-xl">account_tree</span>
                    <span className="text-xs font-bold tracking-wide">Create Flow</span>
                </button>
                <button onClick={() => navigate('/scan')} className="flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                    <span className="text-xs font-bold tracking-wide">Scan & Pay</span>
                </button>
            </div>

            {/* Active Flows */}
            <div className="mt-2 py-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between px-6 mb-4">
                    <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Active Flows</h3>
                    <button onClick={() => navigate('/flows')} className="text-primary dark:text-slate-300 text-sm font-medium">See all</button>
                </div>
                <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x hide-scrollbar">
                    {flows.length === 0 ? (
                        <div className="snap-start shrink-0 w-72 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">account_tree</span>
                            <p className="text-sm text-slate-500">No active flows yet</p>
                            <button onClick={() => navigate('/create-flow')} className="text-xs text-primary font-bold">Create your first flow →</button>
                        </div>
                    ) : (
                        flows.map(flow => (
                            <div key={flow.id} onClick={() => navigate(`/flow/${flow.id}`)} className="snap-start shrink-0 w-72 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 dark:bg-primary/30 rounded-lg">
                                        <span className="material-symbols-outlined text-primary dark:text-slate-200">{flow.icon || 'account_tree'}</span>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">{flow.status || 'Active'}</span>
                                </div>
                                <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-slate-100">{flow.name}</h4>
                                <p className="text-2xl font-bold text-primary dark:text-slate-100 mb-4">₹{flow.balance?.toLocaleString('en-IN') || 0}</p>
                                <div className="flex items-center justify-between mt-auto border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(flow.participantCount || 1, 3))].map((_, i) => (
                                            <div key={i} className="size-6 rounded-full border border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-500"></div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{flow.participantCount || 1} Participants</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-2 py-6 bg-white dark:bg-slate-900 px-6 flex-1">
                <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Recent Activity</h3>
                <div className="flex flex-col gap-4">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>
                    ) : transactions.map(tx => (
                        <div key={tx.id} className="flex items-center gap-4">
                            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                <span className={`material-symbols-outlined text-lg ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {tx.amount > 0 ? 'arrow_downward' : 'storefront'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{tx.merchant}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tx.flowName}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{tx.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
