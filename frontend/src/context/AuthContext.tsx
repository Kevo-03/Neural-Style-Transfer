"use client";

import React, { createContext, useContext } from "react";
import api from "../lib/api";

interface AuthContextType {
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
        <AuthContext.Provider value={{ login, signup, logout }}>
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