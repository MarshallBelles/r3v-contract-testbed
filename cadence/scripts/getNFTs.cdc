import R3VNFTS from 0x$service

pub fun main(ids: [Int]): [String] {
    // get account to check for
    let nftOwner = getAccount(0x$account)
    // get the NFTReceiver interface and ensure it's available
    let capability = nftOwner.getCapability<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver)
    let receiverRef = capability.borrow()
            ?? panic("Could not borrow the receiver reference")
    // get metadata for the provided IDs
    return(receiverRef.getMetadata(ids: ids))
}