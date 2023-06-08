import {createRequire} from 'node:module'
require = createRequire(import.meta.url)

import {getCommitment, getRandomNonce, MintBuilder} from '@evm-mintbuilder/common'
import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'
import * as chai from 'chai'
import {BigNumber} from 'ethers'
import {Collection} from '../dist/collection.js'
import {Generator} from '../dist/generator.js'
{ethers} = require('hardhat')

{expect} = chai
chai.use require 'chai-as-promised'

# address of the MintBuilder deployed to Polygon Testnet
MINTER_ADDRESS = '0x40946c44d2b4f1195192C0C18099d18a188BF50c'

it.skip = =>

env = (key) =>
  unless process.env[key]?
    throw Error "Missing env var: #{key}"
  process.env[key]

describe 'ArtGenerator', ->
  fixtureBase = ->
    [deployer] = await ethers.getSigners()
    factory = new MintBuilder deployer
    if env('TEST_ENV') is 'testnet'
      minter = MintBuilder.connect MINTER_ADDRESS, deployer
    else
      minter = await factory.deploy()
    return {
      minter,
      deployer,
      createGenerator: => Generator.create
        contract: minter.address
        signer: deployer
        nftStorageSecret: 'TEST' # 'TEST' is a special value for mock storage
    }
  fixtureFreeMint = ->
    {createGenerator} = fix = await loadFixture fixtureBase
    
    gen = await createGenerator()
    collection = new Collection 'Test Collection', 'TEST'
    
    layer1 = collection.addLayer 'Background'
    layer1.addAttribute 'RedBG',   Buffer.alloc(16)
    layer1.addAttribute 'BlueBG',  Buffer.alloc(16)
    layer1.addAttribute 'GreenBG', Buffer.alloc(16)
    
    layer2 = collection.addLayer 'Foreground'
    layer2.addAttribute 'RedFG',   Buffer.alloc(16)
    layer2.addAttribute 'BlueFG',  Buffer.alloc(16)
    layer2.addAttribute 'GreenFG', Buffer.alloc(16)
    
    return {
      fix...,
      gen,
      collection,
    }
  fixtureEvent = ->
    {gen, collection} = fix = await loadFixture fixtureFreeMint
    
    collection.feeToken = '0xABCDEF0123456789ABCDEF0123456789ABCDEF01'
    collection.feeAmount = 100
    
    return {
      fix...,
      collection,
    }
  
  it 'instantiates', ->
    {createGenerator} = await loadFixture fixtureBase
    gen = await createGenerator()
    
    expect(gen.isMintActive()).to.be.false
    expect(gen.isMintQueued()).to.eventually.be.false
    
    collection = new Collection 'Test Collection', 'TEST'
    await gen.createMintEvent collection
    expect(gen.eventId).to.eventually.deep.equals BigNumber.from(1)
    
    expect(gen.isMintActive()).to.be.true
    expect(gen.isMintQueued()).to.eventually.be.true
  
  it 'restores', ->
    {createGenerator} = await loadFixture fixtureBase
    gen = await createGenerator()
    
    collection = new Collection 'Test Collection', 'TEST'
    layer1 = collection.addLayer 'Background'
    layer1.addAttribute 'RedBG',   Buffer.alloc(16)
    layer1.addAttribute 'BlueBG',  Buffer.alloc(16)
    layer1.addAttribute 'GreenBG', Buffer.alloc(16)
    await gen.createMintEvent collection
    
    gen = await createGenerator()
    expect(gen.isMintQueued()).to.eventually.be.true
    await gen.restore()
    
    expect(gen.collection).to.deep.equals collection
    expect(gen.collection.layers).to.have.lengthOf 1
    expect(gen.collection.getTraits()).to.have.lengthOf 3
  
  it 'creates collections', ->
    {gen, collection} = await loadFixture fixtureEvent
    await gen.createMintEvent collection
    
    expect(gen.eventId).to.eventually.deep.equals BigNumber.from(1)
    
    traits =
      Background: collection.getTrait 'RedBG'
      Foreground: collection.getTrait 'RedFG'
    expect(=> gen.checkLimits traits).to.not.throw()
  
  it 'restarts & stops', ->
    {gen, collection} = await loadFixture fixtureEvent
    await gen.createMintEvent collection
    
    await gen.restartMintEvent new Date(Date.now() + 100000)
    expect(gen.isMintActive()).to.be.false
    expect(gen.isMintQueued()).to.eventually.be.true
    
    await gen.stopMintEvent()
    expect(gen.isMintActive()).to.be.false
    expect(gen.isMintQueued()).to.eventually.be.false
    
    await gen.restartMintEvent()
    expect(gen.isMintActive()).to.be.true
    expect(gen.isMintQueued()).to.eventually.be.true

  it 'fails to mint', ->
    [alice, bob] = await ethers.getSigners()
    {gen, collection} = await loadFixture fixtureFreeMint
    await gen.createMintEvent collection
    
    minter = await gen.getMinter bob
    
    traits1 =
      Background: collection.getTrait 'RedBG'
    traits2 =
      Background: collection.getTrait 'RedBG'
      Foreground: collection.getTrait 'RedFG'
    nonce = getRandomNonce()
    commit = getCommitment traits2, nonce
    
    # wrong traits (every layer must have a trait)
    expect(gen.mint bob.address, traits1, nonce).to.be.rejectedWith('invalid traits')
    # right traits, but not committed
    expect(gen.mint bob.address, traits2, nonce).to.be.rejectedWith(/reverted with reason string 'MB1::COMMITMENT_NOT_FOUND'/)
    
    # committed, wrong nonce, so commitment is different & thus not found
    await minter['commit(uint256)'] commit
    expect(gen.mint bob.address, traits2, getRandomNonce()).to.be.rejectedWith(/reverted with reason string 'MB1::COMMITMENT_NOT_FOUND'/)

  it 'mints', ->
    [alice, bob] = await ethers.getSigners()
    {gen, collection} = await loadFixture fixtureFreeMint
    minter = gen.getMinter(bob)
    await gen.createMintEvent collection
    
    traits =
      Background: collection.getTrait 'RedBG'
      Foreground: collection.getTrait 'RedFG'
    nonce = getRandomNonce()
    commit = getCommitment traits, nonce
    
    await minter['commit(uint256)'] commit
    expect(gen.mint bob.address, traits, nonce).to.eventually.deep.equals tokenId: 1n
    
    traits =
      Background: collection.getTrait 'BlueBG'
      Foreground: collection.getTrait 'BlueFG'
    nonce = getRandomNonce()
    commit = getCommitment traits, nonce
    
    await minter['commit(uint256)'] commit
    expect(gen.mint bob.address, traits, nonce).to.eventually.deep.equals tokenId: 2n
  
  it 'prevents double-mints', ->
    # NOTE: we're not testing the SC here, but that the minter interfaces with it properly.
    # i.e. the order of traits matters.
    [alice, bob, charlie] = await ethers.getSigners()
    {gen, collection} = await loadFixture fixtureFreeMint
    minter1 = gen.getMinter(bob)
    minter2 = gen.getMinter(charlie)
    await gen.createMintEvent collection
    
    traits1 =
      Background: collection.getTrait 'RedBG'
      Foreground: collection.getTrait 'RedFG'
    traits2 =
      Foreground: collection.getTrait 'RedFG'
      Background: collection.getTrait 'RedBG'
    
    nonce1 = getRandomNonce()
    nonce2 = getRandomNonce()
    
    await minter1['commit(uint256)'](getCommitment traits1, nonce1)
    expect(gen.mint bob.address, traits1, nonce1).to.eventually.deep.equals tokenId: 1n
    
    await minter2['commit(uint256)'](getCommitment traits2, nonce2)
    expect(gen.mint charlie.address, traits2, nonce2).to.be.rejectedWith(/reverted with reason string 'MB1::ALREADY_MINTED'/)
