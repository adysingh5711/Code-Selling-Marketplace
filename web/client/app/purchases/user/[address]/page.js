'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { purchases } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function UserPurchasesPage() {
    const params = useParams();
    const { setError } = useApp();
    const [loading, setLoading] = useState(true);
    const [userPurchases, setUserPurchases] = useState([]);

    useEffect(() => {
        fetchUserPurchases();
    }, [params.address]);

    const fetchUserPurchases = async () => {
        try {
            const response = await purchases.getUserPurchases(params.address);
            setUserPurchases(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch user purchases');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            case 'disputed':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (userPurchases.length === 0) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="info">
                    No purchases found for this user
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Purchases by {params.address}
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Transaction Hash</TableCell>
                            <TableCell>Listing Title</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userPurchases.map((purchase) => (
                            <TableRow key={purchase.purchaseId}>
                                <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {purchase.transactionHash}
                                    </Typography>
                                </TableCell>
                                <TableCell>{purchase.listing.title}</TableCell>
                                <TableCell>{purchase.price} FLOW</TableCell>
                                <TableCell>
                                    <Chip
                                        label={purchase.status}
                                        color={getStatusColor(purchase.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(purchase.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        href={`/purchases/${purchase.purchaseId}`}
                                        startIcon={<CodeIcon />}
                                        size="small"
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
} 