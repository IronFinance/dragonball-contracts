//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev THIS CONTRACT IS FOR TESTING PURPOSES ONLY.
 */
contract MockIRON is ERC20 {

    constructor(uint256 _supply) ERC20("IRON Stable Coin", "IRON") {
        _mint(msg.sender, _supply);
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
