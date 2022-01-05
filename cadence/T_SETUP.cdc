import R3VNFTS from $service

transaction {
  prepare(acct: AuthAccount) {
    let collection <- R3VNFTs.createEmptyCollection()
    acct.save<@R3VNFTs.Collection>(<-collection, to: /storage/RevNFTCollection)
    acct.link<&{R3VNFTs.NFTReceiver}>(/public/RevNFTReceiver, target: /storage/RevNFTCollection)
  }
}
 