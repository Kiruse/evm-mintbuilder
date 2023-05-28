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
  
  struct Event {
    /** Unique ID of this event. */
    uint64 id;
    /** IPFS CID of the mint event parameters JSON */
    string paramsCID;
    /** MintBuilderNFT token contract */
    address nft;
    /** Token to be used for minting fees. If `address(0)`, native coin / ETH is used. */
    address feeToken;
    uint256 feeAmount;
    /** Last minted token ID. The next minted one will be this +1. */
    uint256 lastTokenId;
    /** Traits hash => minted (T/F) */
    mapping(uint256 => bool) minted;
    /** Remaining number of mints for each trait. */
    mapping(string => uint64) traitCounts;
    /** Commitment hash (keccak256) => (committer, recipient). To refund, must know commitment hash */
    mapping(uint256 => CommitmentInfo) commitments;
  }
  
  struct TraitLimit {
    string trait;
    uint64 limit;
  }
  
  address public admin;
  uint256 public startTime;
  uint256 public endTime;
  /** Incremental ID of the current event. Use to look up in `events` mapping. */
  uint64 public eventId;
  /** Collection of all minting events ever conducted through this minter. */
  mapping(uint64 => Event) public events;
  
  /** A new minting event has been created. */
  event CreateEvent(uint64 eventId);
  /**
   * A new commitment has been made.
   * 
   * We use this as ultimate failsafe: if the mint somehow becomes deadlocked we can query the
   * blockchain for this event and `adminRefund` everybody whose mint is still outstanding.
   */
  event Commitment(address committer, uint64 eventId, uint256 hash);
  /** A commitment has been refunded. */
  event Refund(address committer, uint64 eventId, uint256 hash);
  /** An NFT has been successfully minted. */
  event Mint(address receiver, uint64 eventId, uint256 tokenId);
  
  constructor() {
    admin = msg.sender;
    endTime = 1; // cannot set to 0 b/c it's special and means "unlimited"
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
    string calldata _paramsCID,
    address _feeToken,
    uint256 _feeAmount,
    uint256 _startTime,
    uint256 _endTime,
    TraitLimit[] calldata _traits
  ) onlyAdmin external
  {
    _setTimeFrame(_startTime, _endTime);
    eventId += 1;
    
    Event storage e = _getEvent();
    e.id = eventId;
    e.paramsCID = _paramsCID;
    e.nft = address(new MintBuilderNFT(name, symbol, address(this)));
    e.feeToken = _feeToken;
    e.feeAmount = _feeAmount;
    
    for (uint i = 0; i < _traits.length; ++i) {
      e.traitCounts[_traits[i].trait] = _traits[i].limit;
    }
    
    emit CreateEvent(eventId);
  }
  
  function transferAdmin(address newAdmin) onlyAdmin external {
    admin = newAdmin;
  }
  
  /** Stop the current mint event. */
  function stop() onlyAdmin external {
    endTime = block.timestamp;
  }
  
  /** Restart the current mint event, supplying a new time frame if wanted. */
  function restart(uint256 _startTime, uint256 _endTime) onlyAdmin external {
    require(eventId != 0, "MB1::NO_EVENT");
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
    Event storage e = _getEvent();
    
    require(e.commitments[hash].committer == address(0), "MB1::COMMITMENT_EXISTS");
    e.commitments[hash] = CommitmentInfo(msg.sender, recipient);
    _verifyFunds();
    emit Commitment(msg.sender, eventId, hash);
  }
  
  /**
   * Verify that the funds have been received. When minting with ETH/MATIC, very msg.value. When
   * minting with ERC20, call `transferFrom`.
   */
  function _verifyFunds() internal {
    // we always check mint fee for ETH even if it's 0 to avoid users accidentally sending ETH to a
    // payable contract that doesn't expect it.
    Event storage e = _getEvent();
    if (isERC20Mint(eventId)) {
      IERC20(e.feeToken).transferFrom(msg.sender, address(this), e.feeAmount);
    } else if (e.feeAmount > 0) {
      require(msg.value == e.feeAmount, "MB1::INVALID_MINT_FEE");
    }
  }
  
  /**
   * Mint the next NFT to the given address. Assumes metadata & image have already been uploaded somewhere.
   * **Note** that this does not verify commitment, but always clears it.
   * @param commitment The commitment hash.
   * @param traits Traits that are being minted.
   */
  function mint(uint256 commitment, string[] memory traits) onlyAdmin external {
    Event storage e = _getEvent();
    require(e.commitments[commitment].committer != address(0), "MB1::COMMITMENT_NOT_FOUND");
    uint256 traitsHash = _getTraitsHash(traits);
    
    require(!e.minted[traitsHash], "MB1::ALREADY_MINTED");
    _validateTraits(traits);
    address to = e.commitments[commitment].recipient;
    
    delete e.commitments[commitment];
    e.minted[traitsHash] = true;
    e.lastTokenId += 1;
    MintBuilderNFT(e.nft).mint(to, e.lastTokenId);
    emit Mint(to, eventId, e.lastTokenId);
  }
  
  /**
   * Because the MintBuilder is the minter of the NFT contract instances, we need this proxy method
   * to trigger it to update the metadata on the given NFT. This only works if the NFT does not yet
   * have a metadata URL.
   */
  function setMetadata(uint256 tokenId, string calldata url) onlyAdmin external {
    Event storage e = _getEvent();
    MintBuilderNFT(e.nft).setMetadata(tokenId, url);
  }
  
  /**
   * This method is called when the permissioned backend fails or refuses to mint the NFT
   * corresponding to this commitment. This can happen when the desired trait combination has
   * already been minted, or is invalid altogether.
   */
  function adminRefund(uint64 _eventId, uint256 commitment) onlyAdmin external {
    // admin can always refund, provided the commitment hasn't been minted yet, at which point it
    // is removed from the commitments mapping anyways
    _refund(_eventId, commitment);
  }
  /**
   * Manually refund your own commitment. However, you have to know your commitments. In the worst
   * case, you can always query the blockchain for the Commitment event to find your commitments.
   */
  function refund(uint64 _eventId, uint256 commitment) external {
    // prevent random third parties who have somehow acquired the commitment from refunding against committer's will
    // acquiring it isn't even hard, just gotta listen for the Commitment event, so this is necessary
    require(_getEvent().commitments[commitment].committer == msg.sender, "MB1::UNAUTHORIZED");
    _refund(_eventId, commitment);
  }
  function _refund(uint64 _eventId, uint256 commitment) internal {
    require(events[_eventId].id != 0, "MB1::EVENT_NOT_FOUND");
    Event storage e = events[_eventId];
    
    require(e.commitments[commitment].committer != address(0), "MB1::NO_COMMITMENT");
    address committer = e.commitments[commitment].committer;
    delete e.commitments[commitment];
    
    if (e.feeToken != address(0)) {
      IERC20(e.feeToken).transfer(committer, e.feeAmount);
    } else {
      (bool success,) = payable(committer).call{value: e.feeAmount}("");
      require(success, "MB1::REFUND_FAILED");
    }
    
    emit Refund(committer, _eventId, commitment);
  }
  
  /** Ascertain that each trait in `traits` still has enough minting capacity, and decrement each trait's counter. */
  function _validateTraits(string[] memory traits) internal {
    Event storage e = _getEvent();
    for (uint i = 0; i < traits.length; ++i) {
      require(e.traitCounts[traits[i]] > 0, "MB1::TRAIT_MINTED_OUT");
      e.traitCounts[traits[i]] -= 1;
    }
  }
  
  /** Whether an ERC20 is used for the mint fee. */
  function isERC20Mint(uint64 _eventId) public view returns (bool) {
    return events[_eventId].feeToken != address(0);
  }
  function isMintActive() public view returns (bool) {
    if (endTime > 0) {
      return block.timestamp >= startTime && block.timestamp <= endTime;
    } else {
      return block.timestamp >= startTime;
    }
  }
  function isAvailable(string[] calldata traits) external view returns (bool) {
    return !_getEvent().minted[_getTraitsHash(traits)];
  }
  function getNFTContract() external view returns (address) {
    return _getEvent().nft;
  }
  function getParamsCID() external view returns (string memory) {
    return _getEvent().paramsCID;
  }
  function _getEvent() internal view returns (Event storage) {
    return events[eventId];
  }
  function _getTraitsHash(string[] memory traits) internal pure returns (uint256) {
    bytes memory tmp = bytes("");
    for (uint i = 0; i < traits.length; ++i) {
      tmp = abi.encodePacked(tmp, traits[i]);
    }
    return uint256(keccak256(abi.encodePacked(tmp)));
  }
}
