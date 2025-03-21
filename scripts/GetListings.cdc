import CodeMarketplace from 0x9d2ade18cb6bea1a

pub fun main(): [CodeMarketplace.CodeListing] {
    return CodeMarketplace.getListings()
}