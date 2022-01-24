import R3VNFTS from 0x$service

transaction(metadata: [String]) {

    // the receiving Collection interface
    let receiverRef: &{R3VNFTS.NFTReceiver}
    // the minter resource
    let minterRef: &R3VNFTS.NFTMinter

    prepare(acct: AuthAccount) {
        // try to get the /public/RevNFTReceiver
        self.receiverRef = acct.getCapability<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        // try to get the /storage/RevNFTMinter
        self.minterRef = acct.borrow<&R3VNFTS.NFTMinter>(from: /storage/RevNFTMinter)
            ?? panic("Could not borrow minter reference")
    }

    execute {
        // loop over the provided metadata
        var i: Int = 0;
        // our metadata is a hex-encoded gzipped JSON string
        while i < metadata.length {
            // create a new NFT for each encoded string
            let newNFT <- self.minterRef.mintNFT(metadata: metadata[i])
            // deposit the new NFT
            self.receiverRef.deposit(token: <-newNFT)
            // increment the loop
            i = i + 1
        }
    }
}
