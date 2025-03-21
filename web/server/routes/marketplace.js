// web/server/routes/marketplace.js
const express = require('express');
const router = express.Router();
const fcl = require('@onflow/fcl');
const t = require('@onflow/types');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configure Flow client
fcl.config({
  'accessNode.api': process.env.FLOW_ACCESS_NODE,
  'discovery.wallet': process.env.FLOW_DISCOVERY_WALLET,
  'app.detail.title': 'Code Marketplace',
  'app.detail.icon': '/favicon.ico'
});

// List code for sale
router.post('/list', async (req, res) => {
  try {
    const { title, description, price, code, userAddress } = req.body;

    if (!title || !description || !price || !code || !userAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate code hash
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // Read the transaction code
    const transactionCode = fs.readFileSync(
      path.join(__dirname, '../../../transactions/ListCode.cdc'),
      'utf8'
    );

    // Build the transaction
    const transaction = await fcl.build([
      fcl.transaction(transactionCode),
      fcl.args([
        fcl.arg(title, t.String),
        fcl.arg(description, t.String),
        fcl.arg(price, t.UFix64),
        fcl.arg(codeHash, t.String)
      ]),
      fcl.proposer(fcl.authorization),
      fcl.payer(fcl.authorization),
      fcl.limit(1000)
    ]);

    // Send the transaction
    const tx = await fcl.send(transaction);
    const receipt = await fcl.tx(tx).onceSealed();

    // Store the code securely (in production, use proper encryption)
    const codePath = path.join(__dirname, '../../../uploads', `${codeHash}.txt`);
    fs.writeFileSync(codePath, code);

    res.json({
      status: 'success',
      transaction: receipt,
      listing: {
        id: receipt.events[0].data.id,
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

    // Read the transaction code
    const transactionCode = fs.readFileSync(
      path.join(__dirname, '../../../transactions/BuyCode.cdc'),
      'utf8'
    );

    // Build the transaction
    const transaction = await fcl.build([
      fcl.transaction(transactionCode),
      fcl.args([
        fcl.arg(listingId, t.UInt64)
      ]),
      fcl.proposer(fcl.authorization),
      fcl.payer(fcl.authorization),
      fcl.limit(1000)
    ]);

    // Send the transaction
    const tx = await fcl.send(transaction);
    const receipt = await fcl.tx(tx).onceSealed();

    // Get the listing details
    const listing = await fcl.query({
      cadence: `
                import CodeMarketplace from 0x9d2ade18cb6bea1a
                pub fun main(listingId: UInt64): CodeMarketplace.Listing? {
                    return CodeMarketplace.getListing(id: listingId)
                }
            `,
      args: (arg, t) => [arg(listingId, t.UInt64)]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Read the code file
    const codePath = path.join(__dirname, '../../../uploads', `${listing.codeHash}.txt`);
    const code = fs.readFileSync(codePath, 'utf8');

    res.json({
      status: 'success',
      transaction: receipt,
      code,
      listing
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

    // Query the blockchain for user's listings
    const listings = await fcl.query({
      cadence: `
                import CodeMarketplace from 0x9d2ade18cb6bea1a
                pub fun main(owner: Address): [CodeMarketplace.Listing] {
                    return CodeMarketplace.getListingsByOwner(owner: owner)
                }
            `,
      args: (arg, t) => [arg(address, t.Address)]
    });

    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

module.exports = router;