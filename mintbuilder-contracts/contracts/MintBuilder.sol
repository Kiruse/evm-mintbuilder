//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./NFT.sol";

contract MintBuilder {
  struct CommitmentInfo {
    address committer;
    address recipient;
  }
  
  address public admin;
  // MintBuilderNFT token contract
  address public nft;
  // token to be used for minting fees. if address(0), "ETH" is used.
  address public mintFeeToken;
  uint256 public mintFeeAmount;
  uint256 public startTime;
  uint256 public endTime;
  /**
   * Incremental collection ID. Whenever a collection is created, this is incremented.
   * Due to the nature of mappings in EVM, it must be used to index unique traits, as they will
   * otherwise bleed into the next collection.
   */
  uint64 public collectionId;
  /** Last claimed token ID from the current collection. */
  uint64 public lastTokenId;
  /** Commitment hash (keccak256) => (committer, recipient). To refund, must know commitment hash */
  mapping(uint256 => CommitmentInfo) public commitments;
  /** Collection ID => ordered traits hash (keccak256) => (0 = free, 1 = premint, 2 = minted) */
  mapping(uint64 => mapping(uint256 => uint8)) public traitsStatus;
  
  /**
   * A new commitment has been made.
   * 
   * We use this as ultimate failsafe: if the mint somehow becomes deadlocked we can query the
   * blockchain for this event and `adminRefund` everybody whose mint is still outstanding.
   */
  event Commitment(address committer, uint256 hash);
  
  constructor() {
    admin = msg.sender;
  }
  
  modifier onlyAdmin() {
    require(msg.sender == admin, "MB1::UNAUTHORIZED");
    _;
  }
  
  /**
   * Create a new mint event with given parameters. If `_feeToken == address(0)`, ETH is used. The
   * mint may of course also be free (save for gas fees).
   * 
   * **Important:** Does not verify that the `_feeToken` is actually an ERC20 smart contract. If the
   * wrong address is provided, `mint` will fail, and you will need to create a new mint event. In
   * that case, you probably also want to call `stop` on this contract.
   */
  function create(
    string calldata name,
    string calldata symbol,
    address _feeToken,
    uint256 _feeAmount,
    uint256 _startTime,
    uint256 _endTime
  ) onlyAdmin external
  {
    _setTimeFrame(_startTime, _endTime);
    nft = address(new MintBuilderNFT(name, symbol, address(this)));
    mintFeeToken = _feeToken;
    mintFeeAmount = _feeAmount;
    lastTokenId = 0;
  }
  
  /** Stop the current mint event. */
  function stop() onlyAdmin external {
    endTime = block.timestamp;
  }
  
  /** Restart the current mint event, supplying a new time frame if wanted. */
  function restart(uint256 _startTime, uint256 _endTime) onlyAdmin external {
    require(collectionId != 0, "MB1::NO_COLLECTION");
    _setTimeFrame(_startTime, _endTime);
  }
  
  function _setTimeFrame(uint256 _startTime, uint256 _endTime) internal {
    require(_endTime == 0 || _endTime > block.timestamp, "MB1::INVALID_END_TIME");
    startTime = _startTime;
    endTime = _endTime;
  }
  
  /**
   * Make a commitment to a given set of traits. This commitment is verified off-chain in the
   * permissioned minter backend which generates the actual NFTs and then mints them through this
   * same contract.
   */
  function commit(uint256 hash) payable external {
    _commit(hash, msg.sender);
  }
  function commit(uint256 hash, address recipient) payable external {
    _commit(hash, recipient);
  }
  function _commit(uint256 hash, address recipient) internal {
    require(isMintActive(), "MB1::MINT_INACTIVE");
    require(commitments[hash].committer == address(0), "MB1::ALREADY_COMMITTED");
    commitments[hash] = CommitmentInfo(msg.sender, recipient);
    _verifyFunds();
    emit Commitment(msg.sender, hash);
  }
  
  /**
   * Verify that the funds have been received. When minting with ETH/MATIC, very msg.value. When
   * minting with ERC20, call `transferFrom`.
   */
  function _verifyFunds() internal {
    // we always check mint fee for ETH even if it's 0 to avoid users accidentally sending ETH to a
    // payable contract that doesn't expect it.
    if (isERC20Mint()) {
      require(msg.value != mintFeeAmount, "MB1::INVALID_MINT_FEE");
    } else if (mintFeeAmount > 0) {
      IERC20(mintFeeToken).transferFrom(msg.sender, address(this), mintFeeAmount);
    }
  }
  
  /**
   * Premint is called before the actual `mint` call, but after the permissioned backend has
   * already verified that the commitment is correct. It prevents users from refunding in the
   * meantime and thus defrauding my precious clients.
   */
  function premint(uint256 traithash) onlyAdmin external {
    require(traitsStatus[collectionId][traithash] < 2, "MB1::TRAITS_ALREADY_MINTED");
    traitsStatus[collectionId][traithash] = 1;
  }
  
  /**
   * Mint the next NFT to the given address. Assumes metadata & image have already been uploaded somewhere.
   * **Note** that this does not verify commitment, but always clears it.
   * @param traithash The hash of the traits of the NFT. Used to ascertain uniqueness.
   * @param to The address which will receive the NFT.
    * @param metadataURL The URL where the metadata for this NFT can be found.
   */
  function mint(uint256 commitment, uint256 traithash, address to, string calldata metadataURL) onlyAdmin external {
    // preminting prevents out-of-order refund exploit
    require(traitsStatus[collectionId][traithash] == 1, "MB1::TRAITS_NOT_PREMINTED");
    traitsStatus[collectionId][traithash] = 2;
    lastTokenId += 1;
    delete commitments[commitment];
    MintBuilderNFT(nft).mint(to, lastTokenId, metadataURL);
  }
  
  /**
   * This method is called when the permissioned backend fails or refuses to mint the NFT
   * corresponding to this commitment. This can happen when the desired trait combination has
   * already been minted, or is invalid altogether.
   */
  function adminRefund(uint256 commitment) onlyAdmin external {
    _refund(commitment);
  }
  /**
   * Manually refund your own commitment. However, you have to know your commitments. In the worst
   * case, you can always query the blockchain for the Commitment event to find your commitments.
   */
  function refund(uint256 commitment) external {
    // prevent random third parties who have somehow acquired the commitment from refunding against committer's will
    // acquiring it isn't even hard, just gotta listen for the Commitment event, so this is necessary
    require(commitments[commitment].committer == msg.sender, "MB1::UNAUTHORIZED");
    // can only manually refund if the mint has not yet been preminted; admins can always refund
    require(traitsStatus[collectionId][commitment] == 0, "MB1::REFUND_INELIGIBLE");
    _refund(commitment);
  }
  function _refund(uint256 commitment) internal {
    address committer = commitments[commitment].committer;
    delete commitments[commitment];
    if (isERC20Mint()) {
      (bool success,) = payable(committer).call{value: mintFeeAmount}("");
      require(success, "MB1::REFUND_FAILED");
    } else {
      IERC20(mintFeeToken).transfer(committer, mintFeeAmount);
    }
  }
  
  /** Whether an ERC20 is used for the mint fee. */
  function isERC20Mint() public view returns (bool) {
    return mintFeeToken != address(0);
  }
  function isMintActive() public view returns (bool) {
    if (endTime > 0) {
      return block.timestamp >= startTime && block.timestamp <= endTime;
    } else {
      return block.timestamp >= startTime;
    }
  }
}
