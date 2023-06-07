import { expect } from 'chai'
import { Collection } from '../dist/collection.js'
import { getCommitment } from '../dist/utils.js'

describe 'Utils', ->
  it 'gets commitment', ->
    collection = new Collection 'Test Collection', 'TEST'
    
    layer1 = collection.addLayer 'Background'
    layer1.addAttribute 'RedBG',   Buffer.alloc(16)
    layer1.addAttribute 'BlueBG',  Buffer.alloc(16)
    layer1.addAttribute 'GreenBG', Buffer.alloc(16)
    
    layer2 = collection.addLayer 'Foreground'
    layer2.addAttribute 'RedFG',   Buffer.alloc(16)
    layer2.addAttribute 'BlueFG',  Buffer.alloc(16)
    layer2.addAttribute 'GreenFG', Buffer.alloc(16)
    
    traits1 = [
      ['Background', collection.getTrait 'RedBG']
      ['Foreground', collection.getTrait 'RedFG']
    ]
    traits2 = [
      ['Foreground', collection.getTrait 'RedFG']
      ['Background', collection.getTrait 'RedBG']
    ]
    traits3 = [
      ['Background', collection.getTrait 'BlueBG']
      ['Foreground', collection.getTrait 'BlueFG']
    ]
    
    # same nonces, same traits, different order
    expect(getCommitment traits1, 0).to.equals getCommitment traits2, 0
    # same nonces, different traits
    expect(getCommitment traits1, 0).to.not.equals getCommitment traits3, 0
    # different nonces, same traits
    expect(getCommitment traits1).to.not.equals getCommitment traits1
