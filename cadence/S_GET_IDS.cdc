import R3VNFTS from 0x$service

pub fun main(): [Int] {
    let nftOwner = getAccount(0x$account)
    let capability = nftOwner.getCapability<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver)
    let receiverRef = capability.borrow()
            ?? panic("Could not borrow the receiver reference")
    return(receiverRef.getIDs())
}