import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const steps = ['Basics', 'Budget', 'Participants', 'Categories', 'Limits', 'Rules', 'Fund & Activate'];
const CATEGORIES = ['Food', 'Transport', 'Healthcare', 'Groceries', 'Materials', 'Fuel', 'Entertainment', 'Medical'];

const CreateFlowWizard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [flowData, setFlowData] = useState({
        name: '', description: '', budgetType: 'Monthly', budgetAmount: '',
        participants: [] as { email: string, role: string }[],
        allowedCategories: [] as string[],
        perTransactionLimit: '', dailyLimit: '', monthlyLimit: '',
        merchantRestrictions: '', approvalRequired: false, receiptRequired: false,
        autoRefill: false, initialFunding: ''
    });
    const [partEmail, setPartEmail] = useState('');
    const [partRole, setPartRole] = useState('Spender');

    const update = (k: string, v: unknown) => setFlowData(prev => ({ ...prev, [k]: v }));

    const handleAddParticipant = () => {
        if (partEmail) { update('participants', [...flowData.participants, { email: partEmail, role: partRole }]); setPartEmail(''); }
    };

    const toggleCategory = (cat: string) => {
        update('allowedCategories', flowData.allowedCategories.includes(cat)
            ? flowData.allowedCategories.filter(c => c !== cat)
            : [...flowData.allowedCategories, cat]);
    };

    const handleComplete = async () => {
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'flows'), {
                name: flowData.name, description: flowData.description,
                adminId: currentUser?.uid,
                createdAt: serverTimestamp(),
                budgetType: flowData.budgetType, budgetAmount: Number(flowData.budgetAmount),
                balance: Number(flowData.initialFunding), budget: Number(flowData.budgetAmount),
                icon: 'account_tree', status: 'active',
                participantIds: [currentUser?.uid],
                participants: [{ userId: currentUser?.uid, email: currentUser?.email, role: 'Owner' }, ...flowData.participants],
                rules: {
                    allowedCategories: flowData.allowedCategories,
                    allowedMerchants: flowData.merchantRestrictions.split(',').map(s => s.trim()).filter(Boolean),
                    receiptRequired: flowData.receiptRequired,
                    approvalRequired: flowData.approvalRequired
                },
                limits: {
                    perTransaction: Number(flowData.perTransactionLimit) || null,
                    dailyLimit: Number(flowData.dailyLimit) || null,
                    monthlyLimit: Number(flowData.monthlyLimit) || null
                },
                automations: { autoRefill: flowData.autoRefill }
            });
            navigate('/flows');
        } catch (e) { console.error(e); }
        setSubmitting(false);
    };

    const input = "w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary";

    const renderStep = () => {
        switch (activeStep) {
            case 0: return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Flow Name *</label>
                        <input className={input} placeholder="e.g. Construction Site, Trip Fund..." value={flowData.name} onChange={e => update('name', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                        <textarea className={`${input} h-24 py-3`} placeholder="What is this flow for?" value={flowData.description} onChange={e => update('description', e.target.value)} />
                    </div>
                </div>
            );
            case 1: return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Budget Period</label>
                        <select className={input} value={flowData.budgetType} onChange={e => update('budgetType', e.target.value)}>
                            {['Daily', 'Weekly', 'Monthly', 'Custom'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Budget Amount (₹)</label>
                        <input type="number" className={input} placeholder="0" value={flowData.budgetAmount} onChange={e => update('budgetAmount', e.target.value)} />
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input className={`${input} flex-1`} type="email" placeholder="Participant email" value={partEmail} onChange={e => setPartEmail(e.target.value)} />
                        <select className="rounded-xl h-12 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" value={partRole} onChange={e => setPartRole(e.target.value)}>
                            {['Manager', 'Spender', 'Viewer'].map(r => <option key={r}>{r}</option>)}
                        </select>
                        <button onClick={handleAddParticipant} className="h-12 px-4 rounded-xl bg-primary text-white font-bold text-sm">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {flowData.participants.map((p, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                                <span>{p.email} ({p.role})</span>
                                <button onClick={() => update('participants', flowData.participants.filter((_, idx) => idx !== i))} className="text-primary/70 hover:text-primary">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 3: return (
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${flowData.allowedCategories.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                            {cat}
                        </button>
                    ))}
                    {flowData.allowedCategories.length === 0 && <p className="text-xs text-slate-400 pt-2">Select allowed spending categories (leave all unselected for no restrictions)</p>}
                </div>
            );
            case 4: return (
                <div className="space-y-4">
                    {[['perTransactionLimit', 'Per Transaction Limit'], ['dailyLimit', 'Daily Limit'], ['monthlyLimit', 'Monthly Limit']].map(([k, label]) => (
                        <div key={k}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label} (₹) <span className="font-normal lowercase">(optional)</span></label>
                            <input type="number" className={input} placeholder="Leave empty for no limit" value={(flowData as any)[k]} onChange={e => update(k, e.target.value)} />
                        </div>
                    ))}
                </div>
            );
            case 5: return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Allowed Merchants (comma-separated)</label>
                        <input className={input} placeholder="Leave empty for all merchants" value={flowData.merchantRestrictions} onChange={e => update('merchantRestrictions', e.target.value)} />
                    </div>
                    <div className="space-y-3 pt-2">
                        {[
                            ['approvalRequired', 'Require manager approval for each transaction'],
                            ['receiptRequired', 'Require receipt upload after each payment'],
                            ['autoRefill', 'Auto-refill from main wallet when balance is low']
                        ].map(([k, label]) => (
                            <label key={k} className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${(flowData as any)[k] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} onClick={() => update(k, !(flowData as any)[k])}>
                                    <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${(flowData as any)[k] ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );
            case 6: return (
                <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Main Wallet Balance</p>
                        <p className="text-2xl font-bold text-primary dark:text-slate-100 mt-1">₹{(userProfile?.walletBalance || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Initial Funding (₹)</label>
                        <input type="number" className={input} placeholder="Amount to allocate to this flow" value={flowData.initialFunding} onChange={e => update('initialFunding', e.target.value)} />
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="flex items-center p-4 justify-between bg-primary text-white">
                <button onClick={() => navigate(-1)} className="flex size-10 items-start">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1 text-center">Create New Flow</h1>
                <div className="size-10"></div>
            </header>

            {/* Progress bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{steps[activeStep]}</p>
                    <p className="text-xs text-slate-500">{activeStep + 1}/{steps.length}</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}></div>
                </div>
                <div className="flex gap-1 mt-3 overflow-x-auto hide-scrollbar">
                    {steps.map((s, i) => (
                        <button key={s} onClick={() => i < activeStep && setActiveStep(i)} className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${i === activeStep ? 'bg-primary text-white' : i < activeStep ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 pb-28">
                {renderStep()}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 z-20">
                <button disabled={activeStep === 0} onClick={() => setActiveStep(p => p - 1)} className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40">
                    Back
                </button>
                <button
                    onClick={activeStep === steps.length - 1 ? handleComplete : () => setActiveStep(p => p + 1)}
                    disabled={submitting || (activeStep === 0 && !flowData.name)}
                    className="flex-2 flex-1 h-12 rounded-xl bg-primary text-white font-bold disabled:opacity-50"
                >
                    {submitting ? 'Launching...' : activeStep === steps.length - 1 ? 'Launch Flow 🚀' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default CreateFlowWizard;
