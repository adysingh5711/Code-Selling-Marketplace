pub contract CodeMarketplace {
    // Import the Flow token contract
    import FungibleToken from 0xFUNGIBLE_TOKEN
    import FlowToken from 0xFLOW_TOKEN
    import BountyContract from 0x9d2ade18cb6bea1a

    // Events
    pub event ListingCreated(id: UInt64, owner: Address, price: UFix64)
    pub event ListingPurchased(id: UInt64, buyer: Address, seller: Address, price: UFix64)
    pub event ListingRemoved(id: UInt64, owner: Address)
    pub event CodeAccessGranted(id: UInt64, buyer: Address)

    // Struct to hold listing information
    pub struct CodeListing {
        pub let id: UInt64
        pub let owner: Address
        pub let title: String
        pub let description: String
        pub let price: UFix64
        pub let codeHash: String
        pub let timestamp: UFix64
        pub let encryptedCode: String
        access(contract) var isActive: Bool
        access(contract) var escrowBalance: UFix64

        init(
            id: UInt64,
            owner: Address,
            title: String,
            description: String,
            price: UFix64,
            codeHash: String,
            encryptedCode: String
        ) {
            self.id = id
            self.owner = owner
            self.title = title
            self.description = description
            self.price = price
            self.codeHash = codeHash
            self.timestamp = getCurrentBlock().timestamp
            self.encryptedCode = encryptedCode
            self.isActive = true
            self.escrowBalance = 0.0
        }
    }

    // Resource interface for code access
    pub resource interface CodeAccess {
        pub fun getCode(): String
        pub fun verifyHash(): Bool
    }

    // Resource for purchased code
    pub resource PurchasedCode: CodeAccess {
        priv let code: String
        priv let codeHash: String

        init(code: String, codeHash: String) {
            self.code = code
            self.codeHash = codeHash
        }

        pub fun getCode(): String {
            return self.code
        }

        pub fun verifyHash(): Bool {
            // Implement hash verification logic
            return true
        }
    }

    // Vault capability for handling payments
    access(self) var flowTokenVault: @FungibleToken.Vault?

    // Main contract storage
    pub var totalListings: UInt64
    access(self) var listings: {UInt64: CodeListing}
    access(self) var userListings: {Address: [UInt64]}
    access(self) var escrowVault: @FungibleToken.Vault
    access(self) var bountyVault: @FungibleToken.Vault

    // Constants
    pub let ESCROW_PERIOD: UFix64
    pub let PLATFORM_FEE_PERCENTAGE: UFix64
    pub let BOUNTY_PERCENTAGE: UFix64

    pub fun createListing(
        title: String,
        description: String,
        price: UFix64,
        codeHash: String,
        encryptedCode: String
    ) {
        pre {
            price > 0.0: "Price must be greater than 0"
            title.length > 0: "Title cannot be empty"
            description.length > 0: "Description cannot be empty"
            codeHash.length > 0: "Code hash cannot be empty"
            encryptedCode.length > 0: "Encrypted code cannot be empty"
        }

        let listing = CodeListing(
            id: self.totalListings,
            owner: self.account.address,
            title: title,
            description: description,
            price: price,
            codeHash: codeHash,
            encryptedCode: encryptedCode
        )

        self.listings[self.totalListings] = listing

        if self.userListings[self.account.address] == nil {
            self.userListings[self.account.address] = []
        }
        self.userListings[self.account.address]!.append(self.totalListings)

        emit ListingCreated(id: self.totalListings, owner: self.account.address, price: price)

        self.totalListings = self.totalListings + 1
    }

    pub fun purchaseListing(id: UInt64, payment: @FungibleToken.Vault) {
        pre {
            self.listings[id] != nil: "Listing does not exist"
            self.listings[id]!.isActive: "Listing is not active"
            payment.balance >= self.listings[id]!.price: "Insufficient payment"
        }

        let listing = self.listings[id]!
        let paymentAmount = payment.balance

        // Calculate fees
        let platformFee = paymentAmount * self.PLATFORM_FEE_PERCENTAGE
        let bountyFee = paymentAmount * self.BOUNTY_PERCENTAGE
        let sellerAmount = paymentAmount - platformFee - bountyFee

        // Hold payment in escrow
        self.escrowVault.deposit(from: <-payment)
        listing.escrowBalance = paymentAmount

        // Send platform fee to platform vault
        let platformPayment <- self.escrowVault.withdraw(amount: platformFee)
        self.flowTokenVault?.deposit(from: <-platformPayment)

        // Send bounty fee to bounty contract
        let bountyPayment <- self.escrowVault.withdraw(amount: bountyFee)
        self.bountyVault.deposit(from: <-bountyPayment)
        BountyContract.processBounty(amount: bountyFee)

        // Create code access for buyer
        let codeAccess <- create PurchasedCode(
            code: listing.encryptedCode,
            codeHash: listing.codeHash
        )

        // Save code access to buyer's storage
        let buyer = self.account.address
        self.account.save(<-codeAccess, to: /storage/PurchasedCode_id)

        emit ListingPurchased(
            id: id,
            buyer: buyer,
            seller: listing.owner,
            price: paymentAmount
        )

        emit CodeAccessGranted(id: id, buyer: buyer)
    }

    pub fun completePurchase(id: UInt64) {
        pre {
            self.listings[id] != nil: "Listing does not exist"
            self.listings[id]!.escrowBalance > 0.0: "No funds in escrow"
        }

        let listing = self.listings[id]!
        let sellerPayment <- self.escrowVault.withdraw(amount: listing.escrowBalance)
        
        // Transfer remaining amount to seller
        let seller = getAccount(listing.owner)
        let sellerVault = seller.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow seller vault")
        
        sellerVault.deposit(from: <-sellerPayment)
        listing.escrowBalance = 0.0
        listing.isActive = false

        emit ListingRemoved(id: id, owner: listing.owner)
    }

    pub fun removeListing(id: UInt64) {
        pre {
            self.listings[id] != nil: "Listing does not exist"
            self.listings[id]!.owner == self.account.address: "Only owner can remove listing"
            self.listings[id]!.escrowBalance == 0.0: "Cannot remove listing with funds in escrow"
        }

        let listing = self.listings[id]!
        self.listings.remove(key: id)

        emit ListingRemoved(id: id, owner: listing.owner)
    }

    pub fun getListings(): [CodeListing] {
        return self.listings.values
    }

    pub fun getUserListings(address: Address): [CodeListing] {
        let userListingIds = self.userListings[address] ?? []
        let results: [CodeListing] = []
        
        for id in userListingIds {
            if let listing = self.listings[id] {
                results.append(listing)
            }
        }
        
        return results
    }

    init() {
        self.totalListings = 0
        self.listings = {}
        self.userListings = {}
        
        // Initialize vaults
        self.flowTokenVault <- FungibleToken.createEmptyVault()
        self.escrowVault <- FungibleToken.createEmptyVault()
        self.bountyVault <- FungibleToken.createEmptyVault()

        // Set constants
        self.ESCROW_PERIOD = 172800.0 // 48 hours in seconds
        self.PLATFORM_FEE_PERCENTAGE = 0.025 // 2.5%
        self.BOUNTY_PERCENTAGE = 0.005 // 0.5%
    }

    destroy() {
        destroy self.flowTokenVault
        destroy self.escrowVault
        destroy self.bountyVault
    }
}