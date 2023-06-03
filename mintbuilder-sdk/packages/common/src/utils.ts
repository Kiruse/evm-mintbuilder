import type { webcrypto } from 'crypto'
import { BigNumber, BigNumberish } from 'ethers'
import hash from 'object-hash'

type Traits = { [traitName: string]: string } | [string, string][]

/** Compute the commitment keccak256 hash of the given selection of traits with the given nonce. */
export const getCommitment = (traits: Traits, nonce: BigNumberish) =>
  BigInt('0x' + hash({ traits, nonce: BigNumber.from(nonce).toBigInt() }));

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

function getWebCrypto(): webcrypto.Crypto {
  const crypto = (global as any).crypto;
  if (!crypto) throw Error('no crypto instance');
  if ('webcrypto' in crypto) return crypto.webcrypto;
  return crypto;
}
