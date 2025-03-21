import express from 'express';
import { verifyToken, verifyFlowAccount, rateLimiter } from '../middleware/auth.js';
import { purchaseListing, completePurchase, getPurchase, getUserPurchases } from '../utils/flowUtils.js';
import { decryptCode, generateDownloadToken, verifyDownloadToken } from '../utils/codeEncryption.js';
import Listing from '../models/Listing.js';
import Purchase from '../models/Purchase.js';

const router = express.Router();

// Purchase a listing
router.post('/:listingId', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { listingId } = req.params;
        const { address } = req.user;

        // Get listing details
        const listing = await Listing.findOne({ id: listingId, isActive: true });
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.owner === address) {
            return res.status(400).json({ message: 'Cannot purchase your own listing' });
        }

        // Execute purchase on Flow blockchain
        const transaction = await purchaseListing(
            listingId,
            address,
            address,
            address
        );

        // Create purchase record in MongoDB
        const purchase = new Purchase({
            listingId,
            buyer: address,
            seller: listing.owner,
            price: listing.price,
            transactionHash: transaction.id,
            status: 'pending',
            escrowExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        });

        await purchase.save();

        res.status(201).json({
            message: 'Purchase initiated successfully',
            purchaseId: purchase._id,
            transactionId: transaction.id
        });
    } catch (error) {
        console.error('Failed to initiate purchase:', error);
        res.status(500).json({ message: 'Failed to initiate purchase' });
    }
});

// Complete a purchase
router.post('/:purchaseId/complete', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { address } = req.user;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        if (purchase.buyer !== address) {
            return res.status(403).json({ message: 'Not authorized to complete this purchase' });
        }

        if (purchase.status !== 'pending') {
            return res.status(400).json({ message: 'Purchase is not in pending state' });
        }

        // Execute completion on Flow blockchain
        const transaction = await completePurchase(
            purchase.listingId,
            address,
            address,
            address
        );

        // Update purchase status
        purchase.status = 'completed';
        purchase.completedAt = new Date();
        await purchase.save();

        res.json({
            message: 'Purchase completed successfully',
            transactionId: transaction.id
        });
    } catch (error) {
        console.error('Failed to complete purchase:', error);
        res.status(500).json({ message: 'Failed to complete purchase' });
    }
});

// Get purchase details
router.get('/:purchaseId', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { address } = req.user;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        if (purchase.buyer !== address && purchase.seller !== address) {
            return res.status(403).json({ message: 'Not authorized to view this purchase' });
        }

        res.json(purchase);
    } catch (error) {
        console.error('Failed to fetch purchase:', error);
        res.status(500).json({ message: 'Failed to fetch purchase' });
    }
});

// Get user's purchases
router.get('/user/:address', rateLimiter, async (req, res) => {
    try {
        const purchases = await Purchase.find({ buyer: req.params.address })
            .sort({ createdAt: -1 });

        res.json(purchases);
    } catch (error) {
        console.error('Failed to fetch user purchases:', error);
        res.status(500).json({ message: 'Failed to fetch user purchases' });
    }
});

// Get code access
router.get('/:purchaseId/code', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { address } = req.user;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        if (purchase.buyer !== address) {
            return res.status(403).json({ message: 'Not authorized to access this code' });
        }

        if (purchase.status !== 'completed') {
            return res.status(400).json({ message: 'Purchase must be completed to access code' });
        }

        const listing = await Listing.findOne({ id: purchase.listingId });
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Generate download token
        const downloadToken = generateDownloadToken(purchaseId, address);

        // Decrypt code
        const decryptedCode = decryptCode(
            listing.encryptedCode,
            listing.encryptionKey,
            listing.iv
        );

        // Update download count
        purchase.downloadCount += 1;
        purchase.lastDownload = new Date();
        await purchase.save();

        res.json({
            code: decryptedCode,
            downloadToken,
            downloadCount: purchase.downloadCount
        });
    } catch (error) {
        console.error('Failed to access code:', error);
        res.status(500).json({ message: 'Failed to access code' });
    }
});

// Submit review
router.post('/:purchaseId/review', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { rating, comment } = req.body;
        const { address } = req.user;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        if (purchase.buyer !== address) {
            return res.status(403).json({ message: 'Not authorized to submit review' });
        }

        if (purchase.status !== 'completed') {
            return res.status(400).json({ message: 'Purchase must be completed to submit review' });
        }

        if (purchase.review) {
            return res.status(400).json({ message: 'Review already submitted' });
        }

        // Update purchase with review
        purchase.review = {
            rating,
            comment,
            timestamp: new Date()
        };
        await purchase.save();

        // Update listing rating
        const listing = await Listing.findOne({ id: purchase.listingId });
        if (listing) {
            listing.reviews.push({
                buyer: address,
                rating,
                comment,
                timestamp: new Date()
            });

            // Calculate new average rating
            const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
            listing.rating = totalRating / listing.reviews.length;

            await listing.save();
        }

        res.json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Failed to submit review:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});

export default router; 