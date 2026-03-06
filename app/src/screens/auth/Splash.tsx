import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Splash: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            navigate(currentUser ? '/home' : '/onboarding');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate, currentUser, loading]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-primary text-white">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-white text-5xl">account_tree</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">FlowPay</h1>
                <p className="text-white/70 text-base font-medium">Programmable Money Flows</p>
            </div>
        </div>
    );
};

export default Splash;
