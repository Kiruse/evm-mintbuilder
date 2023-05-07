# Stargaze MintBuilder
*MintBuilder* is a custom minter for [Stargaze](https://www.stargaze.zone). It consists of a 3-part system of frontend, backend, and smart contracts.

A user of *MintBuilder* can mint a customized NFT with chosen traits - given this exact configuration of traits hasn't already been chosen. This is accomplished in 4 relatively simple steps:

1. User chooses their NFT's traits and commits them to the minter, along with the necessary funds. The minter asserts funds are exact and stores this commitment.
2. User then requests *Backend* to mint their NFT, revealing their commitment. The commitment consists of their choice of traits as JSON hashed together with a random number using keccak256.
3. Backend verifies commitment against on-chain storage. Only if valid it will generate the NFT's image & metadata, store it on IPFS, and issue the minter to mint the NFT, supplying generated image & metadata URLs.
4. Minter issues standard sg721 to mint a new NFT with given URLs directly to user's wallet, and the commitment is erased from storage.

We use a cryptographic commitment for 2 reasons:

1. Chosen traits need not be stored on the blockchain directly, minimizing on-chain storage footprint, and
2. Cryptographically secured commitment prevents a malicious third party from interfering with the minting process after a user has deposited the minting fee, but before the user has issued the minting request to the backend themselves. It does not require a cryptographic signature to verify ownership of the wallet, which isn't fully standardized in the Cosmos ecosystem yet (see [ADR-36](https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-036-arbitrary-signature.md)).

## Regarding Metadata
Although metadata can technically also be stored on-chain, it requires much more storage than typical smart contracts. We have been advised against such a solution if possible by the Stargaze team. As the image needs to be generated & stored on IPFS off-chain anyways, we choose to follow the Stargaze team's advice and also generate & store the metadata off-chain.
