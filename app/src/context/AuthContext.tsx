import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
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
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    loading: true,
    logout: async () => { },
    sendEmailLink: async () => { },
    verifyAndLogin: async () => false,
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
                console.error("Error signing in with email link", error);
                return false;
            }
        }
        return false;
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, sendEmailLink, verifyAndLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
