"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
// 👇 FIX 1: Correct Next.js import
import { usePathname, useRouter } from "next/navigation";

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

    useEffect(() => {
        const verifyAuth = async () => {
            // 👇 FIX 2: Put the loading shield back up while we check!
            setIsCheckingAuth(true);

            const publicPaths = ['/login', '/signup', '/'];
            const isPublicPage = publicPaths.includes(pathname);

            try {
                await api.get("/auth/me");
                setIsAuthenticated(true);

                if (isPublicPage) {
                    router.replace('/library');
                }

            } catch (error) {
                setIsAuthenticated(false);

                if (!isPublicPage) {
                    router.replace('/'); // Kick to landing page
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

            setIsAuthenticated(true);
            router.push("/library");
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setIsAuthenticated(false);
            router.push("/");
        }
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