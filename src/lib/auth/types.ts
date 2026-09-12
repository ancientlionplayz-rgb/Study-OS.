export type AccountStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'blocked';
export type UserRole = 'student' | 'admin';

export interface UserAccountProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified?: boolean;
  inviteCodeUsed?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  onboardingCompleted?: boolean;
}

export interface InviteCode {
  id: string;
  code: string;
  maxUses: number;
  timesUsed: number;
  expiresAt: string | null;
  createdBy: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
}

export interface PublicStudentCard {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  grade?: string;
  weeklyConsistency: number; // 0-100%
  taskCompletionPercent: number; // 0-100%
  currentStreak: number;
  challengePoints: number;
  achievementsCount: number;
  teamId?: string;
  teamName?: string;
  teamEmblem?: string;
  skillLabTrack?: string;
  skillLabHours?: number;
  isFriend?: boolean;
  friendStatus?: 'none' | 'pending' | 'friends' | 'blocked';
}

export interface Team {
  id: string;
  name: string;
  emblem: string; // emoji or icon
  logoUrl?: string; // Uploaded custom logo URL
  motto?: string;
  description: string;
  category?: 'Academic Excellence' | 'STEM & Coding' | 'Consistency & Habit' | 'Sports & Balance' | 'General';
  teamGoal?: string;
  weeklyTargetHours?: number;
  maxMembers?: number; // default 8
  joinType?: 'open' | 'request' | 'invite_only';
  privacy?: 'public' | 'registered_only';
  tags?: string[];
  captainId: string;
  captainName: string;
  members: TeamMember[];
  weeklyScore: number;
  totalWins: number;
  achievements: string[];
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'captain' | 'member';
  joinedAt: string;
  weeklyContribution: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  teamEmblem: string;
  inviterId: string;
  inviterName: string;
  invitedUserId: string;
  invitedUsername: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  createdAt: string;
  respondedAt?: string;
}

export type FriendshipStatus = 'none' | 'pending' | 'friends' | 'blocked';

export interface PeerFriendship {
  id: string;
  userId: string;
  friendUserId: string;
  friendUsername: string;
  friendDisplayName: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  isIncoming: boolean;
  weeklyPoints: number;
  consistencyScore: number;
  currentStreak: number;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'team_invitation' | 'team_accepted' | 'challenge_started' | 'team_milestone' | 'weekly_result';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface SharedProfileSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  weeklyPoints: number;
  consistencyScore: number;
  challengeProgress: number;
  teamId?: string;
  teamName?: string;
  selectedAchievements: string[];
}
