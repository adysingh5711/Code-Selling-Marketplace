import express from 'express';
import multer from 'multer';
import { verifyToken, verifyFlowAccount, rateLimiter } from '../middleware/auth.js';
import { createListing, getListing, getUserListings } from '../utils/flowUtils.js';
import { encryptCode, generateCodeHash, generateCodePreview } from '../utils/codeEncryption.js';
import Listing from '../models/Listing.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create a new listing
router.post('/', verifyToken, verifyFlowAccount, rateLimiter, upload.single('code'), async (req, res) => {
    try {
        const { title, description, price, language, tags } = req.body;
        const code = req.file.buffer.toString();
        const { address } = req.user;

        // Generate encryption key and IV
        const key = generateEncryptionKey();
        const iv = generateIV();

        // Encrypt the code
        const encryptedCode = encryptCode(code, key, iv);

        // Generate code hash
        const codeHash = generateCodeHash(code);

        // Generate preview
        const preview = generateCodePreview(code);

        // Create listing on Flow blockchain
        const listingData = {
            id: Date.now().toString(),
            title,
            description,
            price: parseFloat(price),
            codeHash,
            language,
            tags: tags.split(',').map(tag => tag.trim())
        };

        const transaction = await createListing(
            listingData,
            address,
            address,
            address
        );

        // Create listing in MongoDB
        const listing = new Listing({
            ...listingData,
            owner: address,
            encryptedCode,
            encryptionKey: key,
            iv,
            preview: preview.preview,
            previewWatermark: preview.watermark,
            totalLines: preview.totalLines,
            isActive: true
        });

        await listing.save();

        res.status(201).json({
            message: 'Listing created successfully',
            listingId: listingData.id,
            transactionId: transaction.id
        });
    } catch (error) {
        console.error('Failed to create listing:', error);
        res.status(500).json({ message: 'Failed to create listing' });
    }
});

// Get all listings
router.get('/', rateLimiter, async (req, res) => {
    try {
        const { language, tags, minPrice, maxPrice, sortBy = 'timestamp', order = 'desc' } = req.query;

        const query = { isActive: true };

        if (language) query.language = language;
        if (tags) query.tags = { $in: tags.split(',').map(tag => tag.trim()) };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const sort = {};
        sort[sortBy] = order === 'desc' ? -1 : 1;

        const listings = await Listing.find(query)
            .sort(sort)
            .select('-encryptedCode -encryptionKey -iv')
            .limit(50);

        res.json(listings);
    } catch (error) {
        console.error('Failed to fetch listings:', error);
        res.status(500).json({ message: 'Failed to fetch listings' });
    }
});

// Get a specific listing
router.get('/:id', rateLimiter, async (req, res) => {
    try {
        const listing = await Listing.findOne({ id: req.params.id, isActive: true })
            .select('-encryptedCode -encryptionKey -iv');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json(listing);
    } catch (error) {
        console.error('Failed to fetch listing:', error);
        res.status(500).json({ message: 'Failed to fetch listing' });
    }
});

// Get user's listings
router.get('/user/:address', rateLimiter, async (req, res) => {
    try {
        const listings = await Listing.find({ owner: req.params.address })
            .select('-encryptedCode -encryptionKey -iv')
            .sort({ timestamp: -1 });

        res.json(listings);
    } catch (error) {
        console.error('Failed to fetch user listings:', error);
        res.status(500).json({ message: 'Failed to fetch user listings' });
    }
});

// Update listing
router.put('/:id', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { title, description, price, language, tags } = req.body;
        const { address } = req.user;

        const listing = await Listing.findOne({ id: req.params.id });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.owner !== address) {
            return res.status(403).json({ message: 'Not authorized to update this listing' });
        }

        // Update listing in MongoDB
        listing.title = title || listing.title;
        listing.description = description || listing.description;
        listing.price = price ? parseFloat(price) : listing.price;
        listing.language = language || listing.language;
        listing.tags = tags ? tags.split(',').map(tag => tag.trim()) : listing.tags;

        await listing.save();

        res.json({ message: 'Listing updated successfully', listing });
    } catch (error) {
        console.error('Failed to update listing:', error);
        res.status(500).json({ message: 'Failed to update listing' });
    }
});

// Delete listing
router.delete('/:id', verifyToken, verifyFlowAccount, rateLimiter, async (req, res) => {
    try {
        const { address } = req.user;

        const listing = await Listing.findOne({ id: req.params.id });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.owner !== address) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        // Soft delete by setting isActive to false
        listing.isActive = false;
        await listing.save();

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Failed to delete listing:', error);
        res.status(500).json({ message: 'Failed to delete listing' });
    }
});

export default router; 