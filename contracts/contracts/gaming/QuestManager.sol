
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract QuestManager is Ownable, ReentrancyGuard {
    enum QuestType { DAILY, WEEKLY, SPECIAL, ACHIEVEMENT }
    enum QuestStatus { ACTIVE, COMPLETED, EXPIRED }

    struct Quest {
        uint256 id;
        string title;
        string description;
        QuestType questType;
        uint256 reward;
        uint256 maxProgress;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string chain;
    }

    struct UserProgress {
        uint256 currentProgress;
        QuestStatus status;
        uint256 completedAt;
        bool rewardClaimed;
    }

    mapping(uint256 => Quest) private _quests;
    mapping(address => mapping(uint256 => UserProgress)) private _userProgress;
    mapping(address => uint256[]) private _userCompletedQuests;
    mapping(address => uint256) private _userTotalRewards;

    uint256 private _questCounter;
    uint256 private _totalRewardsDistributed;

    event QuestCreated(
        uint256 indexed questId,
        string title,
        QuestType questType,
        uint256 reward
    );
    
    event QuestProgressUpdated(
        address indexed user,
        uint256 indexed questId,
        uint256 progress,
        uint256 maxProgress
    );
    
    event QuestCompleted(
        address indexed user,
        uint256 indexed questId,
        uint256 reward
    );
    
    event RewardClaimed(
        address indexed user,
        uint256 indexed questId,
        uint256 amount
    );

    function createQuest(
        string memory title,
        string memory description,
        QuestType questType,
        uint256 reward,
        uint256 maxProgress,
        uint256 duration,
        string memory chain
    ) external onlyOwner returns (uint256) {
        require(bytes(title).length > 0, "QuestManager: Title required");
        require(maxProgress > 0, "QuestManager: Progress must be > 0");
        require(reward > 0, "QuestManager: Reward must be > 0");

        uint256 questId = _questCounter++;
        uint256 endTime = questType == QuestType.DAILY ? 
            block.timestamp + 1 days :
            questType == QuestType.WEEKLY ?
            block.timestamp + 7 days :
            block.timestamp + duration;

        _quests[questId] = Quest({
            id: questId,
            title: title,
            description: description,
            questType: questType,
            reward: reward,
            maxProgress: maxProgress,
            startTime: block.timestamp,
            endTime: endTime,
            isActive: true,
            chain: chain
        });

        emit QuestCreated(questId, title, questType, reward);
        return questId;
    }

    function updateQuestProgress(
        address user,
        uint256 questId,
        uint256 progressIncrement
    ) external {
        require(_quests[questId].isActive, "QuestManager: Quest not active");
        require(block.timestamp <= _quests[questId].endTime, "QuestManager: Quest expired");

        UserProgress storage progress = _userProgress[user][questId];
        require(progress.status != QuestStatus.COMPLETED, "QuestManager: Quest already completed");

        Quest storage quest = _quests[questId];
        progress.currentProgress += progressIncrement;

        if (progress.currentProgress >= quest.maxProgress) {
            progress.currentProgress = quest.maxProgress;
            progress.status = QuestStatus.COMPLETED;
            progress.completedAt = block.timestamp;
            
            _userCompletedQuests[user].push(questId);
            
            emit QuestCompleted(user, questId, quest.reward);
        }

        emit QuestProgressUpdated(user, questId, progress.currentProgress, quest.maxProgress);
    }

    function claimReward(uint256 questId) external nonReentrant {
        UserProgress storage progress = _userProgress[msg.sender][questId];
        require(progress.status == QuestStatus.COMPLETED, "QuestManager: Quest not completed");
        require(!progress.rewardClaimed, "QuestManager: Reward already claimed");

        Quest storage quest = _quests[questId];
        progress.rewardClaimed = true;
        
        _userTotalRewards[msg.sender] += quest.reward;
        _totalRewardsDistributed += quest.reward;

        // Transfer reward (this would integrate with a token contract)
        // For now, we just emit the event
        emit RewardClaimed(msg.sender, questId, quest.reward);
    }

    function batchClaimRewards(uint256[] memory questIds) external nonReentrant {
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < questIds.length; i++) {
            uint256 questId = questIds[i];
            UserProgress storage progress = _userProgress[msg.sender][questId];
            
            if (progress.status == QuestStatus.COMPLETED && !progress.rewardClaimed) {
                Quest storage quest = _quests[questId];
                progress.rewardClaimed = true;
                totalReward += quest.reward;
                
                emit RewardClaimed(msg.sender, questId, quest.reward);
            }
        }

        if (totalReward > 0) {
            _userTotalRewards[msg.sender] += totalReward;
            _totalRewardsDistributed += totalReward;
        }
    }

    // View functions
    function getQuest(uint256 questId) external view returns (Quest memory) {
        return _quests[questId];
    }

    function getUserProgress(address user, uint256 questId) external view returns (UserProgress memory) {
        return _userProgress[user][questId];
    }

    function getUserCompletedQuests(address user) external view returns (uint256[] memory) {
        return _userCompletedQuests[user];
    }

    function getUserTotalRewards(address user) external view returns (uint256) {
        return _userTotalRewards[user];
    }

    function getActiveQuests() external view returns (Quest[] memory) {
        Quest[] memory activeQuests = new Quest[](_questCounter);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < _questCounter; i++) {
            if (_quests[i].isActive && block.timestamp <= _quests[i].endTime) {
                activeQuests[activeCount] = _quests[i];
                activeCount++;
            }
        }

        // Resize array to actual count
        Quest[] memory result = new Quest[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeQuests[i];
        }

        return result;
    }

    function getTotalRewardsDistributed() external view returns (uint256) {
        return _totalRewardsDistributed;
    }

    // Admin functions
    function deactivateQuest(uint256 questId) external onlyOwner {
        _quests[questId].isActive = false;
    }

    function extendQuest(uint256 questId, uint256 additionalTime) external onlyOwner {
        require(_quests[questId].isActive, "QuestManager: Quest not active");
        _quests[questId].endTime += additionalTime;
    }

    function emergencyPause(uint256 questId) external onlyOwner {
        _quests[questId].isActive = false;
    }
}
