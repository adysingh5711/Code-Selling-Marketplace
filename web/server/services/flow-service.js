// services/flow-service.js
const fcl = require('@onflow/fcl');
const t = require('@onflow/types');
const fs = require('fs');
const path = require('path');

// Configure FCL
fcl.config()
    .put('accessNode.api', process.env.FLOW_ACCESS_API || 'https://rest-testnet.onflow.org')
    .put('discovery.wallet', process.env.FLOW_WALLET_API || 'https://fcl-discovery.onflow.org/testnet/authn');

// Storage for code content (in production, use a database)
const codeStorage = {};

// Read script files
const getListingsScript = fs.readFileSync(
    path.resolve(__dirname, '../../../scripts/GetListings.cdc'),
    'utf8'
);

const listCodeTx = fs.readFileSync(
    path.resolve(__dirname, '../../../transactions/ListCode.cdc'),
    'utf8'
);

const buyCodeTx = fs.readFileSync(
    path.resolve(__dirname, '../../../transactions/BuyCode.cdc'),
    'utf8'
);

// Get all listings
async function getListings() {
    try {
        const result = await fcl.query({
            cadence: getListingsScript
        });

        // Enhance listings with stored code if available
        return result.map(listing => ({
            ...listing,
            code: codeStorage[listing.id] || null
        }));
    } catch (error) {
        console.error('Error executing script:', error);
        throw error;
    }
}

// Create a new listing
async function createListing(title, description, price, codeHash, code) {
    try {
        const transactionId = await fcl.mutate({
            cadence: listCodeTx,
            args: (arg, t) => [
                arg(title, t.String),
                arg(description, t.String),
                arg(price.toFixed(8), t.UFix64),
                arg(codeHash, t.String)
            ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 100
        });

        const transaction = await fcl.tx(transactionId).onceSealed();

        // Store the code content (in production, use a database)
        if (transaction.events && transaction.events.length > 0) {
            // Find the listing ID from events
            // For simplicity, we're using the transaction ID here
            codeStorage[transactionId] = code;
        }

        return {
            transactionId,
            status: transaction.status
        };
    } catch (error) {
        console.error('Error executing transaction:', error);
        throw error;
    }
}

// Purchase a listing
async function purchaseListing(id) {
    try {
        const transactionId = await fcl.mutate({
            cadence: buyCodeTx,
            args: (arg, t) => [arg(id, t.UInt64)],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 100
        });

        const transaction = await fcl.tx(transactionId).onceSealed();

        return {
            transactionId,
            status: transaction.status,
            code: codeStorage[id] || null
        };
    } catch (error) {
        console.error('Error executing transaction:', error);
        throw error;
    }
}

module.exports = {
    getListings,
    createListing,
    purchaseListing
};