import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Home', icon: 'home', path: '/home', fillWhenActive: true },
    { label: 'Flows', icon: 'account_tree', path: '/flows', fillWhenActive: false },
    { label: 'Activity', icon: 'history', path: '/activity', fillWhenActive: false },
    { label: 'Insights', icon: 'insights', path: '/insights', fillWhenActive: false },
    { label: 'Profile', icon: 'person', path: '/profile', fillWhenActive: false },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="relative flex h-auto min-h-screen w-full max-w-[480px] mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
            <main className="flex-1 pb-20">
                {children}
            </main>
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center h-14">
                    {navItems.map(({ label, icon, path, fillWhenActive }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-primary dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={isActive && fillWhenActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {icon}
                                </span>
                                <span className="text-[10px] font-medium">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AppShell;
