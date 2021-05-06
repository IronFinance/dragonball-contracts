//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./VRFCoordinatorMock.sol";

/**
 * @dev THIS CONTRACT IS FOR TESTING PURPOSES ONLY.
 */
contract MockVRFCoordinator is VRFCoordinatorMock {
    bytes32 internal keyHash;
    uint256 internal fee;
    address internal requester;
    uint256 public randomResult;
    uint256 public currentLotteryId;

    constructor(
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFCoordinatorMock(_linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }
}
