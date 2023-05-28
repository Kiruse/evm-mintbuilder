{loadFixture} = require "@nomicfoundation/hardhat-network-helpers"
{anyValue} = require "@nomicfoundation/hardhat-chai-matchers/withArgs"
{expect} = require "chai"
crypto = require "node:crypto"
{ethers} = require "hardhat"

Addr0 = ethers.constants.AddressZero

none = =>
getFixtureToken = ({token}) => token

describe 'MintBuilder', ->
  fixtureBase = ->
    MintBuilder = await ethers.getContractFactory 'MintBuilder'
    minter = await MintBuilder.deploy()
    
    TestToken = await ethers.getContractFactory 'TestToken'
    token = await TestToken.deploy()
    
    NFTContract = await ethers.getContractFactory 'MintBuilderNFT'
    
    [alice, bob] = await ethers.getSigners()
    await token.transfer bob.address, 25
    return {minter, token, NFTContract}
  fixtureEvent = (getToken = none) ->
    {minter, NFTContract} = fix = await loadFixture fixtureBase
    token = getToken fix
    
    traits = [
      {foo: 'foo1', bar: 'bar1', baz: 'baz1'}, # alice
      {foo: 'foo2', bar: 'bar2', baz: 'baz2'}, # bob
      {foo: 'foo3', bar: 'bar3', baz: 'baz3'}, # carl
    ]
    traitLimits = [
      ['foo1', 10], ['bar1', 10], ['baz1', 10],
      ['foo2', 10], ['bar2', 10], ['baz2', 10],
      ['foo3',  1], ['bar3',  1], ['baz3',  1],
    ]
    
    [commitmentAlice, nonceAlice] = createTraitsCommitment traits[1]
    [commitmentBob,   nonceBob]   = createTraitsCommitment traits[2]
    
    [alice, bob] = await ethers.getSigners()
    await create minter, 25, token, traitLimits
    await commit minter.connect(alice), commitmentAlice, 25, token
    await commit minter.connect(bob),   commitmentBob,   25, token
    nft = await NFTContract.attach minter.getNFTContract()
    return {
      fix...,
      nft,
      feeToken: token,
      traits,
      alice:
        signer: alice
        address: alice.address
        commitment: commitmentAlice
        nonce: nonceAlice
        traits: traits[1]
      bob:
        signer: bob
        address: bob.address
        commitment: commitmentBob
        nonce: nonceBob
        traits: traits[2]
    }
  fixtureNative = => fixtureEvent(none)
  fixtureToken  = => fixtureEvent(getFixtureToken)
  
  it 'initializes', ->
    [alice] = await ethers.getSigners()
    {minter} = await loadFixture fixtureBase
    expect(minter.admin()).to.eventually.equals alice.address
    expect(minter.eventId()).to.eventually.equals 0
    expect(minter.getParamsCID()).to.eventually.equals 'bafyfoobar'
    expect(minter.isERC20Mint(0)).to.eventually.be.false
    expect(minter.isMintActive()).to.eventually.be.false
    await expect(minter["commit(uint256)"](1)).to.be.revertedWith 'MB1::MINT_INACTIVE'
  
  it 'creates mint events', ->
    [alice, bob] = await ethers.getSigners()
    {minter} = await loadFixture fixtureBase
    minterBob = minter.connect bob
    
    # unauthorized
    await expect(minterBob.create('foo', 'bar', '', Addr0, 0, 0, 0, [])).to.be.revertedWith 'MB1::UNAUTHORIZED'
    
    # event 1
    await expect(minter.create 'Test NFT', 'TNFT', '', Addr0, 0, 0, 0, []).to.emit(minter, 'CreateEvent').withArgs(1)
    expect(minter.eventId()).to.eventually.equals 1
    
    # event 2
    await expect(minter.create 'Test NFT 2', 'TNFT2', '', Addr0, 0, 0, 0, []).to.emit(minter, 'CreateEvent').withArgs(2)
    expect(minter.eventId()).to.eventually.equals 2
  
  it 'takes commitments', ->
    {minter} = await loadFixture fixtureBase
    [alice, bob] = await ethers.getSigners()
    [minterAlice, minterBob] = connectContract minter, alice, bob
    
    # event 1
    await expect(minter.create 'Test NFT', 'TNFT', '', Addr0, 0, 0, 0, []).to.emit(minter, 'CreateEvent').withArgs(1)
    await expect(commit minterAlice, 1).to.emit(minter, 'Commitment').withArgs(alice.address, 1, 1)
    await expect(commit minterBob, 1).to.be.revertedWith 'MB1::COMMITMENT_EXISTS'
    await expect(commit minterBob, 2).to.emit(minter, 'Commitment').withArgs(bob.address, 1, 2)
    
    # event 2
    await expect(minter.create 'Test NFT 2', 'TNFT2', '', Addr0, 0, 0, 0, []).to.emit(minter, 'CreateEvent').withArgs(2)
    expect(minter.eventId()).to.eventually.equals 2
    
    await expect(commit minterAlice, 1).to.emit(minter, 'Commitment').withArgs(alice.address, 2, 1)
    await expect(commit minterBob, 2).to.emit(minter, 'Commitment').withArgs(bob.address, 2, 2)
  
  describe 'commit', ->
    it 'native fee', ->
      run = (value, success) =>
        {minter} = await loadFixture fixtureNative
        if success
          await expect(commit minter, 1, value).to.emit(minter, 'Commitment')
        else
          await expect(commit minter, 1, value).to.be.revertedWith 'MB1::INVALID_MINT_FEE'
      await run  0, false
      await run 15, false
      await run 25, true
      await run 35, false
    it 'token fee', ->
      run = (value, success) =>
        [alice] = await ethers.getSigners()
        {minter, token} = await loadFixture fixtureToken
        getBalance = => token.balanceOf alice.address
        if success
          balance = await getBalance()
          await commit minter, 1, value, token
          expect(getBalance()).to.eventually.equals balance.sub(25)
        else
          await expect(commit minter, 1, value, token).to.be.revertedWith 'ERC20: insufficient allowance'
      await run  0, false
      await run 15, false
      await run 25, true
      await run 35, true
  
  describe 'mint', ->
    it "mints", ->
      {minter, alice, bob, nft} = await loadFixture fixtureNative
      
      await expect(minter.mint alice.commitment, Object.values(alice.traits))
        .to.emit(minter, 'Mint').withArgs(alice.address, 1, 1)
      await expect(minter.mint alice.commitment, Object.values(alice.traits))
        .to.be.revertedWith 'MB1::COMMITMENT_NOT_FOUND'
      
      await expect(minter.mint bob.commitment, Object.values(bob.traits))
        .to.emit(minter, 'Mint').withArgs(bob.address, 1, 2)
      await expect(minter.mint bob.commitment, Object.values(bob.traits))
        .to.be.revertedWith 'MB1::COMMITMENT_NOT_FOUND'
      
      await expect(nft.setMetadata 1, 'ipfs://bafybonk').to.be.revertedWith 'MBNFT1::UNAUTHORIZED'
      
      await minter.setMetadata 1, 'ipfs://bafyfoo'
      expect(nft.tokenURI 1).to.eventually.equals 'ipfs://bafyfoo'
      
      await minter.setMetadata 2, 'ipfs://bafybar'
      expect(nft.tokenURI 2).to.eventually.equals 'ipfs://bafybar'
      
      await expect(minter.setMetadata 2, 'ipfs://bafybaz').to.be.revertedWith 'MBNFT1::ALREADY_SET'
    it "prevents double-mint", ->
      {minter, alice, bob, traits} = await loadFixture fixtureNative
      
      # prevent bob from minting the same traits as alice
      [newCommitmentBob] = createTraitsCommitment alice.traits
      await commit minter.connect(bob.signer), newCommitmentBob, 25
      await minter.mint alice.commitment, Object.values(alice.traits)
      
      await expect(minter.mint bob.commitment, Object.values(alice.traits))
        .to.be.revertedWith 'MB1::ALREADY_MINTED'
    it "prevents excess mints", ->
      {minter, bob} = await loadFixture fixtureNative
      minterBob = minter.connect bob.signer
      
      traits = [
        ['foo1', 'bar2', 'baz3']
        ['foo2', 'bar1', 'baz3']
        ['foo3', 'bar3', 'baz3']
        ['foo3', 'bar3', 'baz2']
      ]
      commits = traits.map (t) => createTraitsCommitment(t)[0]
      success = [
        true
        false
        false
        true
      ]
      
      for i in [0...traits.length]
        await commit minterBob, commits[i], 25
        if success[i]
          await expect(minter.mint commits[i], traits[i])
            .to.emit(minter, 'Mint').withArgs(bob.address, 1, anyValue)
        else
          await expect(minter.mint commits[i], traits[i])
            .to.be.revertedWith 'MB1::TRAIT_MINTED_OUT'
      expect(minter.events(1).then((e) => e.lastTokenId)).to.eventually.equals 2
  
  describe 'refund', ->
    createTests = (subname, fixture) =>
      describe subname, ->
        it "refunds before mint (by user)", ->
          {minter, alice, bob} = await loadFixture fixture
          [minterAlice, minterBob] = connectContract minter, alice.signer, bob.signer
          
          await expect(minterBob.adminRefund(1, bob.commitment)).to.be.revertedWith 'MB1::UNAUTHORIZED'
          await expect(minterAlice.refund(1, bob.commitment)).to.be.revertedWith 'MB1::UNAUTHORIZED'
          await expect(minterBob.refund(1, bob.commitment)).to.emit(minter, 'Refund').withArgs(bob.address, 1, bob.commitment)
        it "refunds before mint (by admin)", ->
          {minter, bob} = await loadFixture fixture
          await expect(minter.adminRefund(1, bob.commitment)).to.emit(minter, 'Refund').withArgs(bob.address, 1, bob.commitment)
        it "prevents double-refund", ->
          {minter, bob} = await loadFixture fixture
          minterBob = minter.connect bob.signer
          
          await expect(minterBob.refund(1, bob.commitment)).to.emit(minter, 'Refund')
          await expect(minterBob.refund(1, bob.commitment)).to.be.revertedWith 'MB1::UNAUTHORIZED'
          await expect(minter.adminRefund(1, bob.commitment)).to.be.revertedWith 'MB1::NO_COMMITMENT'
        it "fails after mint", ->
          {minter, alice, bob} = await loadFixture fixture
          [minterAlice, minterBob] = connectContract minter, alice.signer, bob.signer
          
          await expect(minter.mint bob.commitment, Object.values(bob.traits)).to.emit(minter, 'Mint').withArgs(bob.address, 1, anyValue)
          # b/c minted & commitment removed
          await expect(minterBob.refund(  1, bob.commitment)).to.be.revertedWith 'MB1::UNAUTHORIZED'
          await expect(minterAlice.refund(1, bob.commitment)).to.be.revertedWith 'MB1::UNAUTHORIZED'
          await expect(minter.adminRefund(1, bob.commitment)).to.be.revertedWith 'MB1::NO_COMMITMENT'
    it "enforces authorization", ->
      [alice, bob] = await ethers.getSigners()
      {minter} = await loadFixture fixtureNative
      [minterAlice, minterBob] = connectContract minter, alice, bob
      
      await expect(minterBob.adminRefund(1, 0xB0B)).to.be.revertedWith 'MB1::UNAUTHORIZED'
      await expect(minterBob.refund(1, 0xA71CE)).to.be.revertedWith 'MB1::UNAUTHORIZED'
      await expect(minterAlice.refund(1, 0xB0B)).to.be.revertedWith 'MB1::UNAUTHORIZED'
    it "adminRefund", ->
      {minter, bob} = await loadFixture fixtureNative
      await expect(minter.adminRefund(1, bob.commitment))
        .to.emit(minter, 'Refund').withArgs(bob.address, 1, bob.commitment)
    createTests 'native', fixtureNative
    createTests 'token', fixtureToken
  
  it 'reverts commitments outside of mint event', ->
    # no mint event ever started
    [alice, bob] = await ethers.getSigners()
    {minter} = await loadFixture fixtureBase
    [minterAlice, minterBob] = connectContract minter, alice, bob
    
    await expect(commit minterAlice, 1).to.be.revertedWith 'MB1::MINT_INACTIVE'
    await expect(commit minterBob, 1).to.be.revertedWith 'MB1::MINT_INACTIVE'
    
    # mint event stopped
    {minter} = await loadFixture fixtureNative
    [minterAlice, minterBob] = connectContract minter, alice, bob
    await minter.stop()
    
    await expect(commit minterAlice, 1).to.be.revertedWith 'MB1::MINT_INACTIVE'
    await expect(commit minterBob, 1).to.be.revertedWith 'MB1::MINT_INACTIVE'

create = (minter, fee, token, traitLimits) => minter.create 'Test NFT', 'TNFT', 'bafyfoobar', token?.address or Addr0, fee, 0, 0, traitLimits
commit = (minter, hash, value, token) =>
  account = minter.signer
  if token
    await token.connect(account).approve minter.address, value
    await minter['commit(uint256)'](hash)
  else
    await minter['commit(uint256)'](hash, {value})
connectContract = (contract, signers...) => signers.map (signer) => contract.connect signer

# does not work in prod b/c traits should be sorted by layers
createTraitsCommitment = (traits) =>
  traitsBytes = []
  traits = if Array.isArray traits then traits else Object.values(traits)
  traits.forEach (trait) => traitsBytes.push ethers.utils.toUtf8Bytes(trait)...
  
  nonce = crypto.randomBytes(32)
  return [ethers.utils.keccak256([...traitsBytes, ...nonce]), nonce]
