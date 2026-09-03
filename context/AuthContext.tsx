"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CivicPulseUser {
    phone: string;
    name: string;
    avatar: string; // Initials-based
    joinedAt: number;
}

interface AuthContextType {
    user: CivicPulseUser | null;
    isLoading: boolean;
    sendOtp: (phone: string) => Promise<string>; // Returns masked phone
    verifyOtp: (otp: string) => boolean;
    setUserName: (name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "civicpulse_user";

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CivicPulseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingPhone, setPendingPhone] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");

    // Load user from localStorage on mount (session persistence)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch { }
        setIsLoading(false);
    }, []);

    const sendOtp = async (phone: string): Promise<string> => {
        // Simulate sending OTP — generate a 6-digit code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        setPendingPhone(phone);
        // In production, this would call an SMS API
        console.log(`[CivicPulse] OTP for ${phone}: ${otp}`);
        // Return masked phone for display
        return phone.replace(/(\d{2})\d{4}(\d{4})/, "$1****$2");
    };

    const verifyOtp = (otp: string): boolean => {
        return otp.length === 6 && /^\d{6}$/.test(otp) && otp === generatedOtp;
    };

    const setUserName = (name: string) => {
        const newUser: CivicPulseUser = {
            phone: pendingPhone,
            name,
            avatar: getInitials(name),
            joinedAt: Date.now(),
        };
        setUser(newUser);
        // Keep localStorage for session persistence (SSR-safe)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

        // Also persist to MongoDB
        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        }).catch((err) => console.error('Failed to persist user to DB:', err));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider
            value={{ user, isLoading, sendOtp, verifyOtp, setUserName, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
