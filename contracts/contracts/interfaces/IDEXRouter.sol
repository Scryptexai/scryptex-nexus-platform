
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDEXRouter {
    struct LiquidityPool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
        uint256 lastUpdate;
    }

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event LiquidityAdded(
        address indexed user,
        address indexed token,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 liquidity
    );

    function swapExactETHForTokens(
        address token,
        uint256 minTokens,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        address token,
        uint256 amount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function addLiquidity(
        address token,
        uint256 tokenAmount,
        uint256 minTokenAmount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);

    function removeLiquidity(
        address token,
        uint256 liquidity,
        uint256 minTokenAmount,
        uint256 minETH,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external view returns (uint256[] memory amounts);

    function getPool(address tokenA, address tokenB) external view returns (LiquidityPool memory);
}
