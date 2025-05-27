
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICrossChain {
    enum ChainRole { TRADING, SOCIAL, DATA, GAMING }

    struct ChainInfo {
        uint256 chainId;
        ChainRole role;
        address coordinator;
        bool active;
        uint256 lastUpdate;
    }

    struct CrossChainMessage {
        uint256 sourceChain;
        uint256 targetChain;
        address sender;
        bytes data;
        uint256 nonce;
        uint256 timestamp;
    }

    event CrossChainMessageSent(
        uint256 indexed sourceChain,
        uint256 indexed targetChain,
        bytes32 indexed messageHash,
        bytes data
    );

    event CrossChainMessageProcessed(
        bytes32 indexed messageHash,
        bool success
    );

    function sendCrossChainMessage(uint256 targetChain, bytes memory data) external;
    function processCrossChainMessage(
        CrossChainMessage memory message,
        bytes[] memory signatures
    ) external;
    function getSupportedChains() external view returns (ChainInfo[] memory);
    function isChainSupported(uint256 chainId) external view returns (bool);
}
