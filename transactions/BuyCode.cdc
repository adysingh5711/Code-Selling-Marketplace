import CodeMarketplace from 0x9d2ade18cb6bea1a

transaction(listingId: UInt64) {
    prepare(buyer: AuthAccount) {}

    execute {
        CodeMarketplace.purchaseListing(id: listingId)
    }
}