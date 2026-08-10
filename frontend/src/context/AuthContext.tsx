"use client";

import React, { createContext, useContext } from "react";
import api from "../lib/api";
import { BACKEND_AVAILABLE } from "./ServiceStatusContext";

interface AuthContextType {
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const signup = async (username: string, password: string) => {
        try {
            await api.post("/auth/signup", {
                username: username,
                password: password
            });

            await login(username, password);

        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    };

    const login = async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", username);
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
        // Log Out stays usable while the backend is down: skip the request that
        // would throw and never redirect, and just send the user home.
        if (BACKEND_AVAILABLE) {
            await api.post("/auth/logout");
        }
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