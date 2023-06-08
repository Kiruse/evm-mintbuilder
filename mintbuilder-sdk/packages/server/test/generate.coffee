####################################################################################################
# This is a manual test. Run it with `yarn test:generate`. 
import * as fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
require = createRequire(import.meta.url)

import { Collection, MintBuilder } from '@evm-mintbuilder/common'
import { Generator } from '../dist/generator.js'
{ ethers } = require 'hardhat'
import 'dotenv/config'

__dirname = path.dirname fileURLToPath(import.meta.url)

env = (key) =>
  if key not of process.env
    throw new Error "Missing environment variable: #{key}"
  process.env[key]

main = ->
  [alice, bob] = await ethers.getSigners()
  minter = await new MintBuilder(alice).deploy()
  
  collection = new Collection 'Test Collection', 'TEST'
  
  layerDirs = await fs.readdir "#{__dirname}/assets", { withFileTypes: true }
  for dirname in layerDirs
    continue unless dirname.isDirectory()
    dirname = dirname.name
    unless matches = dirname.match /^(\d+)-/
      throw Error "Unexpected layer directory name: #{dirname}"
    layer = collection.addLayer dirname.slice matches[0].length
    
    traitFiles = await fs.readdir "#{__dirname}/assets/#{dirname}", { withFileTypes: true }
    await Promise.all traitFiles.map (traitFile) =>
      return unless traitFile.isFile()
      await layer.loadAttribute "#{__dirname}/assets/#{dirname}/#{traitFile.name}"
  
  gen = await Generator.create
    contract: minter.address
    signer: alice
    nftStorageSecret: env('NFT_STORAGE_SECRET')
  await gen.createMintEvent collection
  
  traits1 =
    Background: collection.getTrait 'RedBG'
    Foreground: collection.getTrait 'RedFG'
  traits2 =
    Background: collection.getTrait 'BlueBG'
    Foreground: collection.getTrait 'GreenFG'
  
  await gen.generate 1, traits1
  await gen.generate 2, traits2
main().catch (err) =>
  console.error err
  process.exit 1
