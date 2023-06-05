import { BaseContract, ContractTransaction, ethers } from 'ethers'
import { TxFailureError } from './errors.js'

type TxCallback = () => Promise<ethers.ContractTransaction>;

export async function tx<T extends BaseContract, M extends keyof T['functions']>(
  contract: T,
  method: M,
  ...args: Parameters<T['functions'][M]>)
{
  //@ts-ignore feck it, idk what TS is bitching about...
  const tx: ContractTransaction = await contract[method](...args);
  const receipt = await tx.wait();
  if (receipt.status === 0) throw new TxFailureError(receipt);
  return {
    receipt,
    logs: receipt.logs.map((log) => contract.interface.parseLog(log)),
  };
}
