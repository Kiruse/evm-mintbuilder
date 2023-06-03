export type Vector = [number, number]

/** NFT per-token metadata standard as defined by OpenSea. Note that this variant is limited to
 * `image` and does not support any of the other media types.
 */
export interface Metadata {
  /** The name of this specific NFT. */
  name: string;
  /** Description of this specific NFT. Required by nft.storage API */
  description: string;
  /** URL to external site displayed under NFT art on supporting marketplaces. */
  external_url?: string;
  /** The attributes aka traits of this NFT. The engine provides this, but provided here for further customization. */
  attributes: (StringAttribute | NumericAttribute)[];
  /** Hexadecimal color code w/o preceding '#' */
  background_color?: string;
}

export interface StringAttribute {
  /** Name of the trait group aka layer. */
  trait_type: string;
  /** Value of this trait. */
  value: string;
}

export interface NumericAttribute {
  /** Name of the trait group aka layer. */
  trait_type: string;
  /** How to display a numeric `value`. OpenSea defines `'number'`, `'boost_percentage'`,
   * `'boost_number'`, and `'date'`. See [Metadata Standards](https://docs.opensea.io/docs/metadata-standards).
   */
  display_type?: string;
  /** Value of this trait. Display can be influenced by `display_type`, but may be marketplace specific. */
  value: number;
  /** When set, OpenSea uses this as the upper limit for, eg percentage calculations. Defaults to
   * the highest value OpenSea found. May apply to other marketplaces as well.
   */
  max_value?: number;
}

export type MintResult =
  | {
      error: string;
    }
  | {
      tokenId: BigInt;
    }
