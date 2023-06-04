{expect} = require 'chai'
{Collection} = require '../dist/collection'

describe 'Collection', ->
  it 'adds layers', ->
    collection = new Collection 'Test Collection', 'TEST'
    {imageSize} = collection
    
    collection.addLayer 'Layer 1'
    collection.addLayer 'Layer 2', [10, 10], [330, 330]
    collection.addLayer 'Layer 3'
    
    expect(collection.layers).to.have.lengthOf 3
    expect(collection.layers).to.have.deep.members [
      {name: 'Layer 1', index: 0, offset: [ 0,  0], size: imageSize,  collection, attributes: {}}
      {name: 'Layer 2', index: 1, offset: [10, 10], size: [330, 330], collection, attributes: {}}
      {name: 'Layer 3', index: 2, offset: [ 0,  0], size: imageSize,  collection, attributes: {}}
    ]
  
  it 'adds attributes', ->
    collection = new Collection 'Test Collection', 'TEST'
    {imageSize} = collection
    
    layer1 = collection.addLayer 'Some Layer'
    layer2 = collection.addLayer 'Another Layer'
    
    layer1.addAttribute 'Attribute A', Buffer.alloc(16), 10
    layer1.addAttribute 'Attribute B', Buffer.alloc(16), 20
    layer1.addAttribute 'Attribute C', Buffer.alloc(16),  1
    layer2.addAttribute 'Attribute D', Buffer.alloc(16)
    
    expect(collection.getAttributes()).to.have.lengthOf 4
    expect(Object.entries layer1.attributes).to.have.lengthOf 3
    expect(Object.entries layer2.attributes).to.have.lengthOf 1
    
    attrs = collection.getAttributes()
    expect(attrs[0]).to.include {name: 'Attribute A', limit: 10, layer: layer1}
    expect(attrs[1]).to.include {name: 'Attribute B', limit: 20, layer: layer1}
    expect(attrs[2]).to.include {name: 'Attribute C', limit:  1, layer: layer1}
    expect(attrs[3]).to.include {name: 'Attribute D', limit: -1, layer: layer2}
    
    expect(layer1.attributes).to.have.property 'Attribute A'
    expect(layer1.attributes).to.have.property 'Attribute B'
    expect(layer1.attributes).to.have.property 'Attribute C'
    expect(layer2.attributes).to.have.property 'Attribute D'
