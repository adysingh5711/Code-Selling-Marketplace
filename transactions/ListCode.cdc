import CodeMarketplace from 0x9d2ade18cb6bea1a

transaction(
    title: String,
    description: String,
    price: UFix64,
    codeHash: String
) {
    prepare(signer: AuthAccount) {}

    execute {
        CodeMarketplace.createListing(
            title: title,
            description: description,
            price: price,
            codeHash: codeHash
        )
    }
}