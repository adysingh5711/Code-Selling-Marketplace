'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import * as fcl from '@onflow/fcl';

export default function FlowWallet() {
    const { user, setUser } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        // Configure Flow client on component mount
        fcl.config({
            'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
            'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET,
            'app.detail.title': 'Code Marketplace',
            'app.detail.icon': '/favicon.ico'
        });

        // Subscribe to Flow authentication state changes
        fcl.currentUser().subscribe(user => {
            if (user.loggedIn) {
                setUser({
                    address: user.addr,
                    loggedIn: true
                });
            } else {
                setUser(null);
            }
        });
    }, [setUser]);

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);
            await fcl.authenticate();
            setShowDialog(false);
        } catch (error) {
            console.error('Wallet connection error:', error);
            setError('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setLoading(true);
            setError(null);
            await fcl.unauthenticate();
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Wallet disconnection error:', error);
            setError('Failed to disconnect wallet');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Button
                variant="outlined"
                startIcon={<CircularProgress size={20} />}
                disabled
            >
                Connecting...
            </Button>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (user?.loggedIn) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDisconnect}
                    disabled={loading}
                >
                    Disconnect
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<WalletIcon />}
                onClick={() => setShowDialog(true)}
            >
                Connect Wallet
            </Button>

            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <DialogTitle>Connect Flow Wallet</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Connect your Flow wallet to start buying and selling code
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleConnect}
                        variant="contained"
                        startIcon={<WalletIcon />}
                    >
                        Connect
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 