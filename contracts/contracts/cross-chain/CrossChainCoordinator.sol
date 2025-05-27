
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/ICrossChain.sol";

contract CrossChainCoordinator is ICrossChain, Ownable, ReentrancyGuard {
    mapping(uint256 => ChainInfo) private _supportedChains;
    mapping(bytes32 => bool) private _processedMessages;
    mapping(address => bool) private _authorizedRelayers;
    
    uint256[] private _chainIds;
    uint256 private _messageNonce;
    
    uint256 private constant MESSAGE_VALIDITY_PERIOD = 1 hours;
    uint256 private constant MIN_SIGNATURES_REQUIRED = 1; // For testnet

    event ChainAdded(uint256 indexed chainId, ChainRole role, address coordinator);
    event ChainUpdated(uint256 indexed chainId, bool active);
    event RelayerUpdated(address indexed relayer, bool authorized);
    event MessageExecuted(bytes32 indexed messageHash, address indexed executor);

    modifier onlyAuthorizedRelayer() {
        require(_authorizedRelayers[msg.sender] || msg.sender == owner(), 
                "CrossChainCoordinator: Not authorized");
        _;
    }

    function addSupportedChain(
        uint256 chainId,
        ChainRole role,
        address coordinator
    ) external onlyOwner {
        require(coordinator != address(0), "CrossChainCoordinator: Invalid coordinator");
        require(_supportedChains[chainId].chainId == 0, "CrossChainCoordinator: Chain already exists");

        _supportedChains[chainId] = ChainInfo({
            chainId: chainId,
            role: role,
            coordinator: coordinator,
            active: true,
            lastUpdate: block.timestamp
        });

        _chainIds.push(chainId);
        emit ChainAdded(chainId, role, coordinator);
    }

    function updateChainStatus(uint256 chainId, bool active) external onlyOwner {
        require(_supportedChains[chainId].chainId != 0, "CrossChainCoordinator: Chain not found");
        
        _supportedChains[chainId].active = active;
        _supportedChains[chainId].lastUpdate = block.timestamp;
        
        emit ChainUpdated(chainId, active);
    }

    function setAuthorizedRelayer(address relayer, bool authorized) external onlyOwner {
        _authorizedRelayers[relayer] = authorized;
        emit RelayerUpdated(relayer, authorized);
    }

    function sendCrossChainMessage(uint256 targetChain, bytes memory data) external {
        require(_supportedChains[targetChain].active, "CrossChainCoordinator: Target chain not active");
        require(data.length > 0, "CrossChainCoordinator: Empty data");

        uint256 currentChainId = block.chainid;
        bytes32 messageHash = keccak256(abi.encodePacked(
            currentChainId,
            targetChain,
            msg.sender,
            data,
            _messageNonce,
            block.timestamp
        ));

        _messageNonce++;

        emit CrossChainMessageSent(currentChainId, targetChain, messageHash, data);
    }

    function processCrossChainMessage(
        CrossChainMessage memory message,
        bytes[] memory signatures
    ) external nonReentrant onlyAuthorizedRelayer {
        require(signatures.length >= MIN_SIGNATURES_REQUIRED, "CrossChainCoordinator: Insufficient signatures");
        require(block.timestamp - message.timestamp <= MESSAGE_VALIDITY_PERIOD, 
                "CrossChainCoordinator: Message expired");

        bytes32 messageHash = keccak256(abi.encodePacked(
            message.sourceChain,
            message.targetChain,
            message.sender,
            message.data,
            message.nonce,
            message.timestamp
        ));

        require(!_processedMessages[messageHash], "CrossChainCoordinator: Message already processed");
        require(message.targetChain == block.chainid, "CrossChainCoordinator: Wrong target chain");

        // Verify signatures (simplified for testnet)
        require(_verifySignatures(messageHash, signatures), "CrossChainCoordinator: Invalid signatures");

        _processedMessages[messageHash] = true;

        // Execute the cross-chain action based on message data
        bool success = _executeMessage(message);

        emit CrossChainMessageProcessed(messageHash, success);
        emit MessageExecuted(messageHash, msg.sender);
    }

    function _verifySignatures(bytes32 messageHash, bytes[] memory signatures) private view returns (bool) {
        // Simplified signature verification for testnet
        // In production, this would verify against a set of trusted validators
        for (uint256 i = 0; i < signatures.length; i++) {
            if (signatures[i].length != 65) return false;
        }
        return signatures.length >= MIN_SIGNATURES_REQUIRED;
    }

    function _executeMessage(CrossChainMessage memory message) private returns (bool) {
        // Decode and execute the cross-chain message
        // This would contain the actual business logic for cross-chain operations
        try this._processMessageData(message.data) {
            return true;
        } catch {
            return false;
        }
    }

    function _processMessageData(bytes memory data) external {
        require(msg.sender == address(this), "CrossChainCoordinator: Internal call only");
        
        // Decode and process the message data
        // This is where specific cross-chain actions would be implemented
        (string memory action, bytes memory payload) = abi.decode(data, (string, bytes));
        
        if (keccak256(bytes(action)) == keccak256(bytes("SYNC_USER_DATA"))) {
            _syncUserData(payload);
        } else if (keccak256(bytes(action)) == keccak256(bytes("SYNC_TOKEN_DATA"))) {
            _syncTokenData(payload);
        } else if (keccak256(bytes(action)) == keccak256(bytes("SYNC_QUEST_PROGRESS"))) {
            _syncQuestProgress(payload);
        }
    }

    function _syncUserData(bytes memory payload) private {
        // Implement user data synchronization
        (address user, uint256 reputation, uint256 totalActivity) = abi.decode(payload, (address, uint256, uint256));
        // Update local user data based on cross-chain information
    }

    function _syncTokenData(bytes memory payload) private {
        // Implement token data synchronization
        (address token, uint256 totalSupply, uint256 holders) = abi.decode(payload, (address, uint256, uint256));
        // Update local token registry with cross-chain data
    }

    function _syncQuestProgress(bytes memory payload) private {
        // Implement quest progress synchronization
        (address user, uint256 questId, uint256 progress) = abi.decode(payload, (address, uint256, uint256));
        // Update quest progress from other chains
    }

    // View functions
    function getSupportedChains() external view returns (ChainInfo[] memory) {
        ChainInfo[] memory chains = new ChainInfo[](_chainIds.length);
        for (uint256 i = 0; i < _chainIds.length; i++) {
            chains[i] = _supportedChains[_chainIds[i]];
        }
        return chains;
    }

    function isChainSupported(uint256 chainId) external view returns (bool) {
        return _supportedChains[chainId].chainId != 0 && _supportedChains[chainId].active;
    }

    function getChainInfo(uint256 chainId) external view returns (ChainInfo memory) {
        return _supportedChains[chainId];
    }

    function isMessageProcessed(bytes32 messageHash) external view returns (bool) {
        return _processedMessages[messageHash];
    }

    function isAuthorizedRelayer(address relayer) external view returns (bool) {
        return _authorizedRelayers[relayer];
    }

    function getCurrentNonce() external view returns (uint256) {
        return _messageNonce;
    }
}
