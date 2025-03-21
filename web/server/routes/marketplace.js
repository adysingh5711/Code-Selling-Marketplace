// web/server/routes/marketplace.js
const express = require('express');
const router = express.Router();
const fcl = require('@onflow/fcl');
const t = require('@onflow/types');
const fs = require('fs');
const path = require('path');

// List code for sale
router.post('/list', async (req, res) => {
  try {
    const { title, description, price, codeHash, userAddress } = req.body;

    if (!title || !description || !price || !codeHash || !userAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a production app, you'd handle the transaction signing through FCL
    // For this demo, we'll just simulate a successful transaction

    const transactionCode = fs.readFileSync(
      path.join(__dirname, '../../../transactions/ListCode.cdc'),
      'utf8'
    );

    // In a real app, this would be handled by the client-side FCL
    // Here we're just simulating the response
    res.json({
      status: 'success',
      transaction: {
        id: 'simulated-tx-' + Date.now(),
        status: 'SEALED',
      },
      listing: {
        id: Math.floor(Math.random() * 1000),
        owner: userAddress,
        title,
        description,
        price,
        codeHash,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error listing code:', error);
    res.status(500).json({ error: 'Failed to list code' });
  }
});

// Buy code
router.post('/buy', async (req, res) => {
  try {
    const { listingId, buyerAddress } = req.body;

    if (!listingId || !buyerAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transactionCode = fs.readFileSync(
      path.join(__dirname, '../../../transactions/BuyCode.cdc'),
      'utf8'
    );

    // In a real app, this would be handled by the client-side FCL
    // Here we're just simulating the response
    res.json({
      status: 'success',
      transaction: {
        id: 'simulated-purchase-tx-' + Date.now(),
        status: 'SEALED',
      },
      downloadUrl: `/api/download/${listingId}?userAddress=${buyerAddress}`
    });
  } catch (error) {
    console.error('Error purchasing code:', error);
    res.status(500).json({ error: 'Failed to purchase code' });
  }
});

// Get user listings
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // In a real implementation, this would query the blockchain
    // For demo, return mock data
    res.json([
      {
        id: 1,
        owner: address,
        title: "React Component Library",
        description: "A set of reusable React components with Tailwind styling",
        price: "10.0",
        codeHash: "abcdef1234567890",
        timestamp: Date.now() - 86400000
      },
      {
        id: 2,
        owner: address,
        title: "Node.js API Boilerplate",
        description: "Express API starter with authentication and database setup",
        price: "15.0",
        codeHash: "1234567890abcdef",
        timestamp: Date.now()
      }
    ]);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

module.exports = router;