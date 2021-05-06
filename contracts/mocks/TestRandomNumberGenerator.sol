//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/dev/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestRandomNumberGenerator is VRFConsumerBase, Ownable {
    bytes32 internal keyHash;
    uint256 internal fee;
    address internal requester;
    uint256 public randomResult;
    uint256 public currentLotteryId;
    bytes32 public lastRequestId;

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 lotteryId, uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(keyHash != bytes32(0), "Must have valid key hash");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        requester = msg.sender;
        currentLotteryId = lotteryId;
        lastRequestId = requestRandomness(keyHash, fee, userProvidedSeed);
        return lastRequestId;
    }

    function withdrawAllLink() external onlyOwner {
        LINK.transfer(msg.sender, LINK.balanceOf(address(this)));
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        if (lastRequestId == requestId) {
            randomResult = randomness;
        }
    }
}
