import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Onboarding = () => {
    const navigate = useNavigate();
    const { sendEmailLink, verifyAndLogin, currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEmailLink = async () => {
            const storedEmail = window.localStorage.getItem('emailForSignIn');
            if (storedEmail && window.location.href.includes('apiKey=')) {
                setLoading(true);
                const success = await verifyAndLogin(storedEmail, window.location.href);
                if (success) {
                    navigate('/home');
                } else {
                    setError('Failed to log in. The link may have expired.');
                }
                setLoading(false);
            }
        };
        handleEmailLink();
    }, [verifyAndLogin, navigate]);

    useEffect(() => {
        if (currentUser) navigate('/home');
    }, [currentUser, navigate]);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError('');
        try {
            await sendEmailLink(email);
            setEmailSent(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to send login link';
            setError(msg);
        }
        setLoading(false);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
            <div className="flex items-center p-4 pb-2 justify-end"></div>

            <div className="px-4 py-3">
                <div
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-80 shadow-sm"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByXb3eY4RvJcZ2YRcHRHkjr0gTZNciapyUeYcPUsdO2Ed6_c_IeLCtrNow7CDB9a_7N6aie9pzeEAogK5G_7vjcfdGXwa8tlJR2C3D19ZwVfxnjIKPu1Ln0omAeg-PFAtCNLqZhr-L1dKNoKhqvsx_qeQmWq2xqRXDimTIk4B3r9ykS-_SkgFbmP0BGBODCcPYlHmB6zmdxl5f4ks9-wpiGZR_e7TRTcu1HONVUwv3d9nOab7ny2WY8ooLTdl_ZDTpK5l1QtP8nWs")' }}
                ></div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <h1 className="tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
                    Control how money moves.
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pb-8 pt-1 px-8 text-center">
                    Create programmable spending flows for teams, families, trips, and businesses.
                </p>

                <div className="flex justify-center">
                    <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium text-center">{error}</div>
                        )}

                        {loading && !emailSent && (
                            <div className="p-3 text-center text-slate-500 text-sm">Signing you in...</div>
                        )}

                        {emailSent ? (
                            <div className="p-5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-center">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 block text-5xl mb-3">mark_email_read</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">Check your email!</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    We sent a magic login link to <strong>{email}</strong>. Click it to sign in.
                                </p>
                            </div>
                        ) : (
                            !loading && (
                                <form onSubmit={handleSendLink} className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl h-12 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={!email}
                                        className="flex items-center justify-center rounded-xl h-12 px-5 bg-primary text-white text-base font-bold tracking-[0.015em] w-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined mr-2 text-[20px]">mark_email_unread</span>
                                        <span>Continue with Email</span>
                                    </button>
                                </form>
                            )
                        )}
                    </div>
                </div>

                <div className="pb-8 pt-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        By continuing you agree to our{' '}
                        <a className="font-bold text-primary dark:text-blue-400 hover:underline" href="#">Terms of Service</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
