import { ContractReceipt } from "ethers";

export class MintBuilderBackendError extends Error {}

export class CancellationError extends MintBuilderBackendError {
  constructor(operation = 'Operation') {
    super(`${operation} cancelled`);
    this.name = 'CancellationError';
  }
}

export class DisconnectedError extends MintBuilderBackendError {
  constructor() {
    super('Not connected to any MintBuilder smart contract');
    this.name = 'DisconnectedError';
  }
}

export class NotConfiguredError extends MintBuilderBackendError {
  constructor() {
    super('No NFT collection configured');
    this.name = 'NotConfiguredError';
  }
}

export class TxFailureError extends MintBuilderBackendError {
  constructor(public readonly receipt: ContractReceipt) {
    super(`Transaction ${receipt.transactionHash} failed`);
    this.name = 'TxFailureError';
  }
}

export class ShouldNotReachError extends MintBuilderBackendError {
  constructor() {
    super('Assertion failure: should not reach this code path');
    this.name = 'ShouldNotReachError';
  }
}

export class TraitLimitReachedError extends MintBuilderBackendError {
  constructor(trait: string) {
    super(`Trait limit reached for ${trait}`);
    this.name = 'TraitLimitReachedError';
  }
}
