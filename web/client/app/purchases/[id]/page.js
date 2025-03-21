'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { purchases } from '@/services/api';
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

export default function PurchaseDetailsPage() {
    const params = useParams();
    const { user, setError } = useApp();
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [purchase, setPurchase] = useState(null);
    const [review, setReview] = useState({ rating: 0, comment: '' });
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    useEffect(() => {
        fetchPurchase();
    }, [params.id]);

    const fetchPurchase = async () => {
        try {
            const response = await purchases.getById(params.id);
            setPurchase(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch purchase details');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async () => {
        try {
            setReviewing(true);
            await purchases.submitReview(params.id, review);
            setShowReviewDialog(false);
            fetchPurchase(); // Refresh purchase to show new review
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setReviewing(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await purchases.getDownloadToken(params.id);
            window.location.href = response.data.downloadUrl;
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to download code');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!purchase) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Purchase not found</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Purchase Details
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {purchase.price} FLOW
                        </Typography>
                        <Chip
                            label={purchase.status}
                            color={
                                purchase.status === 'completed'
                                    ? 'success'
                                    : purchase.status === 'pending'
                                        ? 'warning'
                                        : 'error'
                            }
                            sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Transaction Hash: {purchase.transactionHash}
                        </Typography>
                    </Box>
                    {purchase.status === 'completed' && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownload}
                            startIcon={<CodeIcon />}
                        >
                            Download Code
                        </Button>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Listing Details
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        {purchase.listing.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={purchase.listing.language} color="primary" />
                        {purchase.listing.tags.map((tag, index) => (
                            <Chip key={index} label={tag} variant="outlined" />
                        ))}
                    </Box>
                    <Typography paragraph>
                        {purchase.listing.description}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <StarIcon color="primary" />
                    <Typography variant="h6">
                        {purchase.listing.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ({purchase.listing.reviews.length} reviews)
                    </Typography>
                </Box>

                {purchase.listing.reviews.map((review, index) => (
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

                {user && user.address === purchase.buyer && purchase.status === 'completed' && !purchase.review && (
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