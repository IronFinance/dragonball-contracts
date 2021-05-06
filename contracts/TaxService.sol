//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/ITaxService.sol";

contract TaxService is Ownable, ITaxService, Initializable {
    using SafeERC20 for IERC20;

    address public iron_;
    address public lottery_;
    address public prizeReservePool_;
    address public burnSteelPool_;
    address public burnDndPool_;

    uint256 public reservePoolRatio_ = 200000;  // 20%
    uint256 public burnSteelPoolRatio_ = 50000; // 50%
    uint256 public burnDndPoolRatio_ = 300000;  // 30%

    uint256 private constant PRECISION = 1e6;

    function initialize(
        address _iron,
        address _lottery,
        address _prizeReservePool,
        address _burnSteelPool,
        address _burnDndPool
    ) external initializer onlyOwner() {
        require(
            _iron != address(0) &&
            _lottery != address(0) &&
            _prizeReservePool != address(0) &&
            _burnSteelPool != address(0) &&
            _burnDndPool != address(0),
            "Contracts cannot be 0 address"
        );
        iron_ = _iron;
        lottery_ = _lottery;
        prizeReservePool_ = _prizeReservePool;
        burnSteelPool_ = _burnSteelPool;
        burnDndPool_ = _burnDndPool;
    }

    //-------------------------------------------------------------------------
    // MODIFIERS
    //-------------------------------------------------------------------------

    /**
     * @notice  Restricts to only the lottery contract.
     */
    modifier onlyLottery() {
        require(address(msg.sender) == lottery_, "Caller is not the lottery");
        _;
    }

    //==============================
    // STATE MODIFYING FUNCTIONS
    //==============================

    function setPrizeReservePool(address _prizeReservePool) external onlyOwner {
        require(_prizeReservePool != address(0), "Contracts cannot be 0 address");
        prizeReservePool_ = _prizeReservePool;
    }

    function setBurnSteelPool(address _burnSteelPool) external onlyOwner {
        require(_burnSteelPool != address(0), "Contracts cannot be 0 address");
        burnSteelPool_ = _burnSteelPool;
    }

    function setBurnDndPool(address _burnDndPool) external onlyOwner {
        require(_burnDndPool != address(0), "Contracts cannot be 0 address");
        burnDndPool_ = _burnDndPool;
    }

    function setLottery(address _lottery) external onlyOwner {
        lottery_ = _lottery;
    }

    function setDistribution(
        uint256 _reservePoolRatio,
        uint256 _burnSteelPoolRatio,
        uint256 _burnDndPoolRatio
    ) external onlyOwner {
        require(_reservePoolRatio + _burnSteelPoolRatio + _burnDndPoolRatio == PRECISION, "total must be 100%");
        reservePoolRatio_ = _reservePoolRatio;
        burnSteelPoolRatio_ = _burnSteelPoolRatio;
        burnDndPoolRatio_ = _burnDndPoolRatio;
    }

    function collect(uint256 amount) external override onlyLottery {
        uint256 _burnSteelAmount = (amount * burnSteelPoolRatio_) / PRECISION;
        uint256 _burnDndAmount = (amount * burnDndPoolRatio_) / PRECISION;
        uint256 _prizeReserve = amount - _burnSteelAmount - _burnDndAmount;

        IERC20 _iron = IERC20(iron_);
        _iron.safeTransferFrom(lottery_, address(this), amount);

        if (_prizeReserve > 0) {
            _iron.safeTransfer(prizeReservePool_, _prizeReserve);
        }

        if (_burnSteelAmount > 0) {
            _iron.safeTransfer(burnSteelPool_, _burnSteelAmount);
        }

        if (_burnDndAmount > 0) {
            _iron.safeTransfer(burnDndPool_, _burnDndAmount);
        }
    }
}
