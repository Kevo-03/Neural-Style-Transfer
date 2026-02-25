"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api"; // Adjust this path to wherever your Axios instance lives

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // 1. Check for the token when the app first loads
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // 2. The Login Function
    const login = async (email: string, password: string) => {
        // 🔥 CRUCIAL: FastAPI OAuth2 expects form-encoded data, NOT standard JSON!
        const formData = new URLSearchParams();
        formData.append("username", email); // Must strictly be 'username' for OAuth2
        formData.append("password", password);

        try {
            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            // Save the VIP pass to localStorage
            localStorage.setItem("token", response.data.access_token);
            setIsAuthenticated(true);

            // Send them straight to their gallery
            router.push("/library");
        } catch (error) {
            console.error("Login failed", error);
            throw error; // Let the UI handle displaying the error message
        }
    };

    // 3. The Logout Function
    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/login"); // Send them back to the login page
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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