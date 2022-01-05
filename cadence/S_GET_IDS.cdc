import R3VNFTS from 0x$service

pub fun main(): [UInt64] {
    let nftOwner = getAccount(0x$account)
    let capability = nftOwner.getCapability<&{R3VNFTs.NFTReceiver}>(/public/RevNFTReceiver)
    let receiverRef = capability.borrow()
            ?? panic("Could not borrow the receiver reference")
    return(receiverRef.getIDs())
}