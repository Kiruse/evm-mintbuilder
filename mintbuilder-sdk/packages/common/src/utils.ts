import { BigNumber, BigNumberish } from 'ethers'
import hash from 'object-hash'
import type { Attribute } from './collection.js';
import { getWebCrypto } from './crypto-utils.cjs';

type Traits = { [traitName: string]: Attribute } | [string, Attribute][]

/** Compute the commitment keccak256 hash of the given selection of traits with the given nonce. */
export const getCommitment = (inTraits: Traits, inNonce: BigNumberish = getRandomNonce()) => {
  const traitsArray = Array.isArray(inTraits) ? inTraits : Object.entries(inTraits);
  const traits = traitsArray
    .sort(([,a], [,b]) => a.layer.index - b.layer.index)
    .map(([layer, attr]) => [layer, attr.name]);
  const nonce = BigNumber.from(inNonce).toBigInt();
  return BigInt('0x' + hash({ traits, nonce }));
}

/** Get a randomized BigInt of 256 bytes suitable for a nonce */
export function getRandomNonce() {
  const bytes = new Uint8Array(256);
  try {
    getWebCrypto().getRandomValues(bytes);
  
    let result = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
      result = (result << BigInt(8)) | BigInt(bytes[i]);
    }
    return result;
  } catch (e) {
    console.error('Failed to generate random nonce, falling back to Math.random()');
    console.error(e);
    
    let result = BigInt(0);
    for (let i = 0; i < 256; i++) {
      result = (result << BigInt(8)) | BigInt(Math.floor(Math.random() * 256));
    }
    return result;
  }
}
