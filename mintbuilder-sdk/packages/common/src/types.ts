import type { Blob, CIDString } from 'nft.storage'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

export { CIDString };
export type SignerOrProvider = Signer | Provider;

export interface StoreNFTResult {
  cid: CIDString;
  url: string;
}

export interface IIPFSStorage {
  storeBlob(blob: Blob): Promise<CIDString>;
  storeNFT(image: Blob, metadata: object): Promise<StoreNFTResult>;
  load(cid: CIDString): Promise<Uint8Array>;
  loadText(cid: CIDString): Promise<string>;
  loadJson(cid: CIDString): Promise<any>;
}
