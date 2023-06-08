import type { IIPFSStorage } from '@evm-mintbuilder/common/dist/types.js'
import type { Helia } from '@helia/interface'
import { unixfs, UnixFS } from '@helia/unixfs'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'
import type { CIDString } from 'nft.storage'
import { Metadata } from '../types.js'

export class MockStorage implements IIPFSStorage {
  #helia: Helia;
  #fs: UnixFS;
  
  protected constructor(helia: Helia) {
    this.#helia = helia;
    this.#fs = unixfs(helia);
  }
  
  static async create() {
    const helia = await createHelia()
    return new MockStorage(helia);
  }
  
  async storeBlob(blob: Blob): Promise<CIDString> {
    return (await this.#fs.addBytes(new Uint8Array(await blob.arrayBuffer()))).toString();
  }
  
  async storeNFT(image: Blob, metadata: Metadata): Promise<{ cid: CIDString; url: string }> {
    const bytes = new Uint8Array(await image.arrayBuffer());
    const imageCID = await this.#fs.addBytes(bytes);
    (metadata as any).image = imageCID.toString();
    const metadataCID = (await this.#fs.addFile({
      path: 'metadata.json',
      content: new TextEncoder().encode(JSON.stringify(metadata)),
      mode: 0o644,
    })).toString();
    return {
      cid: metadataCID,
      url: 'ipfs://' + metadataCID,
    }
  }
  
  async load(cid: CIDString): Promise<Uint8Array> {
    const iter = this.#fs.cat(CID.parse(cid));
    let result: Uint8Array = new Uint8Array();
    for await (const chunk of iter) {
      const old = result;
      result = new Uint8Array(old.length + chunk.length);
      result.set(old);
      result.set(chunk, old.length);
    }
    return result;
  }
  
  async loadText(cid: CIDString): Promise<string> {
    return new TextDecoder().decode(await this.load(cid));
  }
  
  async loadJson(cid: CIDString): Promise<any> {
    return JSON.parse(await this.loadText(cid));
  }
}
