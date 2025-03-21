'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { listings } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function UserListingsPage() {
    const params = useParams();
    const { setError } = useApp();
    const [loading, setLoading] = useState(true);
    const [userListings, setUserListings] = useState([]);

    useEffect(() => {
        fetchUserListings();
    }, [params.address]);

    const fetchUserListings = async () => {
        try {
            const response = await listings.getUserListings(params.address);
            setUserListings(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch user listings');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (userListings.length === 0) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="info">
                    No listings found for this user
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Listings by {params.address}
            </Typography>

            <Grid container spacing={3}>
                {userListings.map((listing) => (
                    <Grid item xs={12} sm={6} md={4} key={listing.listingId}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {listing.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip label={listing.language} color="primary" />
                                    {listing.tags.map((tag, index) => (
                                        <Chip key={index} label={tag} variant="outlined" />
                                    ))}
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {listing.description}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {listing.price} FLOW
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    component={Link}
                                    href={`/listings/${listing.listingId}`}
                                    startIcon={<CodeIcon />}
                                >
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 