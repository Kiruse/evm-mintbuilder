import {createRequire} from 'node:module'
require = createRequire(import.meta.url)

import {MintBuilder} from '@evm-mintbuilder/common'
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
