// Join us by visiting https://r3volution.io
pub contract R3VNFTS {

    pub event NFTMinted(id: Int, md: String)
    pub event NFTWithdraw(id: Int, md: String)
    pub event NFTDeposit(id: Int, md: String)

    pub resource NFT {
        pub let id: Int
        pub let metadata: String // our metadata is a hex-encoded gzipped JSON string
        init(id: Int, metadata: String) {
            self.id = id
            self.metadata = metadata
        }
    }

    pub resource interface NFTReceiver {
        pub fun deposit(token: @NFT)
        pub fun getIDs(): [Int]
        pub fun idExists(id: Int): Bool
        pub fun getMetadata(ids: [Int]): [String]
    }

    pub resource Collection: NFTReceiver {
        pub var ownedNFTs: @{Int: NFT}
        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: Int): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID)!
            emit NFTWithdraw(id: token.id, md: token.metadata)
            return <-token
        }

        pub fun deposit(token: @NFT) {
            emit NFTDeposit(id: token.id, md: token.metadata)
            self.ownedNFTs[token.id] <-! token
        }

        pub fun idExists(id: Int): Bool {
            return self.ownedNFTs[id] != nil
        }

        pub fun getIDs(): [Int] {
            return self.ownedNFTs.keys
        }

        pub fun getMetadata(ids: [Int]): [String] {
            var ret: [String] = []
            for id in ids {
                ret.append(self.ownedNFTs[id]?.metadata!)
            }
            return ret
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    pub resource NFTMinter {
        pub var idCount: Int
        init() {
            self.idCount = 1
        }
        pub fun mintNFT(metadata: String): @NFT {
            var newNFT <- create NFT(id: self.idCount, metadata: metadata)
            self.idCount = self.idCount + 1
            emit NFTMinted(id: newNFT.id, md: metadata)
            return <-newNFT
        }
    }

	init() {
        self.account.save(<-self.createEmptyCollection(), to: /storage/RevNFTCollection)
        self.account.link<&{NFTReceiver}>(/public/RevNFTReceiver, target: /storage/RevNFTCollection)
        self.account.save(<-create NFTMinter(), to: /storage/RevNFTMinter)
	}
}
 