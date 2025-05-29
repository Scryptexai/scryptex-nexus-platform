
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  chains: number[]; // supported chains
  status: QuestStatus;
  startDate: Date;
  endDate?: Date;
  maxParticipants?: number;
  currentParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestCategory = 
  | 'bridge'
  | 'trading'
  | 'pump'
  | 'social'
  | 'defi'
  | 'nft'
  | 'gaming';

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestStatus = 'active' | 'completed' | 'expired' | 'disabled';

export interface QuestRequirement {
  type: RequirementType;
  target: string;
  amount?: string;
  count?: number;
  description: string;
}

export type RequirementType =
  | 'bridge_transaction'
  | 'swap_volume'
  | 'token_launch'
  | 'pump_trade'
  | 'hold_token'
  | 'social_share'
  | 'referral'
  | 'time_based';

export interface QuestReward {
  type: RewardType;
  amount: string;
  tokenAddress?: string;
  nftId?: string;
  description: string;
}

export type RewardType = 'token' | 'nft' | 'points' | 'badge' | 'title';

export interface UserQuestProgress {
  questId: string;
  userId: string;
  status: UserQuestStatus;
  progress: QuestProgress[];
  startedAt: Date;
  completedAt?: Date;
  claimedAt?: Date;
}

export type UserQuestStatus = 'not_started' | 'in_progress' | 'completed' | 'claimed';

export interface QuestProgress {
  requirementIndex: number;
  current: number;
  target: number;
  completed: boolean;
}
