import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

interface Flow { id: string; name: string; balance: number; }

const ScanPay = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [selectedFlow, setSelectedFlow] = useState('');
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const fetchFlows = async () => {
            const q = query(collection(db, 'flows'), where('adminId', '==', currentUser.uid));
            const snap = await getDocs(q);
            setFlows(snap.docs.map(d => ({ id: d.id, ...d.data() } as Flow)));
        };
        fetchFlows();
    }, [currentUser]);

    const handlePay = async () => {
        if (!selectedFlow || !amount || !merchant || !currentUser) return;
        setProcessing(true);
        try {
            const num = parseFloat(amount);
            const flow = flows.find(f => f.id === selectedFlow);
            if (!flow || flow.balance < num) {
                alert('Insufficient flow balance!');
                setProcessing(false);
                return;
            }
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                flowId: selectedFlow,
                flowName: flow.name,
                merchant,
                category: category || 'General',
                amount: -num,
                type: 'debit',
                status: 'approved',
                createdAt: serverTimestamp(),
            });
            await updateDoc(doc(db, 'flows', selectedFlow), { balance: flow.balance - num });
            setSuccess(true);
        } catch (e) {
            alert('Payment failed. Please try again.');
        }
        setProcessing(false);
    };

    const categories = ['Food & Drinks', 'Transport', 'Utilities', 'Hardware', 'General', 'Medical', 'Entertainment'];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="flex items-center p-4 justify-between bg-primary text-white">
                <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-start">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">Scan & Pay</h1>
                <div className="size-10"></div>
            </header>

            <div className="p-4 space-y-4 pb-24">
                {success ? (
                    <div className="flex flex-col items-center justify-center pt-12 gap-4">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Payment Successful!</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center">₹{amount} paid to <strong>{merchant}</strong></p>
                        <button onClick={() => { setSuccess(false); setAmount(''); setMerchant(''); }} className="mt-4 h-12 px-8 rounded-xl bg-primary text-white font-bold">Pay Again</button>
                        <button onClick={() => navigate('/home')} className="h-12 px-8 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">Go Home</button>
                    </div>
                ) : (
                    <>
                        {/* QR Placeholder */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col items-center py-6 gap-3">
                                <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-8xl">qr_code_scanner</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Point camera at QR Code to scan merchant</p>
                                <p className="text-xs text-slate-400">or enter merchant details below</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Merchant Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Hardware Store"
                                    value={merchant}
                                    onChange={e => setMerchant(e.target.value)}
                                    className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Pay from Flow</label>
                                <select
                                    value={selectedFlow}
                                    onChange={e => setSelectedFlow(e.target.value)}
                                    className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select a flow</option>
                                    {flows.map(f => <option key={f.id} value={f.id}>{f.name} — ₹{f.balance?.toLocaleString('en-IN')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${category === cat ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={processing || !selectedFlow || !amount || !merchant}
                            className="w-full h-14 rounded-xl bg-primary text-white font-bold text-base shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : `Pay ₹${amount || '0'}`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ScanPay;
