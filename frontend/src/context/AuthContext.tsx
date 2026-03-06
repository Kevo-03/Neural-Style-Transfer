"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api"; // Adjust this path to wherever your Axios instance lives
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    // 1. Check for the token when the app first loads
    useEffect(() => {
        const verifyAuth = async () => {
            const publicPaths = ['/login', '/signup', '/'];
            const isPublicPage = publicPaths.includes(pathname);
            const protectedPaths = ['/library', '/generate', '/settings'];
            const isProtectedPage = protectedPaths.some(path => pathname.startsWith(path));

            try {
                await api.get("/auth/me");
                setIsAuthenticated(true);

                if (isPublicPage) {
                    router.replace('/library');
                }

            } catch (error) {
                setIsAuthenticated(false);

                if (isProtectedPage) {
                    router.replace('/');
                }
            } finally {
                setIsCheckingAuth(false);
            }
        };

        verifyAuth();
    }, [pathname, router]);

    const signup = async (email: string, password: string) => {
        try {
            await api.post("/auth/signup", {
                email: email,
                password: password
            });

            await login(email, password);

        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        try {
            await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            window.location.href = "/library";
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        await api.post("/auth/logout");
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isCheckingAuth, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};