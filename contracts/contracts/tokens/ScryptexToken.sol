
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ScryptexToken is ERC20, Ownable, Pausable {
    uint8 private _decimals;
    uint256 private _maxSupply;
    string private _description;
    string private _logoUrl;
    address private _creator;
    uint256 private _createdAt;

    mapping(address => bool) private _isExcludedFromFees;
    uint256 private _tradingFeePercentage = 100; // 1%

    event TradingFeeUpdated(uint256 newFee);
    event ExcludedFromFees(address indexed account, bool excluded);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply,
        address creator,
        string memory description,
        string memory logoUrl
    ) ERC20(name, symbol) {
        require(creator != address(0), "ScryptexToken: Invalid creator");
        require(totalSupply > 0, "ScryptexToken: Supply must be > 0");

        _decimals = decimals_;
        _maxSupply = totalSupply;
        _description = description;
        _logoUrl = logoUrl;
        _creator = creator;
        _createdAt = block.timestamp;

        _transferOwnership(creator);
        _mint(creator, totalSupply);

        // Exclude creator from trading fees initially
        _isExcludedFromFees[creator] = true;
        _isExcludedFromFees[address(this)] = true;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function description() external view returns (string memory) {
        return _description;
    }

    function logoUrl() external view returns (string memory) {
        return _logoUrl;
    }

    function creator() external view returns (address) {
        return _creator;
    }

    function createdAt() external view returns (uint256) {
        return _createdAt;
    }

    function maxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    function tradingFeePercentage() external view returns (uint256) {
        return _tradingFeePercentage;
    }

    function isExcludedFromFees(address account) external view returns (bool) {
        return _isExcludedFromFees[account];
    }

    function _transfer(address from, address to, uint256 amount) internal virtual override {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");

        uint256 transferAmount = amount;
        
        // Apply trading fee if not excluded
        if (!_isExcludedFromFees[from] && !_isExcludedFromFees[to]) {
            uint256 feeAmount = (amount * _tradingFeePercentage) / 10000;
            if (feeAmount > 0) {
                transferAmount = amount - feeAmount;
                super._transfer(from, _creator, feeAmount); // Fee goes to creator
            }
        }

        super._transfer(from, to, transferAmount);
    }

    // Admin functions
    function updateTradingFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 500, "ScryptexToken: Fee too high"); // Max 5%
        _tradingFeePercentage = newFeePercentage;
        emit TradingFeeUpdated(newFeePercentage);
    }

    function excludeFromFees(address account, bool excluded) external onlyOwner {
        _isExcludedFromFees[account] = excluded;
        emit ExcludedFromFees(account, excluded);
    }

    function updateDescription(string memory newDescription) external onlyOwner {
        _description = newDescription;
    }

    function updateLogoUrl(string memory newLogoUrl) external onlyOwner {
        _logoUrl = newLogoUrl;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // Burn functionality
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
