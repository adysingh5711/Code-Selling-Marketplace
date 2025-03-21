import express from 'express';
import { verifyToken, rateLimiter } from '../middleware/auth.js';
import { authenticateFlowUser, generateToken } from '../middleware/auth.js';
import * as fcl from '@onflow/fcl';

const router = express.Router();

// Authenticate with Flow account
router.post('/flow', rateLimiter, authenticateFlowUser);

// Verify Flow account capabilities
router.get('/verify', verifyToken, rateLimiter, async (req, res) => {
    try {
        const { address } = req.user;

        // Verify Flow account exists
        const account = await fcl.account(address);
        if (!account) {
            return res.status(401).json({ message: 'Invalid Flow account' });
        }

        // Check required capabilities
        const capabilities = {
            hasMarketplace: account.contracts[process.env.MARKETPLACE_CONTRACT_ADDRESS] !== undefined,
            hasFlowToken: account.contracts['0x7e60df042a9c0868'] !== undefined, // FlowToken contract
            hasFungibleToken: account.contracts['0x9a0766d93b6608b7'] !== undefined // FungibleToken contract
        };

        // Check Flow token balance
        const flowTokenBalance = await fcl.query({
            cadence: `
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7

        pub fun main(address: Address): UFix64 {
          let vault = getAccount(address).getCapability(/public/flowTokenBalance)
            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
            ?? panic("Could not borrow Flow token balance")
          
          return vault.balance
        }
      `,
            args: [fcl.arg(address, t.Address)]
        });

        res.json({
            address,
            capabilities,
            flowTokenBalance,
            verified: true
        });
    } catch (error) {
        console.error('Failed to verify account:', error);
        res.status(500).json({ message: 'Failed to verify account' });
    }
});

// Get Flow account details
router.get('/account', verifyToken, rateLimiter, async (req, res) => {
    try {
        const { address } = req.user;

        const account = await fcl.account(address);
        if (!account) {
            return res.status(401).json({ message: 'Invalid Flow account' });
        }

        res.json({
            address,
            balance: account.balance,
            contracts: Object.keys(account.contracts),
            keys: account.keys.map(key => ({
                index: key.index,
                publicKey: key.publicKey,
                weight: key.weight,
                sequenceNumber: key.sequenceNumber,
                revoked: key.revoked
            }))
        });
    } catch (error) {
        console.error('Failed to fetch account details:', error);
        res.status(500).json({ message: 'Failed to fetch account details' });
    }
});

// Refresh token
router.post('/refresh', verifyToken, rateLimiter, (req, res) => {
    try {
        const { address } = req.user;
        const newToken = generateToken({ address, type: 'flow' });
        res.json({ token: newToken });
    } catch (error) {
        console.error('Failed to refresh token:', error);
        res.status(500).json({ message: 'Failed to refresh token' });
    }
});

// Logout
router.post('/logout', verifyToken, rateLimiter, (req, res) => {
    // Since we're using JWT, we don't need to do anything server-side
    // The client should remove the token from storage
    res.json({ message: 'Logged out successfully' });
});

export default router; 