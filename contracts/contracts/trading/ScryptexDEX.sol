
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IDEXRouter.sol";
import "../libraries/MathUtils.sol";

contract ScryptexDEX is IDEXRouter, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using MathUtils for uint256;

    mapping(bytes32 => LiquidityPool) private _pools;
    mapping(address => mapping(address => uint256)) private _userLiquidity;
    mapping(address => bool) private _supportedTokens;
    
    uint256 private constant MINIMUM_LIQUIDITY = 10**3;
    uint256 private constant TRADING_FEE = 30; // 0.3%
    uint256 private constant FEE_DENOMINATOR = 10000;
    
    address private constant WETH = address(0); // Use address(0) for native ETH
    
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "ScryptexDEX: EXPIRED");
        _;
    }

    modifier supportedToken(address token) {
        require(_supportedTokens[token] || token == WETH, "ScryptexDEX: UNSUPPORTED_TOKEN");
        _;
    }

    function addSupportedToken(address token) external onlyOwner {
        _supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        _supportedTokens[token] = false;
    }

    function swapExactETHForTokens(
        address token,
        uint256 minTokens,
        address to,
        uint256 deadline
    ) external payable nonReentrant ensure(deadline) supportedToken(token) returns (uint256[] memory amounts) {
        require(msg.value > 0, "ScryptexDEX: INSUFFICIENT_INPUT_AMOUNT");
        require(to != address(0), "ScryptexDEX: INVALID_TO");

        bytes32 poolId = _getPoolId(WETH, token);
        LiquidityPool storage pool = _pools[poolId];
        require(pool.reserveA > 0 && pool.reserveB > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY");

        uint256 amountIn = msg.value;
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - TRADING_FEE) / FEE_DENOMINATOR;
        uint256 amountOut = _getAmountOut(amountInWithFee, pool.reserveA, pool.reserveB);
        
        require(amountOut >= minTokens, "ScryptexDEX: INSUFFICIENT_OUTPUT_AMOUNT");

        // Update reserves
        pool.reserveA += amountIn;
        pool.reserveB -= amountOut;
        pool.lastUpdate = block.timestamp;

        // Transfer tokens
        IERC20(token).safeTransfer(to, amountOut);

        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;

        emit Swap(msg.sender, WETH, token, amountIn, amountOut);
        return amounts;
    }

    function swapExactTokensForETH(
        address token,
        uint256 amount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) supportedToken(token) returns (uint256[] memory amounts) {
        require(amount > 0, "ScryptexDEX: INSUFFICIENT_INPUT_AMOUNT");
        require(to != address(0), "ScryptexDEX: INVALID_TO");

        bytes32 poolId = _getPoolId(WETH, token);
        LiquidityPool storage pool = _pools[poolId];
        require(pool.reserveA > 0 && pool.reserveB > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY");

        uint256 amountInWithFee = amount * (FEE_DENOMINATOR - TRADING_FEE) / FEE_DENOMINATOR;
        uint256 amountOut = _getAmountOut(amountInWithFee, pool.reserveB, pool.reserveA);
        
        require(amountOut >= minETH, "ScryptexDEX: INSUFFICIENT_OUTPUT_AMOUNT");

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update reserves
        pool.reserveA -= amountOut;
        pool.reserveB += amount;
        pool.lastUpdate = block.timestamp;

        // Transfer ETH
        (bool success, ) = to.call{value: amountOut}("");
        require(success, "ScryptexDEX: ETH_TRANSFER_FAILED");

        amounts = new uint256[](2);
        amounts[0] = amount;
        amounts[1] = amountOut;

        emit Swap(msg.sender, token, WETH, amount, amountOut);
        return amounts;
    }

    function addLiquidity(
        address token,
        uint256 tokenAmount,
        uint256 minTokenAmount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external payable nonReentrant ensure(deadline) supportedToken(token) 
      returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        require(tokenAmount > 0 && msg.value > 0, "ScryptexDEX: INSUFFICIENT_AMOUNTS");

        bytes32 poolId = _getPoolId(WETH, token);
        LiquidityPool storage pool = _pools[poolId];

        if (pool.totalSupply == 0) {
            // First liquidity provision
            amountToken = tokenAmount;
            amountETH = msg.value;
            liquidity = MathUtils.sqrt(amountToken * amountETH) - MINIMUM_LIQUIDITY;
            
            pool.tokenA = WETH;
            pool.tokenB = token;
            pool.totalSupply = liquidity + MINIMUM_LIQUIDITY;
        } else {
            // Subsequent liquidity provision
            uint256 ethOptimal = _quote(tokenAmount, pool.reserveB, pool.reserveA);
            if (ethOptimal <= msg.value) {
                require(ethOptimal >= minETH, "ScryptexDEX: INSUFFICIENT_ETH_AMOUNT");
                amountToken = tokenAmount;
                amountETH = ethOptimal;
            } else {
                uint256 tokenOptimal = _quote(msg.value, pool.reserveA, pool.reserveB);
                require(tokenOptimal >= minTokenAmount, "ScryptexDEX: INSUFFICIENT_TOKEN_AMOUNT");
                amountToken = tokenOptimal;
                amountETH = msg.value;
            }
            
            liquidity = MathUtils.min(
                (amountETH * pool.totalSupply) / pool.reserveA,
                (amountToken * pool.totalSupply) / pool.reserveB
            );
        }

        require(liquidity > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY_MINTED");

        // Transfer tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amountToken);

        // Update pool
        pool.reserveA += amountETH;
        pool.reserveB += amountToken;
        pool.totalSupply += liquidity;
        pool.lastUpdate = block.timestamp;

        // Update user liquidity
        _userLiquidity[to][token] += liquidity;

        // Refund excess ETH
        if (msg.value > amountETH) {
            (bool success, ) = msg.sender.call{value: msg.value - amountETH}("");
            require(success, "ScryptexDEX: ETH_REFUND_FAILED");
        }

        emit LiquidityAdded(to, token, amountETH, amountToken, liquidity);
    }

    function removeLiquidity(
        address token,
        uint256 liquidity,
        uint256 minTokenAmount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) supportedToken(token)
      returns (uint256 amountToken, uint256 amountETH) {
        require(liquidity > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY");
        require(_userLiquidity[msg.sender][token] >= liquidity, "ScryptexDEX: INSUFFICIENT_USER_LIQUIDITY");

        bytes32 poolId = _getPoolId(WETH, token);
        LiquidityPool storage pool = _pools[poolId];
        require(pool.totalSupply > 0, "ScryptexDEX: NO_LIQUIDITY");

        amountETH = (liquidity * pool.reserveA) / pool.totalSupply;
        amountToken = (liquidity * pool.reserveB) / pool.totalSupply;

        require(amountETH >= minETH && amountToken >= minTokenAmount, 
                "ScryptexDEX: INSUFFICIENT_AMOUNTS");

        // Update pool
        pool.reserveA -= amountETH;
        pool.reserveB -= amountToken;
        pool.totalSupply -= liquidity;
        pool.lastUpdate = block.timestamp;

        // Update user liquidity
        _userLiquidity[msg.sender][token] -= liquidity;

        // Transfer assets
        IERC20(token).safeTransfer(to, amountToken);
        (bool success, ) = to.call{value: amountETH}("");
        require(success, "ScryptexDEX: ETH_TRANSFER_FAILED");
    }

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external view returns (uint256[] memory amounts) {
        require(path.length >= 2, "ScryptexDEX: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i; i < path.length - 1; i++) {
            bytes32 poolId = _getPoolId(path[i], path[i + 1]);
            LiquidityPool memory pool = _pools[poolId];
            
            if (pool.reserveA > 0 && pool.reserveB > 0) {
                amounts[i + 1] = _getAmountOut(amounts[i], pool.reserveA, pool.reserveB);
            }
        }
    }

    function getPool(address tokenA, address tokenB) external view returns (LiquidityPool memory) {
        bytes32 poolId = _getPoolId(tokenA, tokenB);
        return _pools[poolId];
    }

    function getUserLiquidity(address user, address token) external view returns (uint256) {
        return _userLiquidity[user][token];
    }

    // Internal functions
    function _getPoolId(address tokenA, address tokenB) private pure returns (bytes32) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(token0, token1));
    }

    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        private pure returns (uint256 amountOut) {
        require(amountIn > 0, "ScryptexDEX: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY");
        
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
    }

    function _quote(uint256 amountA, uint256 reserveA, uint256 reserveB)
        private pure returns (uint256 amountB) {
        require(amountA > 0, "ScryptexDEX: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "ScryptexDEX: INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }

    receive() external payable {}
}
