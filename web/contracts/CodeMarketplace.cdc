pub contract CodeMarketplace {
    pub struct Listing {
        pub let id: UInt64
        pub let owner: Address
        pub let title: String
        pub let description: String
        pub let price: UFix64
        pub let codeHash: String
        pub let timestamp: UFix64

        init(
            id: UInt64,
            owner: Address,
            title: String,
            description: String,
            price: UFix64,
            codeHash: String,
            timestamp: UFix64
        ) {
            self.id = id
            self.owner = owner
            self.title = title
            self.description = description
            self.price = price
            self.codeHash = codeHash
            self.timestamp = timestamp
        }
    }

    pub struct Purchase {
        pub let listingId: UInt64
        pub let buyer: Address
        pub let timestamp: UFix64

        init(listingId: UInt64, buyer: Address, timestamp: UFix64) {
            self.listingId = listingId
            self.buyer = buyer
            self.timestamp = timestamp
        }
    }

    pub var listings: @{UInt64: Listing}
    pub var purchases: @{UInt64: Purchase}
    pub var nextListingId: UInt64

    pub event ListingCreated(
        id: UInt64,
        owner: Address,
        title: String,
        price: UFix64
    )

    pub event CodePurchased(
        listingId: UInt64,
        buyer: Address,
        price: UFix64
    )

    init() {
        self.listings = {}
        self.purchases = {}
        self.nextListingId = 0
    }

    pub fun createListing(
        title: String,
        description: String,
        price: UFix64,
        codeHash: String
    ): UInt64 {
        let listing = Listing(
            id: self.nextListingId,
            owner: self.account.address,
            title: title,
            description: description,
            price: price,
            codeHash: codeHash,
            timestamp: getCurrentBlock().timestamp
        )

        self.listings[self.nextListingId] = listing
        let listingId = self.nextListingId
        self.nextListingId = self.nextListingId + 1

        emit ListingCreated(
            id: listingId,
            owner: self.account.address,
            title: title,
            price: price
        )

        return listingId
    }

    pub fun purchaseCode(listingId: UInt64): Bool {
        let listing = self.listings[listingId]
        if listing == nil {
            return false
        }

        // Transfer FLOW tokens from buyer to seller
        let payment <- FlowToken.balance.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
        let price = listing!.price
        let paymentAmount = payment.withdraw(amount: price)
        let sellerVault = getAccount(listing!.owner).getCapability(/public/flowTokenReceiver)
            .borrow<&{FlowToken.Receiver}>()
            ?? panic("Could not borrow seller vault")
        sellerVault.deposit(from: <-paymentAmount)

        // Record the purchase
        let purchase = Purchase(
            listingId: listingId,
            buyer: self.account.address,
            timestamp: getCurrentBlock().timestamp
        )
        self.purchases[listingId] = purchase

        emit CodePurchased(
            listingId: listingId,
            buyer: self.account.address,
            price: price
        )

        return true
    }

    pub fun getListing(id: UInt64): Listing? {
        return self.listings[id]
    }

    pub fun getPurchase(listingId: UInt64): Purchase? {
        return self.purchases[listingId]
    }

    pub fun getListingsByOwner(owner: Address): [Listing] {
        var ownerListings: [Listing] = []
        for listing in self.listings.values {
            if listing.owner == owner {
                ownerListings.append(listing)
            }
        }
        return ownerListings
    }

    pub fun getPurchasesByBuyer(buyer: Address): [Purchase] {
        var buyerPurchases: [Purchase] = []
        for purchase in self.purchases.values {
            if purchase.buyer == buyer {
                buyerPurchases.append(purchase)
            }
        }
        return buyerPurchases
    }
} 