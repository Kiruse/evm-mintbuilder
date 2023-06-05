import type { CIDString } from 'nft.storage'
import type { Metadata } from '../types';

export interface IIPFSStorage {
  storeBlob(blob: Blob): Promise<CIDString>;
  storeNFT(image: Blob, metadata: Metadata): Promise<{ cid: CIDString, url: string }>;
  load(cid: CIDString): Promise<Uint8Array>;
  loadText(cid: CIDString): Promise<string>;
}
