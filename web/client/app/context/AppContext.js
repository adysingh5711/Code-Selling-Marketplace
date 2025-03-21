import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, flow } from '../services/api';
import * as fcl from '@onflow/fcl';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize Flow client
    useEffect(() => {
        fcl.config({
            'accessNode.api': process.env.REACT_APP_FLOW_ACCESS_NODE,
            'flow.network': process.env.REACT_APP_FLOW_NETWORK || 'testnet'
        });
    }, []);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await auth.verify();
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login with Flow
    const login = async () => {
        try {
            setLoading(true);
            const { address } = await fcl.logIn();
            const response = await auth.login(address);
            const { token } = response.data;
            localStorage.setItem('token', token);
            setUser({ address });
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await auth.logout();
            await fcl.unauthenticate();
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    // Get Flow account details
    const getAccountDetails = async () => {
        try {
            const response = await flow.getAccountDetails();
            return response;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    // Get Flow token balance
    const getBalance = async (address) => {
        try {
            const balance = await flow.getBalance(address);
            return balance;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        getAccountDetails,
        getBalance,
        setError
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext; 