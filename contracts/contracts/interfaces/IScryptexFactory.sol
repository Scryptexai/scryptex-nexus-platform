
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IScryptexFactory {
    struct PlatformConfig {
        uint256 tokenCreationFee;
        uint256 platformFeePercentage;
        address feeRecipient;
        bool paused;
    }

    struct CreateTokenParams {
        string name;
        string symbol;
        uint256 totalSupply;
        string description;
        string logoUrl;
        bool autoLiquidity;
    }

    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply
    );
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformConfigUpdated(PlatformConfig config);

    function createToken(CreateTokenParams memory params) external payable returns (address);
    function getUserTokens(address user) external view returns (address[] memory);
    function getTotalTokens() external view returns (uint256);
    function isScryptexToken(address token) external view returns (bool);
    function getPlatformConfig() external view returns (PlatformConfig memory);
}
