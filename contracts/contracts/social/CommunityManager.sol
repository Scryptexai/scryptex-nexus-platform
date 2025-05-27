
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CommunityManager is Ownable, ReentrancyGuard {
    struct UserProfile {
        string username;
        string bio;
        string avatarUrl;
        uint256 reputation;
        uint256 joinedAt;
        bool isActive;
    }

    struct Community {
        string name;
        string description;
        address creator;
        uint256 memberCount;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => UserProfile) private _userProfiles;
    mapping(uint256 => Community) private _communities;
    mapping(uint256 => mapping(address => bool)) private _communityMembers;
    mapping(address => uint256[]) private _userCommunities;

    uint256 private _communityCounter;
    uint256 private _totalUsers;

    event UserProfileCreated(address indexed user, string username);
    event UserProfileUpdated(address indexed user);
    event CommunityCreated(uint256 indexed communityId, string name, address creator);
    event UserJoinedCommunity(address indexed user, uint256 indexed communityId);
    event UserLeftCommunity(address indexed user, uint256 indexed communityId);
    event ReputationUpdated(address indexed user, uint256 newReputation);

    function createUserProfile(
        string memory username,
        string memory bio,
        string memory avatarUrl
    ) external {
        require(bytes(username).length > 0, "CommunityManager: Username required");
        require(!_userProfiles[msg.sender].isActive, "CommunityManager: Profile already exists");

        _userProfiles[msg.sender] = UserProfile({
            username: username,
            bio: bio,
            avatarUrl: avatarUrl,
            reputation: 100, // Starting reputation
            joinedAt: block.timestamp,
            isActive: true
        });

        _totalUsers++;
        emit UserProfileCreated(msg.sender, username);
    }

    function updateUserProfile(
        string memory bio,
        string memory avatarUrl
    ) external {
        require(_userProfiles[msg.sender].isActive, "CommunityManager: Profile not found");

        UserProfile storage profile = _userProfiles[msg.sender];
        profile.bio = bio;
        profile.avatarUrl = avatarUrl;

        emit UserProfileUpdated(msg.sender);
    }

    function createCommunity(
        string memory name,
        string memory description
    ) external returns (uint256) {
        require(_userProfiles[msg.sender].isActive, "CommunityManager: Profile required");
        require(bytes(name).length > 0, "CommunityManager: Name required");

        uint256 communityId = _communityCounter++;
        
        _communities[communityId] = Community({
            name: name,
            description: description,
            creator: msg.sender,
            memberCount: 1,
            createdAt: block.timestamp,
            isActive: true
        });

        // Creator automatically joins
        _communityMembers[communityId][msg.sender] = true;
        _userCommunities[msg.sender].push(communityId);

        emit CommunityCreated(communityId, name, msg.sender);
        return communityId;
    }

    function joinCommunity(uint256 communityId) external {
        require(_userProfiles[msg.sender].isActive, "CommunityManager: Profile required");
        require(_communities[communityId].isActive, "CommunityManager: Community not found");
        require(!_communityMembers[communityId][msg.sender], "CommunityManager: Already member");

        _communityMembers[communityId][msg.sender] = true;
        _userCommunities[msg.sender].push(communityId);
        _communities[communityId].memberCount++;

        emit UserJoinedCommunity(msg.sender, communityId);
    }

    function leaveCommunity(uint256 communityId) external {
        require(_communityMembers[communityId][msg.sender], "CommunityManager: Not a member");

        _communityMembers[communityId][msg.sender] = false;
        _communities[communityId].memberCount--;

        // Remove from user's community list
        uint256[] storage userCommunities = _userCommunities[msg.sender];
        for (uint256 i = 0; i < userCommunities.length; i++) {
            if (userCommunities[i] == communityId) {
                userCommunities[i] = userCommunities[userCommunities.length - 1];
                userCommunities.pop();
                break;
            }
        }

        emit UserLeftCommunity(msg.sender, communityId);
    }

    function updateReputation(address user, uint256 newReputation) external onlyOwner {
        require(_userProfiles[user].isActive, "CommunityManager: User not found");
        
        _userProfiles[user].reputation = newReputation;
        emit ReputationUpdated(user, newReputation);
    }

    // View functions
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return _userProfiles[user];
    }

    function getCommunity(uint256 communityId) external view returns (Community memory) {
        return _communities[communityId];
    }

    function getUserCommunities(address user) external view returns (uint256[] memory) {
        return _userCommunities[user];
    }

    function isCommunityMember(uint256 communityId, address user) external view returns (bool) {
        return _communityMembers[communityId][user];
    }

    function getTotalUsers() external view returns (uint256) {
        return _totalUsers;
    }

    function getTotalCommunities() external view returns (uint256) {
        return _communityCounter;
    }
}
