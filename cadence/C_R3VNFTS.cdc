pub contract R3VNFTS {

    pub resource NFT {
        access(contract) let id: UInt64                 // our secondary UUID
        access(contract) let drop: UInt64               // our drop 
        access(contract) let date: UInt64               // date of our event in seconds since epoch
        access(contract) let serial: UInt64             // sequence number of this specific NFT
        access(contract) let target: UInt64             // target mint quantity
        access(contract) let title: String              // drop title
        access(contract) let ipfsCID: String            // IPFS CID for our MP4 file
        access(contract) let royalty: UFix64            // percentage as a decimal
        access(contract) let split: String              // percentage split as a decimal (venue / artists) 0.5 = half
        access(contract) let venueWallet: String        // venue wallet address
        access(contract) let artistWallets: [String]    // artist wallet addresses
        access(contract) let musicianWallets: [String]  // musician wallet addresses
        access(contract) let primary: Bool              // we waive the royalty for the initial sale
        init(id: UInt64, drop: UInt64, date: UInt64, serial: UInt64, target: UInt64, title: String, ipfsCID: String, royalty: UFix64, split: String, venueWallet: String, artistWallets: [String], musicianWallets: [String]) {
            self.id = id
            self.drop = drop
            self.date = date
            self.serial = serial
            self.target = target
            self.title = title
            self.ipfsCID = ipfsCID
            self.royalty = royalty
            self.split = split
            self.venueWallet = venueWallet
            self.artistWallets = artistWallets
            self.musicianWallets =musicianWallets
            self.primary = true
        }
    }

    pub resource interface NFTReceiver {
        pub fun deposit(token: @NFT)
        pub fun getIDs(): [UInt64]
        pub fun idExists(id: UInt64): Bool
    }

    pub resource Collection: NFTReceiver {
        pub var ownedNFTs: @{UInt64: NFT}
        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID)!
            return <-token
        }

        pub fun deposit(token: @NFT) {
            self.ownedNFTs[token.id] <-! token
        }

        pub fun idExists(id: UInt64): Bool {
            return self.ownedNFTs[id] != nil
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    pub resource NFTMinter {

        pub fun mintNFT(id: UInt64, drop: UInt64, date: UInt64, serial: UInt64, target: UInt64, title: String, ipfsCID: String, royalty: UFix64, split: String, venueWallet: String, artistWallets: [String], musicianWallets: [String]): @NFT {
            var newNFT <- create NFT(id: id, drop: drop, date: date, serial: serial, target: target, title: title, ipfsCID: ipfsCID, royalty: royalty, split: split, venueWallet: venueWallet, artistWallets: artistWallets, musicianWallets: musicianWallets)
            return <-newNFT
        }
    }

	init() {
        self.account.save(<-self.createEmptyCollection(), to: /storage/RevNFTCollection)
        self.account.link<&{NFTReceiver}>(/public/RevNFTReceiver, target: /storage/RevNFTCollection)
        self.account.save(<-create NFTMinter(), to: /storage/RevNFTMinter)
	}
}
 