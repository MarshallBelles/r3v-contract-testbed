import R3VNFTS from 0x$service

transaction {
  prepare(acct: AuthAccount) {
    let collection <- R3VNFTS.createEmptyCollection()
    acct.save<@R3VNFTS.Collection>(<-collection, to: /storage/RevNFTCollection)
    acct.link<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver, target: /storage/RevNFTCollection)
  }
}
 