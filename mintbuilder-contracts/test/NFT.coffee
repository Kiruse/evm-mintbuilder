{time, loadFixture} = require "@nomicfoundation/hardhat-network-helpers"
{ anyValue } = require "@nomicfoundation/hardhat-chai-matchers/withArgs"
{ expect } = require "chai"
{ ethers } = require "hardhat"

# because MintBuilderNFT builds upon OpenZeppelin's ERC721, we only need to test the additional
# functionality that we've implemented
describe 'NFT', ->
  fixture = ->
    [alice] = await ethers.getSigners()
    NFT = await ethers.getContractFactory 'MintBuilderNFT'
    nft = await NFT.deploy 'Test NFT', 'TNFT', alice.address
    return {NFT, nft}
  
  it 'name & symbol', ->
    {nft} = await loadFixture fixture
    expect(await nft.name()).to.equal 'Test NFT'
    expect(await nft.symbol()).to.equal 'TNFT'
  
  it 'mints', ->
    [alice, bob] = await ethers.getSigners()
    {nft} = await loadFixture fixture
    
    await nft.mint alice.address, 1
    await nft.setMetadata 1, 'foo.json'
    expect(nft.ownerOf 1).to.eventually.equal alice.address
    expect(nft.tokenURI 1).to.eventually.equal 'foo.json'
    
    await nft.mint bob.address, 2
    await nft.setMetadata 2, 'bar.json'
    expect(nft.ownerOf 2).to.eventually.equal bob.address
    expect(nft.tokenURI 2).to.eventually.equal 'bar.json'
    
    await expect(nft.connect(bob).mint bob.address, 3)
      .to.be.revertedWith 'MBNFT1::UNAUTHORIZED'
    await expect(nft.ownerOf 3).to.be.revertedWith 'ERC721: invalid token ID'
  
  it 'prevents re-assigning metadata', ->
    [alice, bob] = await ethers.getSigners()
    {nft} = await loadFixture fixture
    
    await nft.mint alice.address, 1
    await nft.setMetadata 1, 'foo.json'
    await expect(nft.setMetadata 1, 'bar.json').to.be.revertedWith 'MBNFT1::ALREADY_SET'
    expect(nft.tokenURI 2).to.eventually.equal 'foo.json'
    
    await nft.mint bob.address, 2
    await nft.setMetadata 2, 'bar.json'
    await expect(nft.setMetadata 2, 'baz.json').to.be.revertedWith 'MBNFT1::ALREADY_SET'
    expect(nft.tokenURI 2).to.eventually.equal 'bar.json'
  
  it 'transfers ownership', ->
    [alice, bob] = await ethers.getSigners()
    {nft: nftAlice} = await loadFixture fixture
    nftBob = nftAlice.connect bob
    
    tryWith = (nft, me, other) =>
      await nft.setMinter other
      expect(nft.minter()).to.eventually.equal other
      await expect(nft.setMinter me).to.be.revertedWith 'MBNFT1::UNAUTHORIZED'
    
    await tryWith nftAlice, alice.address, bob.address
    await tryWith nftBob, bob.address, alice.address
    await tryWith nftAlice, alice.address, bob.address
