import {createRequire} from 'node:module'
require = createRequire(import.meta.url)

import {MintBuilder} from '@evm-mintbuilder/common'
import {loadFixture} from '@nomicfoundation/hardhat-network-helpers'
import * as chai from 'chai'
import {default as chaiAsPromised} from 'chai-as-promised'
import {BigNumber} from 'ethers'
import {Collection} from '../dist/collection.js'
import {Generator} from '../dist/generator.js'
{ethers} = require('hardhat')

{expect} = chai
chai.use chaiAsPromised

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
    return {minter, deployer}
  
  it 'instantiates', ->
    {minter, deployer} = await loadFixture fixtureBase
    gen = await Generator.create
      contract: minter.address
      signer: deployer
      nftStorageSecret: 'TEST' # special value indicating creation of MockStorage
    
    collection = new Collection 'Test Collection', 'TEST'
    await gen.createMintEvent collection
    expect(gen.eventId).to.eventually.deep.equals BigNumber.from(1)
