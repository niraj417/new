import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/onboarding');
    };

    const menuItems = [
        { icon: 'notifications', label: 'Notifications', sub: 'Manage alerts' },
        { icon: 'security', label: 'Security', sub: 'Password, 2FA' },
        { icon: 'account_balance', label: 'Linked Bank Accounts', sub: 'Manage payment methods' },
        { icon: 'receipt_long', label: 'Transaction History', sub: 'All past payments' },
        { icon: 'help_outline', label: 'Help & Support', sub: 'FAQs, Contact us' },
        { icon: 'info', label: 'About FlowPay', sub: 'Version 2.0.0' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">Profile</h1>
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col items-center pt-8 pb-6 bg-white dark:bg-slate-900">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 border-2 border-primary/20">
                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{userProfile?.name || 'FlowPay User'}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{currentUser?.email}</p>
                <div className="mt-4 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    ₹{(userProfile?.walletBalance || 0).toLocaleString('en-IN')} Wallet Balance
                </div>
            </div>

            {/* Menu */}
            <div className="mt-2 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {menuItems.map(({ icon, label, sub }) => (
                    <button key={label} className="flex items-center gap-4 w-full px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">{icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-xl">chevron_right</span>
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div className="p-4 mt-4 pb-28">
                <button onClick={handleLogout} className="w-full h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
