import R3VNFTS from 0x$service

transaction(nftId: Int) {

    // NFT reference temporary storage
    let transferNft: @R3VNFTS.NFT

    prepare(seller: AuthAccount) {
        // get the collection
        let nftCollectionRef = seller.borrow<&R3VNFTS.Collection>(from: /storage/RevNFTCollection)
            ?? panic("Could not borrow a reference to the seller collection")
        // move the NFT from the collection to the temporary reference storage
        self.transferNft <- nftCollectionRef.withdraw(withdrawID: nftId)
    }

    execute {
        // get the account the NFT will be deposited into
        let buyerNFTs = getAccount(0x$buyer)
        // obtain the public NFTReceiver interface for this account
        let nftReceiver = buyerNFTs.getCapability<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver)
            .borrow()
            // it's important to halt here if the receiver doesn't exist
            ?? panic("Could not borrow receiver reference")
        // deposit the NFT into the buyer account
        nftReceiver.deposit(token: <-self.transferNft)
    }
}