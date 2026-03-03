"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api"; // Adjust this path to wherever your Axios instance lives
import { usePathname, useRouter } from "next/dist/client/components/navigation";

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

            try {
                await api.get("/auth/me");
                setIsAuthenticated(true);

                // 👇 THE REVERSE BOUNCER: If a logged-in user is on a public page, 
                // instantly push them to their Library.
                if (isPublicPage) {
                    router.replace('/library');
                }

            } catch (error) {
                setIsAuthenticated(false);

                // 👇 THE STANDARD BOUNCER: If a guest/expired token is on a protected page, 
                // instantly kick them to login.
                if (!isPublicPage) {
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
            // ⚠️ Note: Unlike login, standard FastAPI endpoints usually expect normal JSON!
            // Make sure the keys "email" and "password" match your UserCreate Pydantic schema in backend.
            await api.post("/auth/signup", {
                email: email,
                password: password
            });

            // If successful, automatically log them in!
            await login(email, password);

        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    };

    // 2. The Login Function
    const login = async (email: string, password: string) => {
        // 🔥 CRUCIAL: FastAPI OAuth2 expects form-encoded data, NOT standard JSON!
        const formData = new URLSearchParams();
        formData.append("username", email); // Must strictly be 'username' for OAuth2
        formData.append("password", password);

        try {
            await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            setIsAuthenticated(true);
            router.push("/library");
        } catch (error) {
            console.error("Login failed", error);
            throw error; // Let the UI handle displaying the error message
        }
    };

    // 3. The Logout Function
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            // 👇 THE FIX: Clear the state, then use Soft Routing!
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

// A custom hook to make using the context super easy in your components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};