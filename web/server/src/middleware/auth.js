import jwt from 'jsonwebtoken';
import * as fcl from '@onflow/fcl';

// Verify JWT token
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Verify Flow account ownership
export const verifyFlowAccount = async (req, res, next) => {
    const { address } = req.user;

    if (!address) {
        return res.status(401).json({ message: 'No Flow address provided' });
    }

    try {
        // Verify the user owns the Flow account
        const account = await fcl.account(address);
        if (!account) {
            return res.status(401).json({ message: 'Invalid Flow account' });
        }

        // Check if the account has the required capabilities
        const hasMarketplace = await fcl.account(address).then(acc =>
            acc.contracts[process.env.MARKETPLACE_CONTRACT_ADDRESS] !== undefined
        );

        if (!hasMarketplace) {
            return res.status(401).json({ message: 'Account does not have marketplace access' });
        }

        req.flowAccount = account;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Failed to verify Flow account' });
    }
};

// Generate JWT token
export const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

// Verify Flow transaction signature
export const verifyFlowTransaction = async (transactionId, address) => {
    try {
        const transaction = await fcl.tx(transactionId).onceSealed();

        // Verify the transaction was executed by the correct account
        if (transaction.proposer !== address) {
            return false;
        }

        // Verify the transaction status
        if (transaction.status !== 4) { // 4 is SEALED status
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to verify Flow transaction:', error);
        return false;
    }
};

// Authenticate Flow user
export const authenticateFlowUser = async (req, res, next) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ message: 'Flow address is required' });
        }

        // Verify the Flow account exists and has required capabilities
        const account = await fcl.account(address);
        if (!account) {
            return res.status(401).json({ message: 'Invalid Flow account' });
        }

        // Generate JWT token with Flow account info
        const token = generateToken({
            address,
            type: 'flow'
        });

        res.json({ token });
    } catch (error) {
        console.error('Flow authentication failed:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

// Rate limiting middleware
export const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    // Get existing rate limit data
    const rateLimitData = req.app.locals.rateLimits?.[ip] || {
        count: 0,
        resetTime: now + windowMs
    };

    // Reset if window has passed
    if (now > rateLimitData.resetTime) {
        rateLimitData.count = 0;
        rateLimitData.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (rateLimitData.count >= maxRequests) {
        return res.status(429).json({
            message: 'Too many requests',
            resetTime: rateLimitData.resetTime
        });
    }

    // Increment counter
    rateLimitData.count++;

    // Store updated rate limit data
    if (!req.app.locals.rateLimits) {
        req.app.locals.rateLimits = {};
    }
    req.app.locals.rateLimits[ip] = rateLimitData;

    next();
}; 