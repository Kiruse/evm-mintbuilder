import type { CIDString } from 'nft.storage'
import type { Metadata } from '../types.js';

export interface StoreNFTResult {
  cid: CIDString;
  url: string;
}

export interface IIPFSStorage {
  storeBlob(blob: Blob): Promise<CIDString>;
  storeNFT(image: Blob, metadata: Metadata): Promise<StoreNFTResult>;
  load(cid: CIDString): Promise<Uint8Array>;
  loadText(cid: CIDString): Promise<string>;
  loadJson(cid: CIDString): Promise<any>;
}
