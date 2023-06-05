import axios from 'axios'
import { CIDString, NFTStorage } from 'nft.storage'
import type { Metadata } from '../types'
import type { IIPFSStorage } from './interface'

export class NFTStorageWrapper implements IIPFSStorage {
  #instance: NFTStorage;
  
  constructor(token: string) {
    this.#instance = new NFTStorage({ token });
  }
  
  async storeBlob(blob: Blob): Promise<CIDString> {
    return await this.#instance.storeBlob(blob);
  }
  
  async storeNFT(image: Blob, metadata: Metadata): Promise<{ cid: CIDString, url: string }> {
    const token = await this.#instance.store({
      ...metadata,
      image,
    });
    return {
      cid: token.ipnft,
      url: token.url,
    };
  }
  
  async load(cid: string): Promise<Uint8Array> {
    return new Uint8Array((await axios.get(`https://${cid}.ipfs.nftstorage.link`, {responseType: 'arraybuffer'})).data);
  }
  
  async loadText(cid: string): Promise<string> {
    return (await axios.get(`https://${cid}.ipfs.nftstorage.link`)).data;
  }
}
