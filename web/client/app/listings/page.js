'use client';

import { useState, useEffect } from 'react';
import { listings } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Pagination,
    Alert
} from '@mui/material';
import { Code as CodeIcon, Star as StarIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function ListingsPage() {
    const { user, setError } = useApp();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [filters, setFilters] = useState({
        language: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'timestamp',
        order: 'desc'
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchListings();
    }, [filters, page]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page,
                limit: 12
            };
            const response = await listings.getAll(params);
            setListings(response.data.listings);
            setTotalPages(Math.ceil(response.data.total / 12));
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Browse Listings
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Language</InputLabel>
                            <Select
                                name="language"
                                value={filters.language}
                                onChange={handleFilterChange}
                                label="Language"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="javascript">JavaScript</MenuItem>
                                <MenuItem value="python">Python</MenuItem>
                                <MenuItem value="java">Java</MenuItem>
                                <MenuItem value="cpp">C++</MenuItem>
                                <MenuItem value="cs">C#</MenuItem>
                                <MenuItem value="go">Go</MenuItem>
                                <MenuItem value="rust">Rust</MenuItem>
                                <MenuItem value="solidity">Solidity</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Min Price (FLOW)"
                            name="minPrice"
                            type="number"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            inputProps={{ min: 0, step: 0.1 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Max Price (FLOW)"
                            name="maxPrice"
                            type="number"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            inputProps={{ min: 0, step: 0.1 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleFilterChange}
                                label="Sort By"
                            >
                                <MenuItem value="timestamp">Date</MenuItem>
                                <MenuItem value="price">Price</MenuItem>
                                <MenuItem value="rating">Rating</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={3}>
                {listings.map((listing) => (
                    <Grid item xs={12} sm={6} md={4} key={listing.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {listing.title}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip label={listing.language} color="primary" size="small" />
                                    {listing.tags.slice(0, 2).map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" variant="outlined" />
                                    ))}
                                </Box>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {listing.description.substring(0, 150)}
                                    {listing.description.length > 150 ? '...' : ''}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <StarIcon color="primary" fontSize="small" />
                                    <Typography variant="body2">
                                        {listing.rating.toFixed(1)} ({listing.reviews.length} reviews)
                                    </Typography>
                                </Box>

                                <Typography variant="h6" color="primary">
                                    {listing.price} FLOW
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<CodeIcon />}
                                    component={Link}
                                    href={`/listings/${listing.id}`}
                                >
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {listings.length === 0 && (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No listings found matching your criteria.
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                />
            </Box>
        </Box>
    );
} 