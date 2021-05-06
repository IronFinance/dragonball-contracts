// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IPrizeReservePool.sol";

contract PrizeReservePool is Ownable {
    using SafeERC20 for IERC20;
    IERC20 public iron_;
    address public lottery_;

    constructor(address _iron, address _lottery) {
        require(_iron != address(0), "!address");
        require(_lottery != address(0), "!address");
        iron_ = IERC20(_iron);
        lottery_ = _lottery;
    }

    modifier onlyLottery() {
        require(address(msg.sender) == lottery_, "Caller is not the lottery");
        _;
    }

    function setLottery(address _lottery) external onlyOwner {
        lottery_ = _lottery;
    }

    function balance() external view returns (uint256) {
        return iron_.balanceOf(address(this));
    }

    function fund(uint256 amount) external onlyLottery {
        iron_.safeTransfer(lottery_, amount);
    }
}
