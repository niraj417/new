import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Flow { id: string; name: string; balance: number; budget: number; icon: string; status: string; participants: string[]; iconColor?: string; }

const FlowsList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [filter, setFilter] = useState<'owned' | 'shared' | 'archived'>('owned');

    useEffect(() => {
        if (!currentUser) return;
        const fetchFlows = async () => {
            const field = filter === 'owned' ? 'adminId' : filter === 'shared' ? 'participantIds' : 'archived';
            const op = filter === 'shared' ? 'array-contains' : '==';
            const val = filter === 'archived' ? true : currentUser.uid;
            const q = query(collection(db, 'flows'), where(field, op, val), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setFlows(snap.docs.map(d => ({ id: d.id, ...d.data() } as Flow)));
        };
        fetchFlows();
    }, [currentUser, filter]);

    const iconColors = ['bg-primary/10 text-primary', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md z-10">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Money Flows</h2>
                <button className="flex w-12 items-center justify-end text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-2xl">search</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 p-4 overflow-x-auto hide-scrollbar">
                {(['owned', 'shared', 'archived'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 ${filter === f ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    >
                        <p className="text-sm font-medium leading-normal capitalize">{f === 'owned' ? 'Owned by me' : f === 'shared' ? 'Shared with me' : 'Archived'}</p>
                    </button>
                ))}
            </div>

            {/* Flow List */}
            <div className="px-4 pb-32 space-y-4">
                {flows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl">account_tree</span>
                        <p className="text-slate-500 text-sm">No flows here yet</p>
                        <button onClick={() => navigate('/create-flow')} className="text-sm text-primary font-bold">Create your first flow →</button>
                    </div>
                )}
                {flows.map((flow, i) => {
                    const spent = flow.budget - flow.balance;
                    const pct = flow.budget > 0 ? Math.round((spent / flow.budget) * 100) : 0;
                    return (
                        <div key={flow.id} onClick={() => navigate(`/flow/${flow.id}`)} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${iconColors[i % iconColors.length]}`}>
                                        <span className="material-symbols-outlined">{flow.icon || 'account_tree'}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{flow.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`flex h-2 w-2 rounded-full ${flow.status === 'archived' ? 'bg-slate-400' : flow.status === 'paused' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{flow.status || 'Active'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    {(flow.participants || []).slice(0, 3).map((_, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-600"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-end mt-4 mb-2">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Spent</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        ₹{spent.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ ₹{flow.budget?.toLocaleString('en-IN')}</span>
                                    </p>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{pct}%</p>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-full rounded-full bg-primary dark:bg-blue-500 transition-all" style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FAB */}
            <button onClick={() => navigate('/create-flow')} className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-20">
                <span className="material-symbols-outlined text-2xl">add</span>
            </button>
        </div>
    );
};

export default FlowsList;
