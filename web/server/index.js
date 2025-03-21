// web/server/index.js
const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const fcl = require('@onflow/fcl');
const t = require('@onflow/types');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const userRoutes = require('./routes/marketplace');

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure FCL
fcl.config()
    .put("accessNode.api", process.env.FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org")
    .put("flow.network", process.env.FLOW_NETWORK || "testnet")
    .put("0x9d2ade18cb6bea1a", process.env.CONTRACT_ADDRESS || "0x9d2ade18cb6bea1a");

// Setup file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/marketplace', userRoutes);

// File upload endpoint
app.post('/api/upload', upload.single('codeFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate hash of file for verification
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Store file metadata
    res.json({
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        codeHash: hash
    });
});

// Get all listings endpoint
app.get('/api/listings', async (req, res) => {
    try {
        const script = fs.readFileSync(path.join(__dirname, '../../scripts/GetListings.cdc'), 'utf8');

        const result = await fcl.query({
            cadence: script
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Download code endpoint (after purchase verification)
app.get('/api/download/:listingId', async (req, res) => {
    const { listingId } = req.params;
    const { userAddress } = req.query;

    // In a real implementation, verify the user has purchased this listing
    // For demo purposes, we're allowing access

    // Normally you would use the listing's hash to find the correct file
    const filePath = path.join(__dirname, 'uploads', 'sample.zip');

    // Send a sample file for demo
    if (fs.existsSync(filePath)) {
        return res.download(filePath);
    } else {
        return res.status(404).json({ error: 'File not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});