import CodeMarketplace from 0x9d2ade18cb6bea1a

transaction(listingId: UInt64) {
    prepare(signer: AuthAccount) {
        // Verify the signer has enough FLOW tokens
        let vault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow token vault")
    }

    execute {
        let success = CodeMarketplace.purchaseCode(listingId: listingId)
        assert(success, message: "Failed to purchase code")
        log("Successfully purchased code for listing: ".concat(listingId.toString()))
    }
} 