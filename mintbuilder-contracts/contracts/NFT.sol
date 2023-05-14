//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MintBuilderNFT is ERC721 {
  address public minter;
  mapping(uint256 => string) public metadataURL;
  
  constructor(string memory name, string memory symbol, address _minter) ERC721(name, symbol) {
    minter = _minter;
  }
  
  modifier onlyMinter() {
    require(msg.sender == minter, "MBNFT1::UNAUTHORIZED");
    _;
  }
  
  function mint(address to, uint256 tokenId, string memory _metadataURL) onlyMinter public {
    _mint(to, tokenId);
    metadataURL[tokenId] = _metadataURL;
  }
  
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return metadataURL[tokenId];
  }
  
  function setMinter(address _minter) onlyMinter public {
    minter = _minter;
  }
}
