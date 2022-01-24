import R3VNFTS from 0x$service

transaction {
  prepare(acct: AuthAccount) {
    // create a new collection
    let collection <- R3VNFTS.createEmptyCollection()
    // save the new collection
    acct.save<@R3VNFTS.Collection>(<-collection, to: /storage/RevNFTCollection)
    // create the public interface link
    acct.link<&{R3VNFTS.NFTReceiver}>(/public/RevNFTReceiver, target: /storage/RevNFTCollection)
  }
}
 