
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/ITokenFactory.sol";
import "./ScryptexToken.sol";
import "../trading/ScryptexDEX.sol";

contract TokenFactory is ITokenFactory, Ownable, ReentrancyGuard {
    mapping(address => TokenInfo) private _tokenInfo;
    address[] private _deployedTokens;
    ScryptexDEX private _dex;

    uint8 private constant DEFAULT_DECIMALS = 18;
    uint256 private constant MIN_LIQUIDITY_ETH = 0.01 ether;

    constructor() {
        _dex = new ScryptexDEX();
    }

    function deployToken(TokenParams memory params) external nonReentrant returns (address) {
        require(bytes(params.name).length > 0, "TokenFactory: Name required");
        require(bytes(params.symbol).length > 0, "TokenFactory: Symbol required");
        require(params.totalSupply > 0, "TokenFactory: Supply must be > 0");
        require(params.creator != address(0), "TokenFactory: Invalid creator");

        // Deploy new token
        ScryptexToken token = new ScryptexToken(
            params.name,
            params.symbol,
            DEFAULT_DECIMALS,
            params.totalSupply,
            params.creator,
            "", // description - can be updated later
            ""  // logoUrl - can be updated later
        );

        address tokenAddress = address(token);

        // Store token info
        _tokenInfo[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            name: params.name,
            symbol: params.symbol,
            totalSupply: params.totalSupply,
            creator: params.creator,
            createdAt: block.timestamp,
            hasLiquidity: false
        });

        _deployedTokens.push(tokenAddress);

        emit TokenDeployed(tokenAddress, params.creator);
        return tokenAddress;
    }

    function createInitialLiquidity(address token) external payable nonReentrant {
        require(msg.value >= MIN_LIQUIDITY_ETH, "TokenFactory: Insufficient ETH");
        require(_tokenInfo[token].tokenAddress != address(0), "TokenFactory: Token not found");

        TokenInfo storage info = _tokenInfo[token];
        require(!info.hasLiquidity, "TokenFactory: Liquidity already exists");

        // Calculate token amount for liquidity (10% of total supply)
        uint256 tokenAmount = (info.totalSupply * 10) / 100;
        
        // Transfer tokens from creator to this contract
        ScryptexToken(token).transferFrom(info.creator, address(this), tokenAmount);
        
        // Approve DEX to spend tokens
        ScryptexToken(token).approve(address(_dex), tokenAmount);

        // Add liquidity to DEX
        _dex.addLiquidity{value: msg.value}(
            token,
            tokenAmount,
            tokenAmount,
            msg.value,
            info.creator,
            block.timestamp + 300
        );

        info.hasLiquidity = true;
        emit LiquidityAdded(token, msg.value, tokenAmount);
    }

    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return _tokenInfo[token];
    }

    function getAllDeployedTokens() external view returns (address[] memory) {
        return _deployedTokens;
    }

    function getDeployedTokensCount() external view returns (uint256) {
        return _deployedTokens.length;
    }

    function getDEXAddress() external view returns (address) {
        return address(_dex);
    }

    // Admin functions
    function setDEX(address newDEX) external onlyOwner {
        require(newDEX != address(0), "TokenFactory: Invalid DEX address");
        _dex = ScryptexDEX(payable(newDEX));
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "TokenFactory: Withdrawal failed");
        }
    }

    receive() external payable {}
}
