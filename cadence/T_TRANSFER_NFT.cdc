import R3VNFTS from $service

transaction(nftId: UInt64) {

    let transferNft: @R3VNFTs.NFT

    prepare(seller: AuthAccount) {

        let nftCollectionRef = seller.borrow<&R3VNFTs.Collection>(from: /storage/RevNFTCollection)
            ?? panic("Could not borrow a reference to the seller collection")
        self.transferNft <- nftCollectionRef.withdraw(withdrawID: nftId)
    }

    execute {
        let buyerNFTs = getAccount($buyer)
        let nftReceiver = buyerNFTs.getCapability<&{R3VNFTs.NFTReceiver}>(/public/RevNFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        nftReceiver.deposit(token: <-self.transferNft)
    }
}