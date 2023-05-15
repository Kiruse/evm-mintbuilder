//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
  constructor() ERC20("TestToken", "TEST") {
    _mint(msg.sender, 10**24);
  }
}
