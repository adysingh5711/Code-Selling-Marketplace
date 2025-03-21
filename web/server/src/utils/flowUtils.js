import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

// Initialize Flow client
fcl.config({
    'accessNode.api': process.env.FLOW_ACCESS_NODE,
    'flow.network': process.env.FLOW_NETWORK || 'testnet'
});

// Contract addresses
const CONTRACTS = {
    MARKETPLACE: process.env.MARKETPLACE_CONTRACT_ADDRESS,
    BOUNTY: process.env.BOUNTY_CONTRACT_ADDRESS
};

// Transaction templates
const TRANSACTIONS = {
    CREATE_LISTING: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}
    import FlowToken from 0x7e60df042a9c0868
    import FungibleToken from 0x9a0766d93b6608b7

    transaction(
      id: String,
      title: String,
      description: String,
      price: UFix64,
      codeHash: String,
      language: String,
      tags: [String]
    ) {
      let marketplace: &CodeMarketplace.Marketplace
      let vault: @FungibleToken.Vault

      prepare(signer: AuthAccount) {
        self.marketplace = signer.borrow<&CodeMarketplace.Marketplace>(from: /storage/CodeMarketplace)
        self.vault = signer.borrow<@FungibleToken.Vault>(from: /storage/flowTokenVault)
      }

      execute {
        self.marketplace.createListing(
          id: id,
          title: title,
          description: description,
          price: price,
          codeHash: codeHash,
          language: language,
          tags: tags
        )
      }
    }
  `,

    PURCHASE_LISTING: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}
    import FlowToken from 0x7e60df042a9c0868
    import FungibleToken from 0x9a0766d93b6608b7

    transaction(listingId: String) {
      let marketplace: &CodeMarketplace.Marketplace
      let vault: @FungibleToken.Vault

      prepare(signer: AuthAccount) {
        self.marketplace = signer.borrow<&CodeMarketplace.Marketplace>(from: /storage/CodeMarketplace)
        self.vault = signer.borrow<@FungibleToken.Vault>(from: /storage/flowTokenVault)
      }

      execute {
        self.marketplace.purchaseListing(listingId: listingId)
      }
    }
  `,

    COMPLETE_PURCHASE: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}

    transaction(listingId: String) {
      let marketplace: &CodeMarketplace.Marketplace

      prepare(signer: AuthAccount) {
        self.marketplace = signer.borrow<&CodeMarketplace.Marketplace>(from: /storage/CodeMarketplace)
      }

      execute {
        self.marketplace.completePurchase(listingId: listingId)
      }
    }
  `
};

// Script templates
const SCRIPTS = {
    GET_LISTING: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}

    pub fun main(listingId: String): CodeMarketplace.Listing? {
      return CodeMarketplace.getListing(listingId: listingId)
    }
  `,

    GET_PURCHASE: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}

    pub fun main(purchaseId: String): CodeMarketplace.Purchase? {
      return CodeMarketplace.getPurchase(purchaseId: purchaseId)
    }
  `,

    GET_USER_LISTINGS: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}

    pub fun main(address: Address): [CodeMarketplace.Listing] {
      return CodeMarketplace.getUserListings(address: address)
    }
  `,

    GET_USER_PURCHASES: `
    import CodeMarketplace from ${CONTRACTS.MARKETPLACE}

    pub fun main(address: Address): [CodeMarketplace.Purchase] {
      return CodeMarketplace.getUserPurchases(address: address)
    }
  `
};

// Execute a transaction
export const executeTransaction = async (code, args, proposer, payer, authorizer) => {
    try {
        const transactionId = await fcl.mutate({
            cadence: code,
            args: args,
            proposer: proposer,
            payer: payer,
            authorizer: authorizer,
            limit: 9999
        });

        return await fcl.tx(transactionId).onceSealed();
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
};

// Execute a script
export const executeScript = async (code, args) => {
    try {
        return await fcl.query({
            cadence: code,
            args: args
        });
    } catch (error) {
        console.error('Script failed:', error);
        throw error;
    }
};

// Create a new listing
export const createListing = async (listingData, proposer, payer, authorizer) => {
    const args = [
        fcl.arg(listingData.id, t.String),
        fcl.arg(listingData.title, t.String),
        fcl.arg(listingData.description, t.String),
        fcl.arg(listingData.price, t.UFix64),
        fcl.arg(listingData.codeHash, t.String),
        fcl.arg(listingData.language, t.String),
        fcl.arg(listingData.tags, t.Array(t.String))
    ];

    return await executeTransaction(
        TRANSACTIONS.CREATE_LISTING,
        args,
        proposer,
        payer,
        authorizer
    );
};

// Purchase a listing
export const purchaseListing = async (listingId, proposer, payer, authorizer) => {
    const args = [fcl.arg(listingId, t.String)];

    return await executeTransaction(
        TRANSACTIONS.PURCHASE_LISTING,
        args,
        proposer,
        payer,
        authorizer
    );
};

// Complete a purchase
export const completePurchase = async (listingId, proposer, payer, authorizer) => {
    const args = [fcl.arg(listingId, t.String)];

    return await executeTransaction(
        TRANSACTIONS.COMPLETE_PURCHASE,
        args,
        proposer,
        payer,
        authorizer
    );
};

// Get listing details
export const getListing = async (listingId) => {
    const args = [fcl.arg(listingId, t.String)];
    return await executeScript(SCRIPTS.GET_LISTING, args);
};

// Get purchase details
export const getPurchase = async (purchaseId) => {
    const args = [fcl.arg(purchaseId, t.String)];
    return await executeScript(SCRIPTS.GET_PURCHASE, args);
};

// Get user's listings
export const getUserListings = async (address) => {
    const args = [fcl.arg(address, t.Address)];
    return await executeScript(SCRIPTS.GET_USER_LISTINGS, args);
};

// Get user's purchases
export const getUserPurchases = async (address) => {
    const args = [fcl.arg(address, t.Address)];
    return await executeScript(SCRIPTS.GET_USER_PURCHASES, args);
}; 