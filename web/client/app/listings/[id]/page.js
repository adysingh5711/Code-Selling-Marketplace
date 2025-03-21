'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { listings, purchases } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating
} from '@mui/material';
import { Code as CodeIcon, Star as StarIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function ListingDetailsPage() {
    const params = useParams();
    const { user, setError } = useApp();
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [listing, setListing] = useState(null);
    const [review, setReview] = useState({ rating: 0, comment: '' });
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [params.id]);

    const fetchListing = async () => {
        try {
            const response = await listings.getById(params.id);
            setListing(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch listing');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            setError('Please login to purchase');
            return;
        }

        try {
            setPurchasing(true);
            const response = await purchases.create(params.id);
            window.location.href = `/purchases/${response.data.purchaseId}`;
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to initiate purchase');
        } finally {
            setPurchasing(false);
        }
    };

    const handleReviewSubmit = async () => {
        try {
            setReviewing(true);
            await purchases.submitReview(listing.purchaseId, review);
            setShowReviewDialog(false);
            fetchListing(); // Refresh listing to show new review
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setReviewing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!listing) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Listing not found</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {listing.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip label={listing.language} color="primary" />
                            {listing.tags.map((tag, index) => (
                                <Chip key={index} label={tag} variant="outlined" />
                            ))}
                        </Box>
                        <Typography variant="h5" color="primary" gutterBottom>
                            {listing.price} FLOW
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Listed by: {listing.owner}
                        </Typography>
                    </Box>
                    {user && user.address !== listing.owner && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePurchase}
                            disabled={purchasing}
                            startIcon={<CodeIcon />}
                        >
                            {purchasing ? <CircularProgress size={24} /> : 'Purchase Code'}
                        </Button>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Description
                </Typography>
                <Typography paragraph>
                    {listing.description}
                </Typography>

                <Box sx={{ my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Code Preview
                    </Typography>
                    <Paper
                        sx={{
                            p: 2,
                            bgcolor: 'grey.100',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            maxHeight: 300,
                            overflow: 'auto'
                        }}
                    >
                        {listing.preview}
                    </Paper>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <StarIcon color="primary" />
                    <Typography variant="h6">
                        {listing.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ({listing.reviews.length} reviews)
                    </Typography>
                </Box>

                {listing.reviews.map((review, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                                by {review.buyer}
                            </Typography>
                        </Box>
                        <Typography>{review.comment}</Typography>
                    </Paper>
                ))}

                {user && user.address === listing.owner && listing.purchaseId && !listing.review && (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setShowReviewDialog(true)}
                        sx={{ mt: 2 }}
                    >
                        Submit Review
                    </Button>
                )}
            </Paper>

            <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)}>
                <DialogTitle>Submit Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Rating
                            value={review.rating}
                            onChange={(_, newValue) => setReview(prev => ({ ...prev, rating: newValue }))}
                            size="large"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Comment"
                            value={review.comment}
                            onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disabled={reviewing || !review.rating}
                    >
                        {reviewing ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 