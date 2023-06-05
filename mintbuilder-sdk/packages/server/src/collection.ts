import { AddressZero } from '@ethersproject/constants'
import { BigNumber, BigNumberish } from 'ethers'
import fs from 'fs/promises'
import type { CIDString } from 'nft.storage'
import path from 'path'
import type { IIPFSStorage } from './storage/interface'
import type { Vector } from './types'

export class Collection {
  layers: Layer[] = [];
  mutuallyExclusive: Attribute[][] = [];
  feeToken = AddressZero;
  feeAmount: BigNumberish = 0;
  /** Original `startTime` of this collection mint event. May differ from final `startTime` if you've manually stopped & restarted the event. */
  startTime = new Date();
  /** Original `endTime` of this collection mint event. May differ from final `endTime` if you've manually stopped & restarted the event. */
  endTime = new Date(0);
  imageSize: Vector = [350, 350];
  
  protected _attrs: Record<string, Attribute> = {};
  
  constructor(public name: string, public symbol: string) {}
  
  addLayer(name: string, offset: Vector = [0, 0], size: Vector = this.imageSize): Layer {
    const layer = new Layer(this, name, this.layers.length, offset, size);
    this.layers.push(layer);
    return layer;
  }
  
  addMutuallyExclusive(...attributes: (string | Attribute)[]) {
    const attrs = attributes.map(attr => typeof attr === 'string' ? this.getAttribute(attr) : attr) as Attribute[];
    attrs.sort((a, b) => a.layer.index - b.layer.index);
    this.mutuallyExclusive.push(attrs);
    return this;
  }
  
  getTrait(name: string) { return this.getAttribute(name) }
  getAttribute(name: string) {
    return this._attrs[name];
  }
  
  getTraits() { return this.getAttributes() }
  getAttributes() {
    return Object.values(this._attrs);
  }
  
  hasTrait(name: string) { return this.hasAttribute(name) }
  hasAttribute(name: string) {
    return this.getTrait(name) !== undefined;
  }
  
  /** Safe to IPFS */
  async save(storage: IIPFSStorage): Promise<CIDString> {
    const data = JSON.stringify(Collection.marshall(this));
    return storage.storeBlob(new Blob([data], {type: 'application/json'}));
  }
  
  static async load(storage: IIPFSStorage, cid: CIDString): Promise<Collection> {
    return Collection.unmarshall(await storage.loadJson(cid));
  }
  
  static marshall(collection: Collection) {
    return {
      name: collection.name,
      symbol: collection.symbol,
      layers: collection.layers.map(Layer.marshall),
      mutuallyExclusive: collection.mutuallyExclusive.map(group => group.map(attr => attr.name)),
      feeToken: collection.feeToken,
      feeAmount: BigNumber.from(collection.feeAmount),
      startTime: collection.startTime.toISOString(),
      endTime: collection.endTime.toISOString(),
      imageSize: collection.imageSize,
    }
  }
  
  static unmarshall(json: any): Collection {
    const collection = new Collection(json.name, json.symbol);
    
    Object.assign(collection, {
      feeToken: json.feeToken,
      feeAmount: BigNumber.from(json.feeAmount),
      startTime: new Date(json.startTime),
      endTime: new Date(json.endTime),
      imageSize: json.imageSize,
    });
    
    for (let i = 0; i < json.layers.length; i++) {
      const layer = Layer.unmarshall(json.layers[i], i, collection);
      collection.layers.push(layer);
    }
    
    for (const group of json.mutuallyExclusive) {
      const attributes = group.map((name: string) => collection.getAttribute(name));
      collection.mutuallyExclusive.push(attributes);
    }
    
    return collection;
  }
}

export class Layer {
  attributes: Record<string, Attribute> = {};
  
  constructor(
    public readonly collection: Collection,
    public readonly name: string,
    public readonly index = -1,
    public readonly offset: [number, number] = [0, 0],
    public readonly size: [number, number] = [0, 0],
  ) {}
  
  /** Add a new attribute to this layer. */
  addAttribute(name: string, image: Buffer, limit = -1) {
    if (this.collection.hasAttribute(name))
      throw new Error(`Attribute ${name} already exists in collection ${this.collection.name}`);
    const attr = new Attribute(name, this, image, limit);
    //@ts-ignore
    this.collection._attrs[name] = attr;
    this.attributes[name] = attr;
    return this;
  }
  
  /** Load the attribute from the given filepath. Assumes the file name w/o the extension is the trait's name. */
  async loadAttribute(filepath: string, limit = -1) {
    const image = await fs.readFile(filepath);
    const nameParts = path.basename(filepath).split('.');
    return this.addAttribute(nameParts.join('.'), image, limit);
  }
  
  static marshall(layer: Layer) {
    return {
      name: layer.name,
      offset: layer.offset,
      size: layer.size,
      attributes: Object.values(layer.attributes).map(Attribute.marshall),
    };
  }
  
  static unmarshall(json: any, index: number, collection: Collection) {
    const layer = new Layer(collection, json.name, index, json.offset, json.size);
    for (const attrJson of json.attributes) {
      const attr = Attribute.unmarshall(attrJson, layer);
      //@ts-ignore
      collection._attrs[attr.name] = attr;
      layer.attributes[attr.name] = attr;
    }
    return layer;
  }
}

export class Attribute {
  constructor(
    public readonly name: string,
    public readonly layer: Layer,
    public readonly image: Buffer,
    public limit: number,
  ) {}
  
  static marshall(attr: Attribute) {
    return {
      name: attr.name,
      image: attr.image.toString('base64'),
      limit: attr.limit,
    }
  }
  
  static unmarshall(json: any, layer: Layer) {
    return new Attribute(json.name, layer, Buffer.from(json.image, 'base64'), json.limit);
  }
}
