// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BurnDndPool is Ownable {
    using SafeERC20 for IERC20;
    IERC20 public iron_;

    constructor(address _iron) {
        require(_iron != address(0), "!address");
        iron_ = IERC20(_iron);
    }
}
