
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ActivityTracker is Ownable {
    struct UserActivity {
        uint256 tokensCreated;
        uint256 tradesExecuted;
        uint256 liquidityProvided;
        uint256 communitiesJoined;
        uint256 questsCompleted;
        uint256 totalScore;
        uint256 lastActivityTime;
        mapping(string => uint256) customMetrics;
    }

    struct FarmingMetrics {
        uint256 farmingScore;
        uint256 activityLevel;
        uint256 efficiencyRate;
        uint256 crossChainScore;
        uint256 airdropEligibility;
    }

    mapping(address => UserActivity) private _userActivities;
    mapping(address => FarmingMetrics) private _farmingMetrics;
    mapping(string => bool) private _validMetrics;
    
    address[] private _activeUsers;
    uint256 private _totalActivities;

    event ActivityRecorded(
        address indexed user,
        string activityType,
        uint256 value,
        uint256 timestamp
    );
    
    event FarmingScoreUpdated(
        address indexed user,
        uint256 farmingScore,
        uint256 airdropEligibility
    );

    constructor() {
        // Initialize valid metrics
        _validMetrics["tokens_created"] = true;
        _validMetrics["trades_executed"] = true;
        _validMetrics["liquidity_provided"] = true;
        _validMetrics["communities_joined"] = true;
        _validMetrics["quests_completed"] = true;
        _validMetrics["cross_chain_activity"] = true;
    }

    function recordActivity(
        address user,
        string memory activityType,
        uint256 value
    ) external {
        require(_validMetrics[activityType], "ActivityTracker: Invalid metric");
        
        UserActivity storage activity = _userActivities[user];
        
        // Update specific activity counters
        if (keccak256(bytes(activityType)) == keccak256(bytes("tokens_created"))) {
            activity.tokensCreated += value;
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("trades_executed"))) {
            activity.tradesExecuted += value;
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("liquidity_provided"))) {
            activity.liquidityProvided += value;
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("communities_joined"))) {
            activity.communitiesJoined += value;
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("quests_completed"))) {
            activity.questsCompleted += value;
        }

        // Update custom metrics
        activity.customMetrics[activityType] += value;
        activity.lastActivityTime = block.timestamp;

        // Update total score
        activity.totalScore += value;
        _totalActivities += value;

        // Add to active users if first activity
        if (activity.totalScore == value) {
            _activeUsers.push(user);
        }

        // Update farming metrics
        _updateFarmingMetrics(user);

        emit ActivityRecorded(user, activityType, value, block.timestamp);
    }

    function _updateFarmingMetrics(address user) private {
        UserActivity storage activity = _userActivities[user];
        FarmingMetrics storage metrics = _farmingMetrics[user];

        // Calculate farming score (weighted sum of activities)
        metrics.farmingScore = 
            (activity.tokensCreated * 100) +
            (activity.tradesExecuted * 50) +
            (activity.liquidityProvided * 75) +
            (activity.communitiesJoined * 25) +
            (activity.questsCompleted * 60);

        // Calculate activity level (based on recent activity)
        uint256 timeSinceLastActivity = block.timestamp - activity.lastActivityTime;
        if (timeSinceLastActivity < 1 days) {
            metrics.activityLevel = 100;
        } else if (timeSinceLastActivity < 7 days) {
            metrics.activityLevel = 75;
        } else if (timeSinceLastActivity < 30 days) {
            metrics.activityLevel = 50;
        } else {
            metrics.activityLevel = 25;
        }

        // Calculate efficiency rate
        if (activity.totalScore > 0) {
            metrics.efficiencyRate = (metrics.farmingScore * 100) / activity.totalScore;
            if (metrics.efficiencyRate > 100) metrics.efficiencyRate = 100;
        }

        // Calculate cross-chain score
        metrics.crossChainScore = activity.customMetrics["cross_chain_activity"] * 10;
        if (metrics.crossChainScore > 100) metrics.crossChainScore = 100;

        // Calculate airdrop eligibility
        metrics.airdropEligibility = _calculateAirdropEligibility(user);

        emit FarmingScoreUpdated(user, metrics.farmingScore, metrics.airdropEligibility);
    }

    function _calculateAirdropEligibility(address user) private view returns (uint256) {
        UserActivity storage activity = _userActivities[user];
        FarmingMetrics storage metrics = _farmingMetrics[user];

        uint256 eligibility = 0;

        // Base eligibility from activities
        if (activity.tokensCreated >= 1) eligibility += 20;
        if (activity.tradesExecuted >= 5) eligibility += 20;
        if (activity.liquidityProvided >= 1) eligibility += 20;
        if (activity.communitiesJoined >= 1) eligibility += 15;
        if (activity.questsCompleted >= 3) eligibility += 15;

        // Bonus for high activity level
        if (metrics.activityLevel >= 75) eligibility += 10;

        return eligibility > 100 ? 100 : eligibility;
    }

    // View functions
    function getUserActivity(address user) external view returns (
        uint256 tokensCreated,
        uint256 tradesExecuted,
        uint256 liquidityProvided,
        uint256 communitiesJoined,
        uint256 questsCompleted,
        uint256 totalScore,
        uint256 lastActivityTime
    ) {
        UserActivity storage activity = _userActivities[user];
        return (
            activity.tokensCreated,
            activity.tradesExecuted,
            activity.liquidityProvided,
            activity.communitiesJoined,
            activity.questsCompleted,
            activity.totalScore,
            activity.lastActivityTime
        );
    }

    function getFarmingMetrics(address user) external view returns (FarmingMetrics memory) {
        return _farmingMetrics[user];
    }

    function getUserCustomMetric(address user, string memory metric) external view returns (uint256) {
        return _userActivities[user].customMetrics[metric];
    }

    function getActiveUsersCount() external view returns (uint256) {
        return _activeUsers.length;
    }

    function getTotalActivities() external view returns (uint256) {
        return _totalActivities;
    }

    // Admin functions
    function addValidMetric(string memory metric) external onlyOwner {
        _validMetrics[metric] = true;
    }

    function removeValidMetric(string memory metric) external onlyOwner {
        _validMetrics[metric] = false;
    }
}
