import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

const Onboarding = () => {
    const navigate = useNavigate();
    const { sendEmailLink, verifyAndLogin, currentUser, signInWithGoogle, signInWithTestAccount } = useAuth();
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            // onAuthStateChanged will update currentUser → navigate to /home
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed';
            setError(msg);
        }
        setGoogleLoading(false);
    };

    const handleTestLogin = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            await signInWithTestAccount();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Test login failed';
            setError(msg);
        }
        setGoogleLoading(false);
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

                        {(loading || googleLoading) && !emailSent && (
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
                            !loading && !googleLoading && (
                                <>
                                    {/* ── Google Sign-In ───────────────────────────────── */}
                                    <button
                                        id="btn-google-signin"
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        disabled={googleLoading}
                                        className="flex items-center justify-center gap-3 rounded-xl h-12 px-5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-base font-semibold w-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        <GoogleIcon />
                                        <span>Continue with Google</span>
                                    </button>

                                    {/* ── Test Login Bypass ─────────────────────────────── */}
                                    <button
                                        type="button"
                                        onClick={handleTestLogin}
                                        disabled={googleLoading}
                                        className="flex items-center justify-center gap-3 rounded-xl h-12 px-5 bg-amber-500 dark:bg-amber-600 border border-amber-600 dark:border-amber-700 text-white text-base font-semibold w-full shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 active:scale-[0.98] transition-all mt-2"
                                    >
                                        <span className="material-symbols-outlined mr-2">bug_report</span>
                                        <span>Test Account Bypass</span>
                                    </button>

                                    {/* ── Divider ─────────────────────────────────────── */}
                                    <div className="flex items-center gap-3 my-1">
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                        <span className="text-xs text-slate-400 font-medium">or</span>
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                    </div>

                                    {/* ── Email magic link ─────────────────────────────── */}
                                    <form onSubmit={handleSendLink} className="flex flex-col gap-3">
                                        <input
                                            type="email"
                                            id="input-email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-xl h-12 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                            required
                                        />
                                        <button
                                            id="btn-email-continue"
                                            type="submit"
                                            disabled={!email}
                                            className="flex items-center justify-center rounded-xl h-12 px-5 bg-primary text-white text-base font-bold tracking-[0.015em] w-full shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined mr-2 text-[20px]">mark_email_unread</span>
                                            <span>Continue with Email</span>
                                        </button>
                                    </form>
                                </>
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
