
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITokenFactory {
    struct TokenParams {
        string name;
        string symbol;
        uint256 totalSupply;
        address creator;
        bool autoLiquidity;
        uint256 liquidityETH;
    }

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        address creator;
        uint256 createdAt;
        bool hasLiquidity;
    }

    event TokenDeployed(address indexed token, address indexed creator);
    event LiquidityAdded(address indexed token, uint256 ethAmount, uint256 tokenAmount);

    function deployToken(TokenParams memory params) external returns (address);
    function createInitialLiquidity(address token) external payable;
    function getTokenInfo(address token) external view returns (TokenInfo memory);
}
