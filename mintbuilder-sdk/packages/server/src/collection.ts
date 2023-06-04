import { AddressZero } from '@ethersproject/constants'
import type { BigNumberish } from 'ethers'
import fs from 'fs/promises'
import path from 'path'
import type { Vector } from './types'

export class Collection {
  layers: Layer[] = [];
  mutuallyExclusive: Attribute[][] = [];
  feeToken = AddressZero;
  feeAmount: BigNumberish = 0;
  startTime = new Date();
  endTime = new Date(0);
  imageSize: Vector = [350, 350];
  
  protected _attrs: Record<string, Attribute> = {};
  
  constructor(public name: string, public symbol: string) {}
  
  addLayer(name: string, offset: Vector = [0, 0], size: Vector = this.imageSize): Layer {
    const layer = new Layer(this, name, this.layers.length, offset, size);
    this.layers.push(layer);
    return layer;
  }
  
  addMutuallyExclusive(...attributes: Attribute[]) {
    attributes.sort((a, b) => a.layer.index - b.layer.index);
    this.mutuallyExclusive.push(attributes);
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
}

export class Attribute {
  constructor(
    public readonly name: string,
    public readonly layer: Layer,
    public readonly image: Buffer,
    public limit: number,
  ) {}
}
