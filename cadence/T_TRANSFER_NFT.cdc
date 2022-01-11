import R3VNFTS from 0x$service

transaction(nftId: Int) {

    let transferNft: @R3VNFTS.NFT

    prepare(seller: AuthAccount) {

        let nftCollectionRef = seller.borrow<&R3VNFTS.Collection>(from: /storage/RevNFTCollection)
            ?? panic("Could not borrow a reference to the seller collection")
        self.transferNft <- nftCollectionRef.withdraw(withdrawID: nftId)
    }

    execute {
        let buyerNFTs = getAccount(0x$buyer)
        let nftReceiver = buyerNFTs.getCapability<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        nftReceiver.deposit(token: <-self.transferNft)
    }
}