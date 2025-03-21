import CodeMarketplace from 0x9d2ade18cb6bea1a

transaction(title: String, description: String, price: UFix64, codeHash: String) {
    prepare(signer: AuthAccount) {
        // Verify the signer has enough FLOW tokens
        let vault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow token vault")
    }

    execute {
        let listingId = CodeMarketplace.createListing(
            title: title,
            description: description,
            price: price,
            codeHash: codeHash
        )
        log("Created listing with ID: ".concat(listingId.toString()))
    }
} 