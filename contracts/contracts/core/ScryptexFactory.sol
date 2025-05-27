
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IScryptexFactory.sol";
import "../tokens/TokenFactory.sol";

contract ScryptexFactory is IScryptexFactory, Ownable, ReentrancyGuard, Pausable {
    PlatformConfig private _platformConfig;
    TokenFactory private immutable _tokenFactory;
    
    mapping(address => address[]) private _userTokens;
    mapping(address => bool) private _isScryptexToken;
    mapping(address => uint256) private _tokenIndex;
    address[] private _allTokens;
    
    uint256 private _totalTokensCreated;
    uint256 private _totalFeesCollected;

    modifier onlyValidTokenParams(CreateTokenParams memory params) {
        require(bytes(params.name).length > 0, "ScryptexFactory: Name required");
        require(bytes(params.symbol).length > 0, "ScryptexFactory: Symbol required");
        require(params.totalSupply > 0, "ScryptexFactory: Supply must be > 0");
        require(params.totalSupply <= 1e12 * 1e18, "ScryptexFactory: Supply too large");
        _;
    }

    constructor(
        address initialOwner,
        uint256 tokenCreationFee,
        uint256 platformFeePercentage,
        address feeRecipient
    ) {
        require(initialOwner != address(0), "ScryptexFactory: Invalid owner");
        require(feeRecipient != address(0), "ScryptexFactory: Invalid fee recipient");
        require(platformFeePercentage <= 1000, "ScryptexFactory: Fee too high"); // Max 10%

        _transferOwnership(initialOwner);
        _tokenFactory = new TokenFactory();
        
        _platformConfig = PlatformConfig({
            tokenCreationFee: tokenCreationFee,
            platformFeePercentage: platformFeePercentage,
            feeRecipient: feeRecipient,
            paused: false
        });
    }

    function createToken(CreateTokenParams memory params)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyValidTokenParams(params)
        returns (address)
    {
        require(msg.value >= _platformConfig.tokenCreationFee, "ScryptexFactory: Insufficient fee");

        // Deploy token through TokenFactory
        TokenFactory.TokenParams memory tokenParams = TokenFactory.TokenParams({
            name: params.name,
            symbol: params.symbol,
            totalSupply: params.totalSupply,
            creator: msg.sender,
            autoLiquidity: params.autoLiquidity,
            liquidityETH: params.autoLiquidity ? msg.value - _platformConfig.tokenCreationFee : 0
        });

        address tokenAddress = _tokenFactory.deployToken(tokenParams);
        
        // Register token
        _userTokens[msg.sender].push(tokenAddress);
        _isScryptexToken[tokenAddress] = true;
        _tokenIndex[tokenAddress] = _allTokens.length;
        _allTokens.push(tokenAddress);
        
        _totalTokensCreated++;
        _totalFeesCollected += _platformConfig.tokenCreationFee;

        // Transfer creation fee
        (bool success, ) = _platformConfig.feeRecipient.call{value: _platformConfig.tokenCreationFee}("");
        require(success, "ScryptexFactory: Fee transfer failed");

        // Setup initial liquidity if requested
        if (params.autoLiquidity && tokenParams.liquidityETH > 0) {
            _tokenFactory.createInitialLiquidity{value: tokenParams.liquidityETH}(tokenAddress);
        }

        emit TokenCreated(tokenAddress, msg.sender, params.name, params.symbol, params.totalSupply);
        
        return tokenAddress;
    }

    function getUserTokens(address user) external view returns (address[] memory) {
        return _userTokens[user];
    }

    function getTotalTokens() external view returns (uint256) {
        return _allTokens.length;
    }

    function getAllTokens() external view returns (address[] memory) {
        return _allTokens;
    }

    function isScryptexToken(address token) external view returns (bool) {
        return _isScryptexToken[token];
    }

    function getPlatformConfig() external view returns (PlatformConfig memory) {
        return _platformConfig;
    }

    function getTotalFeesCollected() external view returns (uint256) {
        return _totalFeesCollected;
    }

    // Admin functions
    function updatePlatformConfig(PlatformConfig memory newConfig) external onlyOwner {
        require(newConfig.feeRecipient != address(0), "ScryptexFactory: Invalid fee recipient");
        require(newConfig.platformFeePercentage <= 1000, "ScryptexFactory: Fee too high");
        
        _platformConfig = newConfig;
        emit PlatformConfigUpdated(newConfig);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ScryptexFactory: No balance");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "ScryptexFactory: Withdrawal failed");
    }

    // Receive function for handling ETH transfers
    receive() external payable {}
}
