import { Signer } from '@ethersproject/abstract-signer'
import {
  IMintBuilder,
  IMintBuilderNFT,
  MintBuilder,
  MintBuilderNFT,
  SignerOrProvider,
  getCommitment,
} from '@evm-mintbuilder/common'
import { Attribute, Collection, MINT_INFINITY } from '@evm-mintbuilder/common/dist/collection.js'
import { Event } from '@evm-mintbuilder/common/dist/events.js'
import { IIPFSStorage, StoreNFTResult } from '@evm-mintbuilder/common/dist/types.js'
import { BigNumber, BigNumberish, utils } from 'ethers'
import Jimp from 'jimp'
import { Blob } from 'nft.storage'
import hash from 'object-hash'
import { CancellationError, DisconnectedError, NotConfiguredError, ShouldNotReachError, TxFailureError } from './errors.js'
import { Metadata, MintResult } from './types.js'
import { TraitLimitReachedError } from './errors.js'
import { tx } from './ethers-helpers.js'
import { MockStorage, NFTStorageWrapper } from './storage/index.js'

type Traits = Record<string, Attribute>
type CIDString = string;

export interface GeneratorConfig {
  /** Address of the MintBuilder contract */
  contract: string;
  /** The signer resembling the admin of the minter contract */
  signer: Signer;
  /** API key for nft.storage */
  nftStorageSecret: string;
}

export type MetadataStringGenerator = (collection: Collection, tokenId: bigint, traits: Traits) => string;
type GenerateEventParams = { tokenId: bigint, traits: Traits };

/** Streamlines the whole process of generating NFT art through Hashlips' ArtEngine */
export class Generator {
  #signer: Signer;
  #storage: IIPFSStorage | undefined;
  #minter: IMintBuilder | undefined;
  #nft: IMintBuilderNFT | undefined;
  #collection: Collection | undefined;
  #minted: Record<string, Traits> = {};
  #startTime = new Date();
  #endTime = new Date();
  
  /** Simplified NFT name generator. You can always listen to `'generate::metadata'` event to fully control metadata. */
  generateName: MetadataStringGenerator = (config, tokenId) => `${config.name} #${tokenId}`
  /** Simplified NFT description generator. You can always listen to `'generate::metadata'` event to fully control metadata. */
  generateDescription: MetadataStringGenerator = () => '';
  
  constructor(config: GeneratorConfig) {
    this.#signer = config.signer;
  }
  
  static async create(config: GeneratorConfig) {
    const gen = new Generator(config);
    await gen.connect(config.contract);
    
    if (config.nftStorageSecret === 'TEST')
      gen.#storage = await MockStorage.create();
    else
      gen.#storage = new NFTStorageWrapper(config.nftStorageSecret);
    
    return gen;
  }
  
  async connect(address: string) {
    this.#minter = MintBuilder.connect(address, this.#signer);
    this.#nft = MintBuilderNFT.connect(await this.#minter!.getNFTContract(), this.#signer);
    return this;
  }
  
  getLayerOfTrait(trait: string) {
    if (!this.#collection) throw new NotConfiguredError();
    for (const layer of this.#collection.layers) {
      if (trait in layer.attributes) {
        return layer;
      }
    }
  }
  
  /**
   * Check whether a mint has been queued. Should use this to restore an on-going mint from
   * chain/IPFS after a crash or so.
   */
  isMintQueued() {
    if (!this.#minter) throw new DisconnectedError();
    return this.#minter.isMintQueued();
  }
  
  isMintActive() {
    if (!this.#minter) throw new DisconnectedError();
    const now = new Date();
    // startTime of 0 indicates the mint is active indefinitely (technically, until no more mints are possible)
    if (this.#endTime.valueOf() === 0) {
      return this.#startTime <= now;
    } else {
      return this.#startTime <= now && now <= this.#endTime;
    }
  }
  
  /** Restore minting parameters from the blockchain. Can only restore which combinations & how many traits have already been minted. */
  async restore() {
    if (!this.#minter) throw new DisconnectedError();
    if ((await this.onRestoreCollection.before.emit({})).canceled) {
      console.info('restore canceled');
      return this;
    }
    this.#minted = {};
    
    // retrieve base config from blockchain + IPFS
    const getBaseConfig = async() => {
      const configCID = await this.#minter!.getParamsCID();
      this.#collection = Collection.unmarshall(await this.#storage!.loadJson(configCID));
    }
    
    // retrieve minted traits from blockchain
    const getMintedTraits = async() => {
      const filter = this.#minter!.filters.Mint(null, await this.#minter!.eventId());
      const events = await this.#minter!.queryFilter(filter);
      
      // querying events from the blockchain can take a while, so we really don't wanna have to redo this
      for (const event of events) {
        const traits = event.args[3].map(name => this.collection!.getTrait(name)) as Attribute[];
        if (traits.some(trait => !trait)) throw new ShouldNotReachError();
        
        // mark exact trait combination as minted by its hash
        const traitsObj = Object.fromEntries(traits.map(trait => {
          return [trait.layer.name, trait];
        }));
        this.#minted[hash(traitsObj)] = traitsObj;
        
        // decrement limit of all already minted traits
        for (const trait of traits) {
          if (trait.limit.lt(MINT_INFINITY) && trait.limit.gt(0)) {
            trait.limit = trait.limit.sub(1);
          }
        }
      }
    }
    
    const getNFTContract = async() => {
      this.#nft = MintBuilderNFT.connect(await this.#minter!.getNFTContract(), this.#signer);
    }
    
    const getMintTimeframe = async() => {
      const [startTime, endTime] = await Promise.all([
        this.#minter!.startTime(),
        this.#minter!.endTime(),
      ]);
      this.#startTime = new Date(startTime.toNumber());
      this.#endTime   = new Date(endTime.toNumber());
    }
    
    await Promise.all([
      getBaseConfig(),
      getNFTContract(),
      getMintTimeframe(),
    ]);
    
    await getMintedTraits();
    
    await this.onRestoreCollection.emit({}, this.#collection);
    return this;
  }
  
  /** Start a new collection with the given configuration.
   * 
   * *Note:* The collection parameters are stored on IPFS and the IPFS hash is stored on-chain.
   * This allows restoring the collection parameters after a crash.
   * 
   * *Note:* The configuration is validated & normalized. The configuration may differ after
   * calling this method.
   */
  async createMintEvent(collection: Collection) {
    if (!this.#minter) throw new DisconnectedError();
    
    const cid = await this.#storage!.storeBlob(
      new Blob(
        [JSON.stringify(Collection.marshall(collection), null, 2)],
        {type: 'application/json'}
      )
    );
    console.log('collection configuration stored on IPFS at', cid);
    if ((await this.onCreateCollection.before.emit(collection)).canceled) {
      console.info('createCollection cancelled');
      return this;
    }
    
    this.#collection = collection;
    this.#startTime = collection.startTime;
    this.#endTime = collection.endTime;
    const traits =
      collection.layers.flatMap(
        layer => Object.values(layer.attributes).map(
          attr => ({trait: attr.name, limit: attr.limit})
        )
      );
    
    const {logs} = await tx(this.#minter, 'create',
      collection.name,
      collection.symbol,
      cid,
      collection.feeToken,
      collection.feeAmount,
      Math.floor(collection.startTime.valueOf() / 1000),
      Math.floor(collection.endTime.valueOf()   / 1000),
      traits,
    );
    if (!logs.find(log => log.name === 'CreateEvent'))
      throw new Error('Failed to find CreateEvent event in transaction logs');
    
    await this.onCreateCollection.emit(collection, cid);
    return this;
  }
  
  /** Manually stop the current on-going mint event, if any. */
  async stopMintEvent() {
    if (!this.#collection) throw new NotConfiguredError();
    if (!this.#minter) throw new DisconnectedError();
    
    if ((await this.onStopCollection.before.emit(this.#collection!)).canceled) {
      console.log('stopMintEvent cancelled');
      return this;
    }
    
    await this.#minter.stop();
    await this.onStopCollection.emit(this.#collection!);
    this.#endTime = new Date();
    return this;
  }
  
  /** Restart the current mint event anew. The already minted tokens and the already consumed limits will remain. */
  async restartMintEvent(startTime = new Date(), endTime = new Date(0)) {
    if (!this.#minter) throw new DisconnectedError();
    
    if ((await this.onRestartCollection.before.emit({ startTime, endTime })).canceled) {
      console.log('restartMintEvent cancelled');
      return this;
    }
    
    await this.#minter.restart(
      Math.floor(startTime.valueOf() / 1000),
      Math.floor(endTime.valueOf() / 1000),
    );
    await this.onRestartCollection.emit({ startTime, endTime }, this.#collection!);
    this.#startTime = startTime;
    this.#endTime = endTime;
    return this;
  }
  
  /** Gets the current `MintBuilderNFT` contract interface associated with the on-going mint event. Throws if no event is configured. */
  getNFTContract(provider: SignerOrProvider) {
    if (!this.#nft) throw new NotConfiguredError();
    return this.#nft!.connect(provider);
  }
  
  getMinter(provider: SignerOrProvider) {
    if (!this.#minter) throw new NotConfiguredError();
    return this.#minter!.connect(provider);
  }
  
  /**
   * Generate & mint a single NFT with the given trait combination.
   * 
   * Before the NFT is generated & uploaded/pinned to IPFS, the wallet's on-chain commitment is
   * verified. The commitment is `keccak256(JSON.stringify(traits) + nonce.toString())`. The
   * smart contract only accepts a commitment with exact funding.
   * 
   * Because the smart contract only receives the commitment hash, it cannot verify the trait
   * combination. Thus, the minting process may fail if the trait combination is either already
   * minted, forbidden, or invalid. In this case, the commitment is reverted and the user's funds
   * are returned.
   */
  async mint(wallet: string, traits: Traits, nonce: BigNumberish): Promise<MintResult> {
    if (!this.#minter) throw new DisconnectedError();
    if (!this.#collection) throw new NotConfiguredError();
    if (Object.keys(traits).length !== this.#collection.layers.length) throw Error('invalid traits');
    
    if ((await this.onMint.before.emit({ wallet, traits })).canceled) {
      console.log('mint event cancelled');
      return { error: 'cancelled' };
    }
    
    // must be sorted to prevent double-minting the same traits
    const sortedTraits = Object.values(traits).sort((a, b) => a.layer.index - b.layer.index).map(trait => trait.name);
    
    // verify user's commitment
    const commit = getCommitment(traits, nonce);
    
    const tx = await this.#minter.mint(commit, sortedTraits);
    const receipt = await tx.wait();
    if (!receipt.status) throw new TxFailureError(receipt);
    
    // this little trick makes it safer for us to ensure the signature is correct :3 thanks typechain!
    const mintSignature: keyof IMintBuilder['filters'] = 'Mint(address,uint64,uint256,string[])';
    const [log] = receipt.logs.filter(log => log.topics[0] === utils.id(mintSignature));
    if (!log) throw Error('Mint log not found');
    
    const desc = this.#minter.interface.parseLog(log);
    const tokenId = BigNumber.from(desc.args.tokenId).toBigInt();
    
    await this.onMint.emit({ wallet, traits }, tokenId);
    return { tokenId };
  }
  
  /**
   * Generate the NFT metadata + image from the given traits. Does not verify whether the NFT is
   * already minted or forbidden.
   * 
   * Emits the `generate::image`, and `generate::metadata` events, which can be cancelled. However,
   * unlike other events, cancellation here will throw an error, because the pipeline has been
   * interrupted and a partial NFT is already minted.
   * 
   * @param traits Combination of traits to generate the NFT from.
   * @returns eventually a tuple of the generated image and its metadata.
   */
  async generate(tokenId: bigint, traits: Traits) {
    if (!this.#collection) throw new NotConfiguredError();
    this.checkLimits(traits);
    
    const _params = { tokenId, traits };
    
    // cancelling image/metadata generation events throws an error b/c the NFT is already minted,
    // but now simply missing its image/metadata
    if ((await this.onGenerate.before.emit(_params)).canceled)
      throw new CancellationError('generate');
    
    const image = await this._generateImage(_params);
    const metadata = await this._generateMetadata(_params);
    
    // cancelling image/metadata generation events throws an error b/c the NFT is already minted,
    // but now simply missing its image/metadata
    if ((await this.onGenerateMetadata.emit({ tokenId, traits })).canceled)
      throw new CancellationError('generate metadata');
    
    const token = await this.#storage!.storeNFT(image, metadata);
    
    this.#minter!.setMetadata(tokenId, token.cid);
    await this.onGenerate.emit(_params, token);
    return token;
  }
  
  protected async _generateImage(params: GenerateEventParams): Promise<Blob> {
    const { traits } = params;
    if ((await this.onGenerateImage.before.emit(params)).canceled)
      throw new CancellationError('generate image');
    
    const [width, height] = this.#collection!.imageSize;
    const image = await new Promise<Blob>((resolve, reject) => {
      new Jimp(width, height, async (err, image) => {
        if (err) reject(err);
        
        const retraits = (await Promise.all(
          Object.values(traits).map(async ({image, ...attr}) => ({
            ...attr,
            image: await Jimp.read(image),
          }))
        )).sort((a, b) => a.layer.index - b.layer.index);
        
        for (const trait of retraits) {
          if (trait.image.getWidth() !== width || trait.image.getHeight() !== height)
            trait.image.resize(width, height);
          image.blit(trait.image, ...trait.layer.size);
        }
        
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        resolve(new Blob([buffer], { type: Jimp.MIME_PNG }));
      });
    });
    
    return (await this.onGenerateImage.emit(params, image)).result!;
  }
  
  protected async _generateMetadata(params: GenerateEventParams): Promise<Metadata> {
    const { tokenId, traits } = params;
    if ((await this.onGenerateMetadata.before.emit(params)).canceled)
      throw new CancellationError('generate metadata');
    
    const metadata: Metadata = {
      name: this.generateName(this.#collection!, tokenId, traits),
      description: this.generateDescription(this.#collection!, tokenId, traits),
      attributes: Object.entries(traits).map(([layerName, attr]) => ({
        trait_type: layerName,
        value: attr.name,
      })),
    };
    
    return (await this.onGenerateMetadata.emit(params, metadata)).result!;
  }
  
  checkLimits(traits: Traits) {
    const found = Object.values(traits).find(trait => trait.limit.eq(0));
    if (found) throw new TraitLimitReachedError(found.name);
  }
  
  get eventId() {
    if (!this.#minter) throw new NotConfiguredError();
    return this.#minter.eventId();
  }
  get collection() { return this.#collection }
  get collectionId() { return this.eventId }
  
  onCreateCollection  = Event.TwoPhase<Collection, CIDString>();
  onStopCollection    = Event.TwoPhase<Collection>();
  onRestartCollection = Event.TwoPhase<{ startTime: Date, endTime: Date }, Collection>();
  onRestoreCollection = Event.TwoPhase<{}, Collection>();
  onGenerate          = Event.TwoPhase<GenerateEventParams, StoreNFTResult>();
  onGenerateImage     = Event.TwoPhase<GenerateEventParams, Blob>();
  onGenerateMetadata  = Event.TwoPhase<GenerateEventParams, Metadata>();
  onMint              = Event.TwoPhase<{ wallet: string, traits: Traits }, bigint>();
}
