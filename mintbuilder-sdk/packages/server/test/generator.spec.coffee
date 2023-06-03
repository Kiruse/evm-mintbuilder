{MintBuilder} = require '@evm-mintbuilder/common'
{loadFixture} = require '@nomicfoundation/hardhat-network-helpers'
{default: Generator} = require '../dist/generator'
{ethers} = require 'hardhat'

MINTER_ADDRESS = '0x40946c44d2b4f1195192C0C18099d18a188BF50c'

env = (key) =>
  unless process.env[key]?
    throw Error "Missing env var: #{key}"
  process.env[key]

describe 'ArtGenerator', ->
  fixtureBase = ->
    if env('TEST_ENV') is 'testnet'
      minter = await MintBuilder.deploy()
    else
      [deployer] = await ethers.getSigners()
      minter = MintBuilder.connect MINTER_ADDRESS, deployer
    return {minter}
  
  it 'instantiates', ->
    {minter} = await loadFixture fixtureBase
    gen = Generator(
      minter.address,
    )
