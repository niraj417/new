import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
    onAuthStateChanged,
    signOut,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
    name?: string;
    email?: string;
    walletBalance: number;
    profileImage?: string;
    activeFlows?: string[];
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    sendEmailLink: (email: string) => Promise<void>;
    verifyAndLogin: (email: string, url: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<void>;
    signInWithTestAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    loading: true,
    logout: async () => { },
    sendEmailLink: async () => { },
    verifyAndLogin: async () => false,
    signInWithGoogle: async () => { },
    signInWithTestAccount: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserProfile(userSnap.data() as UserProfile);
                } else {
                    const initialProfile: UserProfile = {
                        name: user.displayName || 'Anonymous User',
                        email: user.email || '',
                        walletBalance: 0,
                        profileImage: user.photoURL || undefined,
                        activeFlows: [],
                    };
                    await setDoc(userRef, {
                        ...initialProfile,
                        createdAt: serverTimestamp(),
                    });
                    setUserProfile(initialProfile);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const sendEmailLink = async (email: string) => {
        const actionCodeSettings = {
            url: window.location.origin + '/onboarding',
            handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    };

    const verifyAndLogin = async (email: string, url: string) => {
        if (isSignInWithEmailLink(auth, url)) {
            try {
                await signInWithEmailLink(auth, email, url);
                window.localStorage.removeItem('emailForSignIn');
                return true;
            } catch (error) {
                console.error('Error signing in with email link', error);
                return false;
            }
        }
        return false;
    };

    /**
     * Google Sign-In
     * - On Android/iOS (Capacitor): uses the native Google Sign-In sheet via
     *   @capacitor-firebase/authentication, then creates a Firebase credential.
     * - On Web (browser): falls back to Firebase's redirect-based Google sign-in,
     *   which uses the configured Firebase Auth domain.
     */
    const signInWithGoogle = async () => {
        if (Capacitor.isNativePlatform()) {
            // Native flow — shows the system Google account picker
            const result = await FirebaseAuthentication.signInWithGoogle();
            const credential = GoogleAuthProvider.credential(
                result.credential?.idToken,
            );
            await signInWithCredential(auth, credential);
        } else {
            // Web fallback — sign in via @capacitor-firebase/authentication
            // which internally uses signInWithPopup on web
            await FirebaseAuthentication.signInWithGoogle();
        }
    };

    /**
     * Temporary Test Account Login
     */
    const signInWithTestAccount = async () => {
        // You should create this user in Firebase manually or it will fail
        await signInWithEmailAndPassword(auth, 'test@flowpay.app', 'password123');
    };

    const logout = async () => {
        await FirebaseAuthentication.signOut();
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, sendEmailLink, verifyAndLogin, signInWithGoogle, signInWithTestAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
