'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Container
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import * as fcl from '@onflow/fcl';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFlowLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            // Configure Flow client
            fcl.config({
                'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
                'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET,
                'app.detail.title': 'Code Marketplace',
                'app.detail.icon': '/favicon.ico'
            });

            // Authenticate with Flow
            const user = await fcl.authenticate();

            // Verify the user on our backend
            const response = await auth.login(user.addr);
            const { token } = response.data;

            // Store the token and user data
            localStorage.setItem('token', token);
            setUser({
                address: user.addr,
                loggedIn: true
            });

            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Failed to login with Flow');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome to Code Marketplace
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Connect your Flow wallet to start buying and selling code
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<WalletIcon />}
                        onClick={handleFlowLogin}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Connect Flow Wallet'
                        )}
                    </Button>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                        Don't have a Flow wallet?{' '}
                        <Button
                            href="https://flow.com/developers/flow-cli/install"
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                        >
                            Get one here
                        </Button>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
} 