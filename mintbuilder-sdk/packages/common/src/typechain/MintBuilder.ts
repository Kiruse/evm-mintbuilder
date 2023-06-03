/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export declare namespace MintBuilder {
  export type TraitLimitStruct = {
    trait: PromiseOrValue<string>;
    limit: PromiseOrValue<BigNumberish>;
  };

  export type TraitLimitStructOutput = [string, BigNumber] & {
    trait: string;
    limit: BigNumber;
  };
}

export interface MintBuilderInterface extends utils.Interface {
  functions: {
    "admin()": FunctionFragment;
    "adminRefund(uint64,uint256)": FunctionFragment;
    "commit(uint256,address)": FunctionFragment;
    "commit(uint256)": FunctionFragment;
    "create(string,string,string,address,uint256,uint256,uint256,(string,uint64)[])": FunctionFragment;
    "endTime()": FunctionFragment;
    "eventId()": FunctionFragment;
    "events(uint64)": FunctionFragment;
    "getNFTContract()": FunctionFragment;
    "getParamsCID()": FunctionFragment;
    "isAvailable(string[])": FunctionFragment;
    "isERC20Mint(uint64)": FunctionFragment;
    "isMintActive()": FunctionFragment;
    "isMintQueued()": FunctionFragment;
    "mint(uint256,string[])": FunctionFragment;
    "refund(uint64,uint256)": FunctionFragment;
    "restart(uint256,uint256)": FunctionFragment;
    "setMetadata(uint256,string)": FunctionFragment;
    "startTime()": FunctionFragment;
    "stop()": FunctionFragment;
    "transferAdmin(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "admin"
      | "adminRefund"
      | "commit(uint256,address)"
      | "commit(uint256)"
      | "create"
      | "endTime"
      | "eventId"
      | "events"
      | "getNFTContract"
      | "getParamsCID"
      | "isAvailable"
      | "isERC20Mint"
      | "isMintActive"
      | "isMintQueued"
      | "mint"
      | "refund"
      | "restart"
      | "setMetadata"
      | "startTime"
      | "stop"
      | "transferAdmin"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "admin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "adminRefund",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "commit(uint256,address)",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "commit(uint256)",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "create",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      MintBuilder.TraitLimitStruct[]
    ]
  ): string;
  encodeFunctionData(functionFragment: "endTime", values?: undefined): string;
  encodeFunctionData(functionFragment: "eventId", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "events",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getNFTContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getParamsCID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isAvailable",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "isERC20Mint",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isMintActive",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isMintQueued",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "refund",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "restart",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMetadata",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "startTime", values?: undefined): string;
  encodeFunctionData(functionFragment: "stop", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferAdmin",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "adminRefund",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "commit(uint256,address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "commit(uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "create", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "endTime", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "eventId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "events", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getNFTContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getParamsCID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAvailable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isERC20Mint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isMintActive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isMintQueued",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "refund", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "restart", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "startTime", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stop", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferAdmin",
    data: BytesLike
  ): Result;

  events: {
    "Commitment(address,uint64,uint256)": EventFragment;
    "CreateEvent(uint64)": EventFragment;
    "Mint(address,uint64,uint256,string[])": EventFragment;
    "Refund(address,uint64,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Commitment"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CreateEvent"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Mint"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Refund"): EventFragment;
}

export interface CommitmentEventObject {
  committer: string;
  eventId: BigNumber;
  hash: BigNumber;
}
export type CommitmentEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  CommitmentEventObject
>;

export type CommitmentEventFilter = TypedEventFilter<CommitmentEvent>;

export interface CreateEventEventObject {
  eventId: BigNumber;
}
export type CreateEventEvent = TypedEvent<[BigNumber], CreateEventEventObject>;

export type CreateEventEventFilter = TypedEventFilter<CreateEventEvent>;

export interface MintEventObject {
  receiver: string;
  eventId: BigNumber;
  tokenId: BigNumber;
  traits: string[];
}
export type MintEvent = TypedEvent<
  [string, BigNumber, BigNumber, string[]],
  MintEventObject
>;

export type MintEventFilter = TypedEventFilter<MintEvent>;

export interface RefundEventObject {
  committer: string;
  eventId: BigNumber;
  hash: BigNumber;
}
export type RefundEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  RefundEventObject
>;

export type RefundEventFilter = TypedEventFilter<RefundEvent>;

export interface MintBuilder extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MintBuilderInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    admin(overrides?: CallOverrides): Promise<[string]>;

    adminRefund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "commit(uint256,address)"(
      hash: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "commit(uint256)"(
      hash: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    create(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      _paramsCID: PromiseOrValue<string>,
      _feeToken: PromiseOrValue<string>,
      _feeAmount: PromiseOrValue<BigNumberish>,
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      _traits: MintBuilder.TraitLimitStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    endTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    eventId(overrides?: CallOverrides): Promise<[BigNumber]>;

    events(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string, string, BigNumber, BigNumber] & {
        id: BigNumber;
        paramsCID: string;
        nft: string;
        feeToken: string;
        feeAmount: BigNumber;
        lastTokenId: BigNumber;
      }
    >;

    getNFTContract(overrides?: CallOverrides): Promise<[string]>;

    getParamsCID(overrides?: CallOverrides): Promise<[string]>;

    isAvailable(
      traits: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isERC20Mint(
      _eventId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isMintActive(overrides?: CallOverrides): Promise<[boolean]>;

    isMintQueued(overrides?: CallOverrides): Promise<[boolean]>;

    mint(
      commitment: PromiseOrValue<BigNumberish>,
      traits: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    refund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    restart(
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMetadata(
      tokenId: PromiseOrValue<BigNumberish>,
      url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    startTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    stop(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferAdmin(
      newAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  admin(overrides?: CallOverrides): Promise<string>;

  adminRefund(
    _eventId: PromiseOrValue<BigNumberish>,
    commitment: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "commit(uint256,address)"(
    hash: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "commit(uint256)"(
    hash: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  create(
    name: PromiseOrValue<string>,
    symbol: PromiseOrValue<string>,
    _paramsCID: PromiseOrValue<string>,
    _feeToken: PromiseOrValue<string>,
    _feeAmount: PromiseOrValue<BigNumberish>,
    _startTime: PromiseOrValue<BigNumberish>,
    _endTime: PromiseOrValue<BigNumberish>,
    _traits: MintBuilder.TraitLimitStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  endTime(overrides?: CallOverrides): Promise<BigNumber>;

  eventId(overrides?: CallOverrides): Promise<BigNumber>;

  events(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, string, string, BigNumber, BigNumber] & {
      id: BigNumber;
      paramsCID: string;
      nft: string;
      feeToken: string;
      feeAmount: BigNumber;
      lastTokenId: BigNumber;
    }
  >;

  getNFTContract(overrides?: CallOverrides): Promise<string>;

  getParamsCID(overrides?: CallOverrides): Promise<string>;

  isAvailable(
    traits: PromiseOrValue<string>[],
    overrides?: CallOverrides
  ): Promise<boolean>;

  isERC20Mint(
    _eventId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isMintActive(overrides?: CallOverrides): Promise<boolean>;

  isMintQueued(overrides?: CallOverrides): Promise<boolean>;

  mint(
    commitment: PromiseOrValue<BigNumberish>,
    traits: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  refund(
    _eventId: PromiseOrValue<BigNumberish>,
    commitment: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  restart(
    _startTime: PromiseOrValue<BigNumberish>,
    _endTime: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMetadata(
    tokenId: PromiseOrValue<BigNumberish>,
    url: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  startTime(overrides?: CallOverrides): Promise<BigNumber>;

  stop(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferAdmin(
    newAdmin: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    admin(overrides?: CallOverrides): Promise<string>;

    adminRefund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    "commit(uint256,address)"(
      hash: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    "commit(uint256)"(
      hash: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    create(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      _paramsCID: PromiseOrValue<string>,
      _feeToken: PromiseOrValue<string>,
      _feeAmount: PromiseOrValue<BigNumberish>,
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      _traits: MintBuilder.TraitLimitStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    endTime(overrides?: CallOverrides): Promise<BigNumber>;

    eventId(overrides?: CallOverrides): Promise<BigNumber>;

    events(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string, string, BigNumber, BigNumber] & {
        id: BigNumber;
        paramsCID: string;
        nft: string;
        feeToken: string;
        feeAmount: BigNumber;
        lastTokenId: BigNumber;
      }
    >;

    getNFTContract(overrides?: CallOverrides): Promise<string>;

    getParamsCID(overrides?: CallOverrides): Promise<string>;

    isAvailable(
      traits: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<boolean>;

    isERC20Mint(
      _eventId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isMintActive(overrides?: CallOverrides): Promise<boolean>;

    isMintQueued(overrides?: CallOverrides): Promise<boolean>;

    mint(
      commitment: PromiseOrValue<BigNumberish>,
      traits: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<void>;

    refund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    restart(
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMetadata(
      tokenId: PromiseOrValue<BigNumberish>,
      url: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    startTime(overrides?: CallOverrides): Promise<BigNumber>;

    stop(overrides?: CallOverrides): Promise<void>;

    transferAdmin(
      newAdmin: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Commitment(address,uint64,uint256)"(
      committer?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      hash?: null
    ): CommitmentEventFilter;
    Commitment(
      committer?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      hash?: null
    ): CommitmentEventFilter;

    "CreateEvent(uint64)"(eventId?: null): CreateEventEventFilter;
    CreateEvent(eventId?: null): CreateEventEventFilter;

    "Mint(address,uint64,uint256,string[])"(
      receiver?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      tokenId?: PromiseOrValue<BigNumberish> | null,
      traits?: null
    ): MintEventFilter;
    Mint(
      receiver?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      tokenId?: PromiseOrValue<BigNumberish> | null,
      traits?: null
    ): MintEventFilter;

    "Refund(address,uint64,uint256)"(
      committer?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      hash?: null
    ): RefundEventFilter;
    Refund(
      committer?: PromiseOrValue<string> | null,
      eventId?: PromiseOrValue<BigNumberish> | null,
      hash?: null
    ): RefundEventFilter;
  };

  estimateGas: {
    admin(overrides?: CallOverrides): Promise<BigNumber>;

    adminRefund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "commit(uint256,address)"(
      hash: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "commit(uint256)"(
      hash: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    create(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      _paramsCID: PromiseOrValue<string>,
      _feeToken: PromiseOrValue<string>,
      _feeAmount: PromiseOrValue<BigNumberish>,
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      _traits: MintBuilder.TraitLimitStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    endTime(overrides?: CallOverrides): Promise<BigNumber>;

    eventId(overrides?: CallOverrides): Promise<BigNumber>;

    events(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getNFTContract(overrides?: CallOverrides): Promise<BigNumber>;

    getParamsCID(overrides?: CallOverrides): Promise<BigNumber>;

    isAvailable(
      traits: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isERC20Mint(
      _eventId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isMintActive(overrides?: CallOverrides): Promise<BigNumber>;

    isMintQueued(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      commitment: PromiseOrValue<BigNumberish>,
      traits: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    refund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    restart(
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMetadata(
      tokenId: PromiseOrValue<BigNumberish>,
      url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    startTime(overrides?: CallOverrides): Promise<BigNumber>;

    stop(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferAdmin(
      newAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    admin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    adminRefund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "commit(uint256,address)"(
      hash: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "commit(uint256)"(
      hash: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    create(
      name: PromiseOrValue<string>,
      symbol: PromiseOrValue<string>,
      _paramsCID: PromiseOrValue<string>,
      _feeToken: PromiseOrValue<string>,
      _feeAmount: PromiseOrValue<BigNumberish>,
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      _traits: MintBuilder.TraitLimitStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    endTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    eventId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    events(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getNFTContract(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getParamsCID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isAvailable(
      traits: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isERC20Mint(
      _eventId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isMintActive(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isMintQueued(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mint(
      commitment: PromiseOrValue<BigNumberish>,
      traits: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    refund(
      _eventId: PromiseOrValue<BigNumberish>,
      commitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    restart(
      _startTime: PromiseOrValue<BigNumberish>,
      _endTime: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMetadata(
      tokenId: PromiseOrValue<BigNumberish>,
      url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    startTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stop(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferAdmin(
      newAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}