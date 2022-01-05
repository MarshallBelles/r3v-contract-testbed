import R3VNFTS from 0x$service

transaction(metadata: [String]) {

    let receiverRef: &{R3VNFTs.NFTReceiver}
    let minterRef: &R3VNFTs.NFTMinter

    prepare(acct: AuthAccount) {
        self.receiverRef = acct.getCapability<&{R3VNFTs.NFTReceiver}>(/public/RevNFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")
        self.minterRef = acct.borrow<&R3VNFTs.NFTMinter>(from: /storage/RevNFTMinter)
            ?? panic("Could not borrow minter reference")
    }

    execute {
        var i: Int = 0;
        while i < metadata.length {
            let newNFT <- self.minterRef.mintNFT(meta: metadata[i])
            self.receiverRef.deposit(token: <-newNFT)
            i = i + 1
        }
    }
}
